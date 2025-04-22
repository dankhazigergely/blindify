import os

# Spotify API settings
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:5000/callback")

# Required Spotify scopes
SPOTIFY_SCOPES = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-modify-playback-state",
    "user-read-playback-state",
    "streaming"
]

# API Base URLs
SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"
SPOTIFY_AUTH_BASE_URL = "https://accounts.spotify.com"

# Security - Generate a valid Fernet key if one isn't provided
try:
    from cryptography.fernet import Fernet
    TOKEN_ENCRYPTION_KEY = os.getenv("TOKEN_ENCRYPTION_KEY")
    if not TOKEN_ENCRYPTION_KEY:
        # Generate a new key if one isn't provided
        TOKEN_ENCRYPTION_KEY = Fernet.generate_key().decode()
except ImportError:
    TOKEN_ENCRYPTION_KEY = os.getenv("TOKEN_ENCRYPTION_KEY", "this_is_only_for_lsp_error_resolution")
