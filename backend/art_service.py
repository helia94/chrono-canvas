"""Art service - orchestrates cache and LLM layers."""

import logging
from typing import Optional

from cache import cache_layer
from llm_providers import query_all_providers
from consensus import synthesize_with_claude
from met_api import search_artwork_images
from spotify_api import search_music_tracks
from record_sales import lookup_sales_for_tracks
from blog_search import start_background_blog_search
from models import ArtData, ArtEntry, ArtImage, SpotifyTrack

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
            
            # Check if we need to fetch media for Visual Arts or Music
            updated = False
            popular_entry = cached.popular
            timeless_entry = cached.timeless
            
            if art_form == "Visual Arts":
                needs_popular_image = cached.popular.image is None
                needs_timeless_image = cached.timeless.image is None
                
                if needs_popular_image or needs_timeless_image:
                    logger.info(f"Cache hit but missing images, fetching from Met API...")
                    try:
                        popular_image, timeless_image = await search_artwork_images(
                            cached.popular.exampleWork,
                            cached.timeless.exampleWork,
                            art_form
                        )
                        
                        if needs_popular_image and popular_image:
                            popular_entry = ArtEntry(
                                genre=cached.popular.genre,
                                artists=cached.popular.artists,
                                exampleWork=cached.popular.exampleWork,
                                description=cached.popular.description,
                                image=ArtImage(
                                    url=popular_image.thumbnail_url,
                                    sourceUrl=popular_image.source_url,
                                ),
                                spotify=cached.popular.spotify,
                            )
                            updated = True
                        
                        if needs_timeless_image and timeless_image:
                            timeless_entry = ArtEntry(
                                genre=cached.timeless.genre,
                                artists=cached.timeless.artists,
                                exampleWork=cached.timeless.exampleWork,
                                description=cached.timeless.description,
                                image=ArtImage(
                                    url=timeless_image.thumbnail_url,
                                    sourceUrl=timeless_image.source_url,
                                ),
                                spotify=cached.timeless.spotify,
                            )
                            updated = True
                    except Exception as e:
                        logger.warning(f"Failed to fetch images for cached entry: {e}")
            
            elif art_form == "Music":
                needs_popular_spotify = cached.popular.spotify is None
                needs_timeless_spotify = cached.timeless.spotify is None
                
                if needs_popular_spotify or needs_timeless_spotify:
                    logger.info(f"Cache hit but missing Spotify data, fetching...")
                    try:
                        popular_track, timeless_track = await search_music_tracks(
                            cached.popular.exampleWork,
                            cached.timeless.exampleWork,
                            decade,
                            art_form
                        )
                        
                        if needs_popular_spotify and popular_track:
                            popular_entry = ArtEntry(
                                genre=cached.popular.genre,
                                artists=cached.popular.artists,
                                exampleWork=cached.popular.exampleWork,
                                description=cached.popular.description,
                                image=cached.popular.image,
                                spotify=SpotifyTrack(
                                    trackId=popular_track.track_id,
                                    name=popular_track.name,
                                    artist=popular_track.artist,
                                    album=popular_track.album,
                                    previewUrl=popular_track.preview_url,
                                    embedUrl=popular_track.embed_url,
                                    externalUrl=popular_track.external_url,
                                    albumImageUrl=popular_track.album_image_url,
                                ),
                            )
                            updated = True
                        
                        if needs_timeless_spotify and timeless_track:
                            timeless_entry = ArtEntry(
                                genre=cached.timeless.genre,
                                artists=cached.timeless.artists,
                                exampleWork=cached.timeless.exampleWork,
                                description=cached.timeless.description,
                                image=cached.timeless.image,
                                spotify=SpotifyTrack(
                                    trackId=timeless_track.track_id,
                                    name=timeless_track.name,
                                    artist=timeless_track.artist,
                                    album=timeless_track.album,
                                    previewUrl=timeless_track.preview_url,
                                    embedUrl=timeless_track.embed_url,
                                    externalUrl=timeless_track.external_url,
                                    albumImageUrl=timeless_track.album_image_url,
                                ),
                            )
                            updated = True
                    except Exception as e:
                        logger.warning(f"Failed to fetch Spotify data for cached entry: {e}")
            
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
                logger.info(f"Updated cache with media for {decade}/{region}/{art_form}")
            
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
        
        # Step 5: Fetch media (images for Visual Arts, Spotify for Music)
        if art_form == "Visual Arts":
            try:
                logger.info("Fetching artwork images from Met API...")
                popular_image, timeless_image = await search_artwork_images(
                    popular_entry.exampleWork,
                    timeless_entry.exampleWork,
                    art_form
                )
                
                if popular_image:
                    popular_entry = ArtEntry(
                        genre=popular_entry.genre,
                        artists=popular_entry.artists,
                        exampleWork=popular_entry.exampleWork,
                        description=popular_entry.description,
                        image=ArtImage(
                            url=popular_image.thumbnail_url,
                            sourceUrl=popular_image.source_url,
                        )
                    )
                
                if timeless_image:
                    timeless_entry = ArtEntry(
                        genre=timeless_entry.genre,
                        artists=timeless_entry.artists,
                        exampleWork=timeless_entry.exampleWork,
                        description=timeless_entry.description,
                        image=ArtImage(
                            url=timeless_image.thumbnail_url,
                            sourceUrl=timeless_image.source_url,
                        )
                    )
            except Exception as e:
                logger.warning(f"Failed to fetch artwork images: {e}")
        
        elif art_form == "Music":
            try:
                logger.info("Fetching Spotify tracks...")
                popular_track, timeless_track = await search_music_tracks(
                    popular_entry.exampleWork,
                    timeless_entry.exampleWork,
                    decade,
                    art_form
                )
                
                # Look up record sales via Perplexity
                popular_sales, timeless_sales = None, None
                try:
                    logger.info("Looking up record sales via Perplexity...")
                    popular_sales, timeless_sales = await lookup_sales_for_tracks(
                        popular_entry.exampleWork,
                        popular_entry.artists,
                        timeless_entry.exampleWork,
                        timeless_entry.artists,
                    )
                except Exception as e:
                    logger.warning(f"Record sales lookup failed: {e}")
                
                if popular_track:
                    popular_entry = ArtEntry(
                        genre=popular_entry.genre,
                        artists=popular_entry.artists,
                        exampleWork=popular_entry.exampleWork,
                        description=popular_entry.description,
                        spotify=SpotifyTrack(
                            trackId=popular_track.track_id,
                            name=popular_track.name,
                            artist=popular_track.artist,
                            album=popular_track.album,
                            previewUrl=popular_track.preview_url,
                            embedUrl=popular_track.embed_url,
                            externalUrl=popular_track.external_url,
                            albumImageUrl=popular_track.album_image_url,
                            recordSales=popular_sales,
                        )
                    )
                
                if timeless_track:
                    timeless_entry = ArtEntry(
                        genre=timeless_entry.genre,
                        artists=timeless_entry.artists,
                        exampleWork=timeless_entry.exampleWork,
                        description=timeless_entry.description,
                        spotify=SpotifyTrack(
                            trackId=timeless_track.track_id,
                            name=timeless_track.name,
                            artist=timeless_track.artist,
                            album=timeless_track.album,
                            previewUrl=timeless_track.preview_url,
                            embedUrl=timeless_track.embed_url,
                            externalUrl=timeless_track.external_url,
                            albumImageUrl=timeless_track.album_image_url,
                            recordSales=timeless_sales,
                        )
                    )
            except Exception as e:
                logger.warning(f"Failed to fetch Spotify tracks: {e}")
        
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
        
        # Step 8: Start background blog search (fire-and-forget)
        # This will search for personal blogs and update the cache later
        try:
            start_background_blog_search(
                popular_genre=popular_entry.genre,
                popular_artists=popular_entry.artists,
                timeless_genre=timeless_entry.genre,
                timeless_artists=timeless_entry.artists,
                art_form=art_form,
                decade=decade,
                region=region,
                cache_key=(decade, region, art_form),
            )
        except Exception as e:
            logger.warning(f"Failed to start background blog search: {e}")
            # Don't fail - this is optional
        
        return result
    
    async def invalidate_cache(self, decade: str, region: str, art_form: str) -> bool:
        """Invalidate a specific cache entry."""
        return await cache_layer.delete(decade, region, art_form)
    
    async def clear_cache(self) -> int:
        """Clear all cached data. Returns count of deleted entries."""
        return await cache_layer.clear_all()


# Singleton instance
art_service = ArtService()
