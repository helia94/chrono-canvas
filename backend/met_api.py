"""Metropolitan Museum of Art API service for fetching artwork images."""

import logging
import re
from typing import Optional
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1"

# Met API requires a User-Agent header
HEADERS = {
    "User-Agent": "ChronoCanvas/1.0 (Art History Education App; contact@example.com)"
}


@dataclass
class ArtworkImage:
    """Image data from Met API."""
    url: str
    thumbnail_url: str
    title: str
    artist: Optional[str]
    source_url: str


def clean_artwork_name(name: str) -> str:
    """Clean artwork name for better search results."""
    # Remove surrounding quotes
    name = re.sub(r'^["\'"]|["\'"]$', '', name)
    # Remove "by Artist Name" suffix
    name = re.sub(r'\s+by\s+.+$', '', name, flags=re.IGNORECASE)
    # Remove parenthetical notes
    name = re.sub(r'\s*\([^)]+\)\s*$', '', name)
    return name.strip()


def extract_keywords(name: str) -> str:
    """Extract key words for fallback search."""
    words = name.split()
    # Filter short words and take first 3 meaningful words
    keywords = [w for w in words if len(w) > 3][:3]
    return ' '.join(keywords)


async def search_artwork(artwork_name: str) -> Optional[ArtworkImage]:
    """
    Search Met API for an artwork image.
    
    Args:
        artwork_name: Name of the artwork to search for
        
    Returns:
        ArtworkImage if found, None otherwise
    """
    if not artwork_name:
        return None
    
    clean_name = clean_artwork_name(artwork_name)
    logger.info(f"Met API: Searching for '{clean_name}' (original: '{artwork_name}')")
    
    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
        # Try exact search first
        image = await _search_met(client, clean_name)
        
        if image:
            return image
        
        # Fallback to keyword search
        keywords = extract_keywords(clean_name)
        if keywords and keywords != clean_name:
            logger.info(f"Met API: Fallback search with keywords: {keywords}")
            return await _search_met(client, keywords)
        
        return None


async def _search_met(client: httpx.AsyncClient, query: str) -> Optional[ArtworkImage]:
    """Perform Met API search."""
    try:
        # Search for artwork - only public domain works have images available
        search_url = f"{BASE_URL}/search"
        response = await client.get(
            search_url,
            params={
                "hasImages": "true",
                "isPublicDomain": "true",  # Only public domain works have downloadable images
                "q": query
            }
        )
        response.raise_for_status()
        
        data = response.json()
        total = data.get("total", 0)
        object_ids = data.get("objectIDs")
        
        logger.info(f"Met API: Found {total} public domain results for '{query}'")
        
        if not object_ids:
            return None
        
        # Try first 10 results to find one with an image
        for object_id in object_ids[:10]:
            image = await _get_object_details(client, object_id)
            if image:
                return image
        
        return None
        
    except httpx.HTTPError as e:
        logger.warning(f"Met API search error: {e}")
        return None
    except Exception as e:
        logger.error(f"Met API unexpected error: {e}")
        return None


async def _get_object_details(client: httpx.AsyncClient, object_id: int) -> Optional[ArtworkImage]:
    """Get artwork details from Met API."""
    try:
        response = await client.get(f"{BASE_URL}/objects/{object_id}")
        response.raise_for_status()
        
        data = response.json()
        
        # Only return if there's an image (public domain works should have images)
        primary_image = data.get("primaryImage", "")
        primary_image_small = data.get("primaryImageSmall", "")
        
        if not primary_image and not primary_image_small:
            return None
        
        logger.info(f"Met API: Found image for '{data.get('title', 'Unknown')}'")
        
        return ArtworkImage(
            url=primary_image or primary_image_small,
            thumbnail_url=primary_image_small or primary_image,
            title=data.get("title", ""),
            artist=data.get("artistDisplayName") or None,
            source_url=data.get("objectURL", ""),
        )
        
    except httpx.HTTPError:
        return None
    except Exception:
        return None


async def search_artwork_images(popular_name: str, timeless_name: str, art_form: str) -> tuple[Optional[ArtworkImage], Optional[ArtworkImage]]:
    """
    Search for images for both popular and timeless artworks.
    Only searches for Visual Arts.
    
    Returns:
        Tuple of (popular_image, timeless_image)
    """
    # Only fetch images for Visual Arts
    if art_form != "Visual Arts":
        return None, None
    
    logger.info(f"Met API: Searching images for '{popular_name}' and '{timeless_name}'")
    
    popular_image = await search_artwork(popular_name)
    timeless_image = await search_artwork(timeless_name)
    
    logger.info(f"Met API: Found popular={popular_image is not None}, timeless={timeless_image is not None}")
    
    return popular_image, timeless_image
