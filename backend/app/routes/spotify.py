from fastapi import APIRouter, HTTPException, Depends, Query
from app.services.spotify_service import SpotifyService

router = APIRouter()

@router.get("/playlists")
async def get_playlists(access_token: str):
    """Get user's playlists from Spotify"""
    try:
        spotify_service = SpotifyService(access_token)
        playlists = await spotify_service.get_user_playlists()
        return playlists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch playlists: {str(e)}")

@router.get("/playlist/{playlist_id}/tracks")
async def get_playlist_tracks(playlist_id: str, access_token: str):
    """Get tracks from a specific playlist"""
    try:
        spotify_service = SpotifyService(access_token)
        tracks = await spotify_service.get_playlist_tracks(playlist_id)
        return tracks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tracks: {str(e)}")

@router.get("/track/{track_id}")
async def get_track_details(track_id: str, access_token: str):
    """Get detailed information about a specific track"""
    try:
        spotify_service = SpotifyService(access_token)
        track_details = await spotify_service.get_track_details(track_id)
        return track_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch track details: {str(e)}")

@router.get("/user")
async def get_user_profile(access_token: str):
    """Get the current user's Spotify profile"""
    try:
        spotify_service = SpotifyService(access_token)
        user_profile = await spotify_service.get_user_profile()
        return user_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {str(e)}")
