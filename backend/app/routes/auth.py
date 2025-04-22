from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
import httpx
import base64
import json
from app.config import (
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
    SPOTIFY_SCOPES,
    SPOTIFY_AUTH_BASE_URL,
    TOKEN_ENCRYPTION_KEY
)
from cryptography.fernet import Fernet
import os
from urllib.parse import urlencode
from pydantic import BaseModel

router = APIRouter()

# Initialize encryption for storing refresh tokens
if not TOKEN_ENCRYPTION_KEY:
    raise ValueError("TOKEN_ENCRYPTION_KEY environment variable is not set")
cipher = Fernet(TOKEN_ENCRYPTION_KEY.encode() if isinstance(TOKEN_ENCRYPTION_KEY, str) else TOKEN_ENCRYPTION_KEY)

# Store refresh tokens temporarily (in a real app, use a database)
refresh_tokens = {}

class TokenRequest(BaseModel):
    code: str

@router.get("/login-url")
async def get_login_url():
    """Generate the Spotify authorization URL for the user to log in"""
    if not SPOTIFY_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Spotify client ID not configured")
    
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": " ".join(SPOTIFY_SCOPES),
        "show_dialog": "true"
    }
    
    auth_url = f"{SPOTIFY_AUTH_BASE_URL}/authorize?{urlencode(params)}"
    return {"login_url": auth_url}

@router.post("/token")
async def exchange_token(request: TokenRequest):
    """Exchange the authorization code for access and refresh tokens"""
    code = request.code
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Spotify credentials not configured")
    
    try:
        # Prepare the token request
        auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
        auth_bytes = auth_string.encode("ascii")
        auth_base64 = base64.b64encode(auth_bytes).decode("ascii")
        
        headers = {
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI
        }
        
        # Make the request to Spotify API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SPOTIFY_AUTH_BASE_URL}/api/token",
                headers=headers,
                data=data
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Token exchange failed")
        
        token_info = response.json()
        
        # Store the refresh token securely
        user_id = token_info.get("refresh_token")[:10]  # Use part of refresh token as identifier
        encrypted_refresh_token = cipher.encrypt(token_info["refresh_token"].encode()).decode()
        refresh_tokens[user_id] = encrypted_refresh_token
        
        # Return access token to the client
        return {
            "access_token": token_info["access_token"],
            "expires_in": token_info["expires_in"],
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to exchange token: {str(e)}")

@router.post("/refresh")
async def refresh_access_token(user_id: str):
    """Get a new access token using the stored refresh token"""
    if user_id not in refresh_tokens:
        raise HTTPException(status_code=401, detail="No refresh token found. Please log in again.")
    
    try:
        # Decrypt the refresh token
        encrypted_refresh_token = refresh_tokens[user_id]
        refresh_token = cipher.decrypt(encrypted_refresh_token.encode()).decode()
        
        # Prepare the token refresh request
        auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
        auth_bytes = auth_string.encode("ascii")
        auth_base64 = base64.b64encode(auth_bytes).decode("ascii")
        
        headers = {
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        
        # Make the request to Spotify API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SPOTIFY_AUTH_BASE_URL}/api/token",
                headers=headers,
                data=data
            )
        
        if response.status_code != 200:
            # If refresh fails, we need to reauthorize
            del refresh_tokens[user_id]
            raise HTTPException(status_code=401, detail="Refresh token expired. Please log in again.")
        
        token_info = response.json()
        
        # If a new refresh token was provided, update it
        if "refresh_token" in token_info:
            encrypted_refresh_token = cipher.encrypt(token_info["refresh_token"].encode()).decode()
            refresh_tokens[user_id] = encrypted_refresh_token
        
        return {
            "access_token": token_info["access_token"],
            "expires_in": token_info["expires_in"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh token: {str(e)}")

@router.post("/logout")
async def logout(user_id: str):
    """Remove the refresh token to log the user out"""
    if user_id in refresh_tokens:
        del refresh_tokens[user_id]
    return {"message": "Logged out successfully"}
