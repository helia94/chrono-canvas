"""Cache layer for art data using PostgreSQL."""

import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import ArtCache, get_session
from models import ArtData, ArtEntry, ArtImage, YouTubeVideo

logger = logging.getLogger(__name__)


class CacheLayer:
    """Cache layer that stores and retrieves art data from PostgreSQL."""
    
    async def get(self, decade: str, region: str, art_form: str) -> Optional[ArtData]:
        """
        Retrieve art data from cache.
        
        Returns None if not found or if database is unavailable.
        """
        try:
            async for session in get_session():
                result = await session.execute(
                    select(ArtCache).where(
                        ArtCache.decade == decade,
                        ArtCache.region == region,
                        ArtCache.art_form == art_form,
                    )
                )
                cached = result.scalar_one_or_none()
                
                if cached:
                    # Build image objects if URLs exist
                    popular_image = None
                    if cached.popular_image_url:
                        popular_image = ArtImage(
                            url=cached.popular_image_url,
                            sourceUrl=cached.popular_image_source_url,
                        )
                    
                    timeless_image = None
                    if cached.timeless_image_url:
                        timeless_image = ArtImage(
                            url=cached.timeless_image_url,
                            sourceUrl=cached.timeless_image_source_url,
                        )
                    
                    # Build YouTube objects if video IDs exist
                    popular_youtube = None
                    if getattr(cached, 'popular_youtube_video_id', None):
                        popular_youtube = YouTubeVideo(
                            videoId=cached.popular_youtube_video_id,
                            title=cached.popular_example_work,
                            url=cached.popular_youtube_url or "",
                            embedUrl=cached.popular_youtube_embed_url or "",
                            recordSales=getattr(cached, 'popular_record_sales', None),
                        )
                    
                    timeless_youtube = None
                    if getattr(cached, 'timeless_youtube_video_id', None):
                        timeless_youtube = YouTubeVideo(
                            videoId=cached.timeless_youtube_video_id,
                            title=cached.timeless_example_work,
                            url=cached.timeless_youtube_url or "",
                            embedUrl=cached.timeless_youtube_embed_url or "",
                            recordSales=getattr(cached, 'timeless_record_sales', None),
                        )
                    
                    return ArtData(
                        decade=cached.decade,
                        region=cached.region,
                        artForm=cached.art_form,
                        popular=ArtEntry(
                            genre=cached.popular_genre,
                            artists=cached.popular_artists,
                            exampleWork=cached.popular_example_work,
                            description=cached.popular_description,
                            image=popular_image,
                            youtube=popular_youtube,
                            blogUrl=getattr(cached, 'popular_blog_url', None),
                        ),
                        timeless=ArtEntry(
                            genre=cached.timeless_genre,
                            artists=cached.timeless_artists,
                            exampleWork=cached.timeless_example_work,
                            description=cached.timeless_description,
                            image=timeless_image,
                            youtube=timeless_youtube,
                            blogUrl=getattr(cached, 'timeless_blog_url', None),
                        ),
                    )
                
                return None
        except Exception as e:
            logger.warning(f"Cache get failed (database unavailable?): {e}")
            return None
    
    async def set(self, data: ArtData) -> None:
        """Store art data in cache. Silently fails if database unavailable."""
        try:
            async for session in get_session():
                # Check if exists
                result = await session.execute(
                    select(ArtCache).where(
                        ArtCache.decade == data.decade,
                        ArtCache.region == data.region,
                        ArtCache.art_form == data.artForm,
                    )
                )
                existing = result.scalar_one_or_none()
                
                # Extract image data
                popular_image_url = data.popular.image.url if data.popular.image else None
                popular_image_source = data.popular.image.sourceUrl if data.popular.image else None
                timeless_image_url = data.timeless.image.url if data.timeless.image else None
                timeless_image_source = data.timeless.image.sourceUrl if data.timeless.image else None
                
                # Extract YouTube data
                pop_youtube = data.popular.youtube
                time_youtube = data.timeless.youtube
                
                if existing:
                    # Update existing
                    existing.popular_genre = data.popular.genre
                    existing.popular_artists = data.popular.artists
                    existing.popular_example_work = data.popular.exampleWork
                    existing.popular_description = data.popular.description
                    existing.popular_image_url = popular_image_url
                    existing.popular_image_source_url = popular_image_source
                    existing.popular_youtube_video_id = pop_youtube.videoId if pop_youtube else None
                    existing.popular_youtube_url = pop_youtube.url if pop_youtube else None
                    existing.popular_youtube_embed_url = pop_youtube.embedUrl if pop_youtube else None
                    existing.popular_record_sales = pop_youtube.recordSales if pop_youtube else None
                    existing.popular_blog_url = data.popular.blogUrl
                    existing.timeless_genre = data.timeless.genre
                    existing.timeless_artists = data.timeless.artists
                    existing.timeless_example_work = data.timeless.exampleWork
                    existing.timeless_description = data.timeless.description
                    existing.timeless_image_url = timeless_image_url
                    existing.timeless_image_source_url = timeless_image_source
                    existing.timeless_youtube_video_id = time_youtube.videoId if time_youtube else None
                    existing.timeless_youtube_url = time_youtube.url if time_youtube else None
                    existing.timeless_youtube_embed_url = time_youtube.embedUrl if time_youtube else None
                    existing.timeless_record_sales = time_youtube.recordSales if time_youtube else None
                    existing.timeless_blog_url = data.timeless.blogUrl
                else:
                    # Insert new
                    cache_entry = ArtCache(
                        decade=data.decade,
                        region=data.region,
                        art_form=data.artForm,
                        popular_genre=data.popular.genre,
                        popular_artists=data.popular.artists,
                        popular_example_work=data.popular.exampleWork,
                        popular_description=data.popular.description,
                        popular_image_url=popular_image_url,
                        popular_image_source_url=popular_image_source,
                        popular_youtube_video_id=pop_youtube.videoId if pop_youtube else None,
                        popular_youtube_url=pop_youtube.url if pop_youtube else None,
                        popular_youtube_embed_url=pop_youtube.embedUrl if pop_youtube else None,
                        popular_record_sales=pop_youtube.recordSales if pop_youtube else None,
                        popular_blog_url=data.popular.blogUrl,
                        timeless_genre=data.timeless.genre,
                        timeless_artists=data.timeless.artists,
                        timeless_example_work=data.timeless.exampleWork,
                        timeless_description=data.timeless.description,
                        timeless_image_url=timeless_image_url,
                        timeless_image_source_url=timeless_image_source,
                        timeless_youtube_video_id=time_youtube.videoId if time_youtube else None,
                        timeless_youtube_url=time_youtube.url if time_youtube else None,
                        timeless_youtube_embed_url=time_youtube.embedUrl if time_youtube else None,
                        timeless_record_sales=time_youtube.recordSales if time_youtube else None,
                        timeless_blog_url=data.timeless.blogUrl,
                    )
                    session.add(cache_entry)
                
                await session.commit()
        except Exception as e:
            logger.warning(f"Cache set failed (database unavailable?): {e}")
    
    async def delete(self, decade: str, region: str, art_form: str) -> bool:
        """Delete art data from cache. Returns True if deleted."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(ArtCache).where(
                        ArtCache.decade == decade,
                        ArtCache.region == region,
                        ArtCache.art_form == art_form,
                    )
                )
                cached = result.scalar_one_or_none()
                
                if cached:
                    await session.delete(cached)
                    await session.commit()
                    return True
                
                return False
        except Exception as e:
            logger.warning(f"Cache delete failed: {e}")
            return False
    
    async def clear_all(self) -> int:
        """Clear all cached data. Returns count of deleted entries."""
        try:
            async for session in get_session():
                result = await session.execute(select(ArtCache))
                entries = result.scalars().all()
                count = len(entries)
                
                for entry in entries:
                    await session.delete(entry)
                
                await session.commit()
                return count
        except Exception as e:
            logger.warning(f"Cache clear failed: {e}")
            return 0


# Singleton instance
cache_layer = CacheLayer()
