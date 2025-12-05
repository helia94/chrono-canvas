"""Cache layer for art data using PostgreSQL."""

import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import ArtCache, get_session
from models import ArtData, ArtEntry

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
                    return ArtData(
                        decade=cached.decade,
                        region=cached.region,
                        artForm=cached.art_form,
                        popular=ArtEntry(
                            name=cached.popular_name,
                            description=cached.popular_description,
                        ),
                        timeless=ArtEntry(
                            name=cached.timeless_name,
                            description=cached.timeless_description,
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
                
                if existing:
                    # Update existing
                    existing.popular_name = data.popular.name
                    existing.popular_description = data.popular.description
                    existing.timeless_name = data.timeless.name
                    existing.timeless_description = data.timeless.description
                else:
                    # Insert new
                    cache_entry = ArtCache(
                        decade=data.decade,
                        region=data.region,
                        art_form=data.artForm,
                        popular_name=data.popular.name,
                        popular_description=data.popular.description,
                        timeless_name=data.timeless.name,
                        timeless_description=data.timeless.description,
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
