from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.routes import auth, spotify

def create_app():
    app = FastAPI(title="Blindify API", description="Backend for Blindify application")
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(spotify.router, prefix="/api/spotify", tags=["Spotify"])
    
    @app.get("/")
    async def root():
        return {"message": "Welcome to Blindify API"}
    
    return app
