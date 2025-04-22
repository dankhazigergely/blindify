import httpx
from app.config import SPOTIFY_API_BASE_URL

class SpotifyService:
    def __init__(self, access_token):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, method, endpoint, params=None, data=None):
        """Helper method to make requests to the Spotify API"""
        url = f"{SPOTIFY_API_BASE_URL}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            if method.lower() == "get":
                response = await client.get(url, headers=self.headers, params=params)
            elif method.lower() == "post":
                response = await client.post(url, headers=self.headers, json=data)
            elif method.lower() == "put":
                response = await client.put(url, headers=self.headers, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            if response.status_code >= 400:
                error_message = response.json().get("error", {}).get("message", "Unknown error")
                raise Exception(f"Spotify API error: {error_message} (Status: {response.status_code})")
                
            return response.json()
    
    async def get_user_profile(self):
        """Get the current user's Spotify profile"""
        return await self._make_request("GET", "/me")
    
    async def get_user_playlists(self, limit=50):
        """Get the current user's playlists"""
        playlists = []
        offset = 0
        total = None
        
        # Paginate through all playlists
        while total is None or offset < total:
            response = await self._make_request("GET", "/me/playlists", params={
                "limit": limit,
                "offset": offset
            })
            
            playlists.extend(response["items"])
            total = response["total"]
            offset += limit
            
            # If we got fewer items than requested, we're at the end
            if len(response["items"]) < limit:
                break
                
        return {
            "items": playlists,
            "total": total
        }
    
    async def get_playlist_tracks(self, playlist_id, limit=100):
        """Get all tracks from a specific playlist"""
        tracks = []
        offset = 0
        total = None
        
        # Paginate through all tracks
        while total is None or offset < total:
            response = await self._make_request("GET", f"/playlists/{playlist_id}/tracks", params={
                "limit": limit,
                "offset": offset,
                "fields": "items(track(id,name,artists(name),album(name,release_date,images))),total"
            })
            
            # Extract only the track information we need
            for item in response["items"]:
                if item["track"]:  # Some items might be None if tracks were removed
                    track = item["track"]
                    tracks.append({
                        "id": track["id"],
                        "name": track["name"],
                        "artists": [artist["name"] for artist in track["artists"]],
                        "album": {
                            "name": track["album"]["name"],
                            "release_date": track["album"]["release_date"],
                            "images": track["album"]["images"] if "images" in track["album"] else []
                        },
                        "uri": f"spotify:track:{track['id']}"
                    })
            
            total = response["total"]
            offset += limit
            
            # If we got fewer items than requested, we're at the end
            if len(response["items"]) < limit:
                break
                
        return {
            "items": tracks,
            "total": len(tracks)
        }
    
    async def get_track_details(self, track_id):
        """Get detailed information about a specific track"""
        track = await self._make_request("GET", f"/tracks/{track_id}")
        
        # Extract the year from the release date
        release_date = track["album"]["release_date"]
        release_year = release_date.split("-")[0] if release_date else "Unknown"
        
        return {
            "id": track["id"],
            "name": track["name"],
            "artists": [artist["name"] for artist in track["artists"]],
            "album": {
                "name": track["album"]["name"],
                "release_date": track["album"]["release_date"],
                "release_year": release_year,
                "images": track["album"]["images"]
            },
            "uri": f"spotify:track:{track['id']}"
        }
