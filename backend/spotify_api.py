"""Spotify API integration for music search."""

import logging
import base64
from dataclasses import dataclass
from typing import Optional, Tuple
import httpx

from config import get_settings

logger = logging.getLogger(__name__)

# Spotify API endpoints
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"

# Cache for access token
_access_token: Optional[str] = None
_token_expires_at: float = 0


@dataclass
class SpotifyTrack:
    """Spotify track data."""
    track_id: str
    name: str
    artist: str
    album: str
    preview_url: Optional[str]  # 30-second preview MP3 URL
    embed_url: str  # Spotify embed player URL
    external_url: str  # Open in Spotify URL
    album_image_url: Optional[str]


async def _get_access_token() -> Optional[str]:
    """Get Spotify access token using Client Credentials flow."""
    global _access_token, _token_expires_at
    
    import time
    current_time = time.time()
    
    # Return cached token if still valid (with 60s buffer)
    if _access_token and current_time < _token_expires_at - 60:
        return _access_token
    
    settings = get_settings()
    
    if not settings.spotify_client_id or not settings.spotify_client_secret:
        logger.warning("Spotify credentials not configured")
        return None
    
    # Create base64-encoded credentials
    credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                SPOTIFY_TOKEN_URL,
                headers={
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
            )
            response.raise_for_status()
            data = response.json()
            
            _access_token = data["access_token"]
            _token_expires_at = current_time + data["expires_in"]
            
            logger.info("Spotify access token refreshed")
            return _access_token
            
    except Exception as e:
        logger.error(f"Failed to get Spotify access token: {e}")
        return None


def _clean_search_query(query: str) -> str:
    """Clean up the search query for better Spotify results."""
    # Remove common prefixes like "Album:" or quotes
    query = query.strip().strip('"\'')
    
    # Remove "by Artist" suffix if present (we'll search for track name)
    if " by " in query.lower():
        parts = query.lower().split(" by ")
        query = parts[0].strip()
    
    return query


async def search_track(query: str, decade: str = "") -> Optional[SpotifyTrack]:
    """
    Search for a track on Spotify.
    
    Args:
        query: Track/album name to search for
        decade: Optional decade to help narrow results (e.g., "1920")
    
    Returns:
        SpotifyTrack if found, None otherwise
    """
    token = await _get_access_token()
    if not token:
        return None
    
    clean_query = _clean_search_query(query)
    if not clean_query:
        return None
    
    # Add year range to query if decade provided
    search_query = clean_query
    if decade:
        try:
            year = int(decade)
            # Search within the decade range
            search_query = f"{clean_query} year:{year}-{year + 9}"
        except ValueError:
            pass
    
    logger.info(f"Spotify: Searching for '{search_query}'")
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                SPOTIFY_SEARCH_URL,
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "q": search_query,
                    "type": "track",
                    "limit": 5,
                },
            )
            response.raise_for_status()
            data = response.json()
            
            tracks = data.get("tracks", {}).get("items", [])
            
            if not tracks:
                # Try without year filter
                logger.info(f"Spotify: No results with year filter, trying without...")
                response = await client.get(
                    SPOTIFY_SEARCH_URL,
                    headers={"Authorization": f"Bearer {token}"},
                    params={
                        "q": clean_query,
                        "type": "track",
                        "limit": 5,
                    },
                )
                response.raise_for_status()
                data = response.json()
                tracks = data.get("tracks", {}).get("items", [])
            
            if not tracks:
                logger.info(f"Spotify: No tracks found for '{clean_query}'")
                return None
            
            # Use the first (most relevant) result
            track = tracks[0]
            track_id = track["id"]
            
            # Get album image (prefer medium size)
            album_images = track.get("album", {}).get("images", [])
            album_image_url = None
            if album_images:
                # Try to get 300x300 image, fallback to first available
                for img in album_images:
                    if img.get("height") == 300:
                        album_image_url = img["url"]
                        break
                if not album_image_url:
                    album_image_url = album_images[0]["url"]
            
            result = SpotifyTrack(
                track_id=track_id,
                name=track["name"],
                artist=", ".join(a["name"] for a in track.get("artists", [])),
                album=track.get("album", {}).get("name", ""),
                preview_url=track.get("preview_url"),
                embed_url=f"https://open.spotify.com/embed/track/{track_id}",
                external_url=track["external_urls"].get("spotify", f"https://open.spotify.com/track/{track_id}"),
                album_image_url=album_image_url,
            )
            
            logger.info(f"Spotify: Found '{result.name}' by {result.artist}")
            return result
            
    except Exception as e:
        logger.error(f"Spotify search failed: {e}")
        return None


async def search_music_tracks(
    popular_query: str,
    timeless_query: str,
    decade: str,
    art_form: str,
) -> Tuple[Optional[SpotifyTrack], Optional[SpotifyTrack]]:
    """
    Search for tracks for both popular and timeless entries.
    
    Only searches if art_form is "Music".
    
    Returns (popular_track, timeless_track).
    """
    if art_form != "Music":
        return None, None
    
    logger.info(f"Spotify: Searching tracks for '{popular_query}' and '{timeless_query}'")
    
    popular_track = await search_track(popular_query, decade)
    timeless_track = await search_track(timeless_query, decade)
    
    logger.info(f"Spotify: Found popular={popular_track is not None}, timeless={timeless_track is not None}")
    
    return popular_track, timeless_track
