"""Art service - orchestrates cache and LLM layers."""

import logging
from typing import Optional

from cache import cache_layer
from llm_providers import query_all_providers
from consensus import synthesize_with_claude
from met_api import search_artwork_images
from models import ArtData, ArtEntry, ArtImage

logger = logging.getLogger(__name__)


class ArtService:
    """
    Main service for fetching art data.
    
    Flow:
    1. Check cache for existing data
    2. If not cached, query 3 LLM providers in parallel
    3. Send responses to Claude for consensus and final writing
    4. Fetch artwork images from Met API (for Visual Arts)
    5. Cache the result
    6. Return to user
    """
    
    async def get_art(self, decade: str, region: str, art_form: str) -> Optional[ArtData]:
        """
        Get art data for the given parameters.
        
        Uses cache if available, otherwise queries LLMs.
        If cached but images are missing (for Visual Arts), fetches images and updates cache.
        """
        # Step 1: Check cache
        logger.info(f"Checking cache for {decade}/{region}/{art_form}")
        cached = await cache_layer.get(decade, region, art_form)
        
        if cached:
            logger.info(f"Cache hit for {decade}/{region}/{art_form}")
            
            # Check if we need to fetch images for Visual Arts
            if art_form == "Visual Arts":
                needs_popular_image = cached.popular.image is None
                needs_timeless_image = cached.timeless.image is None
                
                if needs_popular_image or needs_timeless_image:
                    logger.info(f"Cache hit but missing images, fetching from Met API...")
                    try:
                        popular_image, timeless_image = await search_artwork_images(
                            cached.popular.name,
                            cached.timeless.name,
                            art_form
                        )
                        
                        # Update entries with images
                        updated = False
                        popular_entry = cached.popular
                        timeless_entry = cached.timeless
                        
                        if needs_popular_image and popular_image:
                            popular_entry = ArtEntry(
                                name=cached.popular.name,
                                description=cached.popular.description,
                                image=ArtImage(
                                    url=popular_image.thumbnail_url,
                                    sourceUrl=popular_image.source_url,
                                )
                            )
                            updated = True
                        
                        if needs_timeless_image and timeless_image:
                            timeless_entry = ArtEntry(
                                name=cached.timeless.name,
                                description=cached.timeless.description,
                                image=ArtImage(
                                    url=timeless_image.thumbnail_url,
                                    sourceUrl=timeless_image.source_url,
                                )
                            )
                            updated = True
                        
                        if updated:
                            # Build updated result and re-cache
                            cached = ArtData(
                                decade=cached.decade,
                                region=cached.region,
                                artForm=cached.artForm,
                                popular=popular_entry,
                                timeless=timeless_entry,
                            )
                            await cache_layer.set(cached)
                            logger.info(f"Updated cache with images for {decade}/{region}/{art_form}")
                    except Exception as e:
                        logger.warning(f"Failed to fetch images for cached entry: {e}")
                        # Return cached data without images
            
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
        
        # Step 5: Fetch artwork images from Met API (for Visual Arts only)
        try:
            logger.info("Fetching artwork images from Met API...")
            popular_image, timeless_image = await search_artwork_images(
                popular_entry.name,
                timeless_entry.name,
                art_form
            )
            
            # Add images to entries
            if popular_image:
                popular_entry = ArtEntry(
                    name=popular_entry.name,
                    description=popular_entry.description,
                    image=ArtImage(
                        url=popular_image.thumbnail_url,
                        sourceUrl=popular_image.source_url,
                    )
                )
            
            if timeless_image:
                timeless_entry = ArtEntry(
                    name=timeless_entry.name,
                    description=timeless_entry.description,
                    image=ArtImage(
                        url=timeless_image.thumbnail_url,
                        sourceUrl=timeless_image.source_url,
                    )
                )
        except Exception as e:
            logger.warning(f"Failed to fetch artwork images: {e}")
            # Continue without images - they're optional
        
        # Step 6: Build result
        result = ArtData(
            decade=decade,
            region=region,
            artForm=art_form,
            popular=popular_entry,
            timeless=timeless_entry,
        )
        
        # Step 7: Cache the result
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

