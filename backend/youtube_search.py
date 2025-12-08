"""YouTube search via Google/Perplexity to find music videos."""

import logging
import re
from dataclasses import dataclass
from typing import Optional, Tuple
import httpx

from config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class YouTubeVideo:
    """YouTube video data."""
    video_id: str
    title: str
    url: str  # Watch URL
    embed_url: str  # Embed URL for iframe


def _extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/v/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


async def search_youtube(query: str, decade: str = "") -> Optional[YouTubeVideo]:
    """
    Search for a YouTube music video using Perplexity.
    
    Args:
        query: Song/album name to search for
        decade: Decade to include in search (e.g., "1980")
    
    Returns:
        YouTubeVideo if found, None otherwise
    """
    settings = get_settings()
    
    if not settings.perplexity_api_key:
        logger.warning("Perplexity API key not configured for YouTube search")
        return None
    
    # Build search query with decade
    decade_str = f"{decade}s" if decade else ""
    search_prompt = f"""Find the official YouTube video or best quality video for: "{query}" {decade_str}

Return ONLY the YouTube URL (youtube.com or youtu.be link), nothing else.
If you can't find it, return "NONE"."""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.perplexity_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You find YouTube video URLs. Return only the URL, no explanation."
                        },
                        {"role": "user", "content": search_prompt},
                    ],
                    "max_tokens": 100,
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data["choices"][0]["message"]["content"].strip()
            
            # Check if we got a valid result
            if "NONE" in result.upper() or "youtube" not in result.lower():
                logger.info(f"YouTube: No video found for '{query}'")
                return None
            
            # Extract the URL from the response
            url_match = re.search(r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+)', result)
            if not url_match:
                logger.info(f"YouTube: Could not parse URL from response: {result}")
                return None
            
            url = url_match.group(1)
            video_id = _extract_youtube_id(url)
            
            if not video_id:
                logger.info(f"YouTube: Could not extract video ID from {url}")
                return None
            
            video = YouTubeVideo(
                video_id=video_id,
                title=query,  # We'll use the search query as title
                url=f"https://www.youtube.com/watch?v={video_id}",
                embed_url=f"https://www.youtube.com/embed/{video_id}",
            )
            
            logger.info(f"YouTube: Found video {video.video_id} for '{query}'")
            return video
            
    except Exception as e:
        logger.error(f"YouTube search failed: {e}")
        return None


async def search_music_videos(
    popular_query: str,
    timeless_query: str,
    decade: str,
    art_form: str,
) -> Tuple[Optional[YouTubeVideo], Optional[YouTubeVideo]]:
    """
    Search for YouTube videos for both popular and timeless entries.
    
    Only searches if art_form is "Music".
    
    Returns (popular_video, timeless_video).
    """
    if art_form != "Music":
        return None, None
    
    logger.info(f"YouTube: Searching videos for '{popular_query}' and '{timeless_query}' ({decade}s)")
    
    popular_video = await search_youtube(popular_query, decade)
    timeless_video = await search_youtube(timeless_query, decade)
    
    logger.info(f"YouTube: Found popular={popular_video is not None}, timeless={timeless_video is not None}")
    
    return popular_video, timeless_video

