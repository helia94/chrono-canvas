"""Background blog search - finds personal blog posts about art genres."""

import asyncio
import logging
from typing import Optional, Tuple
import httpx

from config import get_settings

logger = logging.getLogger(__name__)


async def search_personal_blog(
    genre: str,
    artists: str,
    art_form: str,
    decade: str,
    region: str,
) -> Optional[str]:
    """
    Search for a personal, heartfelt blog post about this genre.
    
    Uses Perplexity (which has web search) to find genuine personal blogs,
    not Wikipedia, not marketing sites, not databases.
    
    Returns blog URL if found, None otherwise.
    """
    settings = get_settings()
    
    if not settings.perplexity_api_key:
        logger.warning("Perplexity API key not configured for blog search")
        return None
    
    # Build search query for personal blogs
    search_query = f"""Find me ONE personal blog post (not Wikipedia, not marketing, not a database or catalog) 
where someone writes from their heart about {genre} {art_form.lower()} from {region} in the {decade}s.

I want a blog where a real person shares their personal connection to this music/art - maybe they discovered it, 
or it changed their life, or they have memories attached to it. Someone writing authentically about {artists}.

Requirements:
- Must be a personal blog or essay (Medium, Substack, personal sites, etc.)
- NOT Wikipedia, AllMusic, Discogs, or any database/catalog
- NOT marketing or promotional content
- The author should be sharing personal thoughts/feelings
- Preferably about {genre} specifically

Return ONLY the URL of the best matching blog post, nothing else. If you can't find a good personal blog, return "NONE"."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.perplexity_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",  # Has web search
                    "messages": [
                        {
                            "role": "system", 
                            "content": "You are a helpful assistant that finds personal blog posts. Return only URLs, no explanations."
                        },
                        {"role": "user", "content": search_query},
                    ],
                    "max_tokens": 200,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data["choices"][0]["message"]["content"].strip()
            
            # Check if we got a valid URL
            if result == "NONE" or not result.startswith("http"):
                logger.info(f"No personal blog found for {genre}")
                return None
            
            # Extract just the URL if there's extra text
            url = result.split()[0].strip()
            if url.startswith("http"):
                logger.info(f"Found personal blog for {genre}: {url}")
                return url
            
            return None
            
    except Exception as e:
        logger.warning(f"Blog search failed for {genre}: {e}")
        return None


async def search_blogs_background(
    popular_genre: str,
    popular_artists: str,
    timeless_genre: str,
    timeless_artists: str,
    art_form: str,
    decade: str,
    region: str,
    cache_key: Tuple[str, str, str],
) -> Tuple[Optional[str], Optional[str]]:
    """
    Search for blogs for both popular and timeless entries.
    
    This is meant to be run in the background (fire-and-forget).
    Results are saved directly to the cache.
    
    Returns (popular_blog_url, timeless_blog_url) for logging purposes.
    """
    logger.info(f"Background blog search starting for {decade}/{region}/{art_form}")
    
    # Search for both in parallel
    popular_task = search_personal_blog(popular_genre, popular_artists, art_form, decade, region)
    timeless_task = search_personal_blog(timeless_genre, timeless_artists, art_form, decade, region)
    
    popular_url, timeless_url = await asyncio.gather(popular_task, timeless_task)
    
    # Update cache with blog URLs if found
    if popular_url or timeless_url:
        try:
            from repositories import art_cache_repository

            decade_key, region_key, art_form_key = cache_key
            updated = await art_cache_repository.update_blog_urls(
                decade_key, region_key, art_form_key,
                popular_blog_url=popular_url,
                timeless_blog_url=timeless_url,
            )
            if updated:
                logger.info(f"Updated cache with blog URLs for {decade}/{region}/{art_form}")
        except Exception as e:
            logger.warning(f"Failed to update cache with blog URLs: {e}")
    
    logger.info(f"Background blog search complete: popular={popular_url is not None}, timeless={timeless_url is not None}")
    return popular_url, timeless_url


def start_background_blog_search(
    popular_genre: str,
    popular_artists: str,
    timeless_genre: str,
    timeless_artists: str,
    art_form: str,
    decade: str,
    region: str,
    cache_key: Tuple[str, str, str],
) -> None:
    """
    Fire-and-forget blog search.
    
    Starts a background task to search for personal blogs.
    Does not block the main response.
    """
    asyncio.create_task(
        search_blogs_background(
            popular_genre,
            popular_artists,
            timeless_genre,
            timeless_artists,
            art_form,
            decade,
            region,
            cache_key,
        )
    )
    logger.info(f"Started background blog search for {decade}/{region}/{art_form}")
