"""Record sales lookup using Perplexity."""

import asyncio
import logging
import re
from typing import Optional, Tuple
import httpx

from config import get_settings

logger = logging.getLogger(__name__)


async def lookup_record_sales(
    album_or_track: str,
    artist: str,
) -> Optional[str]:
    """
    Look up record sales for an album/track using Perplexity.
    
    Returns a human-readable string like "50 million copies sold" or None.
    """
    settings = get_settings()
    
    if not settings.perplexity_api_key:
        logger.warning("Perplexity API key not configured for record sales lookup")
        return None
    
    query = f"""How many copies has "{album_or_track}" by {artist} sold worldwide?

Give me just the number in a simple format like "25 million copies" or "500,000 copies".
If it's an album, give album sales. If it's a single/track, give single sales.
If you can't find exact sales data, say "UNKNOWN".
Reply with ONLY the sales figure, nothing else."""

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
                            "content": "You are a music industry data assistant. Give concise sales figures only."
                        },
                        {"role": "user", "content": query},
                    ],
                    "max_tokens": 50,
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data["choices"][0]["message"]["content"].strip()
            
            # Check if we got valid data
            if "UNKNOWN" in result.upper() or len(result) > 100:
                logger.info(f"No sales data found for {album_or_track}")
                return None
            
            # Clean up the response - extract just the number part
            # Look for patterns like "25 million", "500,000", "10M", etc.
            result = result.replace("copies sold", "").replace("copies", "").strip()
            result = re.sub(r'^(approximately|about|over|nearly|around)\s+', '', result, flags=re.IGNORECASE)
            
            if result and any(c.isdigit() for c in result):
                logger.info(f"Found sales for {album_or_track}: {result}")
                return f"{result} copies sold"
            
            return None
            
    except Exception as e:
        logger.warning(f"Record sales lookup failed for {album_or_track}: {e}")
        return None


async def lookup_sales_for_tracks(
    popular_track: str,
    popular_artist: str,
    timeless_track: str,
    timeless_artist: str,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Look up sales for both popular and timeless tracks in parallel.
    
    Returns (popular_sales, timeless_sales).
    """
    logger.info(f"Looking up record sales for: {popular_track}, {timeless_track}")
    
    popular_task = lookup_record_sales(popular_track, popular_artist)
    timeless_task = lookup_record_sales(timeless_track, timeless_artist)
    
    popular_sales, timeless_sales = await asyncio.gather(popular_task, timeless_task)
    
    return popular_sales, timeless_sales
