"""Art service - orchestrates cache and LLM layers."""

import logging
from typing import Optional

from cache import cache_layer
from llm_providers import query_all_providers
from consensus import synthesize_with_claude
from models import ArtData

logger = logging.getLogger(__name__)


class ArtService:
    """
    Main service for fetching art data.
    
    Flow:
    1. Check cache for existing data
    2. If not cached, query 3 LLM providers in parallel
    3. Send responses to Claude for consensus and final writing
    4. Cache the result
    5. Return to user
    """
    
    async def get_art(self, decade: str, region: str, art_form: str) -> Optional[ArtData]:
        """
        Get art data for the given parameters.
        
        Uses cache if available, otherwise queries LLMs.
        """
        # Step 1: Check cache
        logger.info(f"Checking cache for {decade}/{region}/{art_form}")
        cached = await cache_layer.get(decade, region, art_form)
        
        if cached:
            logger.info(f"Cache hit for {decade}/{region}/{art_form}")
            return cached
        
        logger.info(f"Cache miss for {decade}/{region}/{art_form}, querying LLMs...")
        
        # Step 2: Query all providers in parallel
        try:
            popular_responses, timeless_responses = await query_all_providers(
                decade, region, art_form
            )
        except Exception as e:
            logger.error(f"Error querying LLM providers: {e}")
            return None
        
        # Step 3: Check if we have minimum successful responses (1/3)
        popular_success = sum(1 for r in popular_responses if r.success)
        timeless_success = sum(1 for r in timeless_responses if r.success)
        
        logger.info(f"Provider results - Popular: {popular_success}/3, Timeless: {timeless_success}/3")
        
        if popular_success < 1 or timeless_success < 1:
            logger.error("Not enough successful provider responses")
            # Log the errors
            for r in popular_responses + timeless_responses:
                if not r.success:
                    logger.error(f"  {r.provider} ({r.query_type}): {r.error}")
            return None
        
        # Step 4: Synthesize with Claude
        try:
            logger.info("Synthesizing with Claude...")
            popular_entry, timeless_entry = await synthesize_with_claude(
                decade, region, art_form, popular_responses, timeless_responses
            )
        except Exception as e:
            logger.error(f"Error synthesizing with Claude: {e}")
            return None
        
        # Step 5: Build result
        result = ArtData(
            decade=decade,
            region=region,
            artForm=art_form,
            popular=popular_entry,
            timeless=timeless_entry,
        )
        
        # Step 6: Cache the result
        try:
            await cache_layer.set(result)
            logger.info(f"Cached result for {decade}/{region}/{art_form}")
        except Exception as e:
            logger.warning(f"Failed to cache result: {e}")
            # Don't fail the request if caching fails
        
        return result
    
    async def invalidate_cache(self, decade: str, region: str, art_form: str) -> bool:
        """Invalidate a specific cache entry."""
        return await cache_layer.delete(decade, region, art_form)
    
    async def clear_cache(self) -> int:
        """Clear all cached data. Returns count of deleted entries."""
        return await cache_layer.clear_all()


# Singleton instance
art_service = ArtService()

