"""Repository for ArtCache database operations."""

import logging
from typing import Optional

from sqlalchemy import select

from database import ArtCache, get_session

logger = logging.getLogger(__name__)


class ArtCacheRepository:
    """Repository for art cache database operations."""

    async def find_by_key(
        self, decade: str, region: str, art_form: str
    ) -> Optional[ArtCache]:
        """Find cache entry by composite key."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(ArtCache).where(
                        ArtCache.decade == decade,
                        ArtCache.region == region,
                        ArtCache.art_form == art_form,
                    )
                )
                return result.scalar_one_or_none()
        except Exception as e:
            logger.warning(f"Repository find_by_key failed: {e}")
            return None

    async def save(self, entry: ArtCache) -> bool:
        """Save or update a cache entry."""
        try:
            async for session in get_session():
                session.add(entry)
                await session.commit()
                return True
        except Exception as e:
            logger.warning(f"Repository save failed: {e}")
            return False

    async def update_blog_urls(
        self,
        decade: str,
        region: str,
        art_form: str,
        popular_blog_url: Optional[str] = None,
        timeless_blog_url: Optional[str] = None,
    ) -> bool:
        """Update blog URLs for a cache entry."""
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
                    if popular_blog_url:
                        cached.popular_blog_url = popular_blog_url
                    if timeless_blog_url:
                        cached.timeless_blog_url = timeless_blog_url
                    await session.commit()
                    return True
                return False
        except Exception as e:
            logger.warning(f"Repository update_blog_urls failed: {e}")
            return False

    async def delete_by_key(self, decade: str, region: str, art_form: str) -> bool:
        """Delete cache entry by composite key."""
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
            logger.warning(f"Repository delete_by_key failed: {e}")
            return False

    async def find_all(self) -> list[ArtCache]:
        """Find all cache entries."""
        try:
            async for session in get_session():
                result = await session.execute(select(ArtCache))
                return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Repository find_all failed: {e}")
            return []

    async def delete_all(self) -> int:
        """Delete all cache entries. Returns count of deleted entries."""
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
            logger.warning(f"Repository delete_all failed: {e}")
            return 0


# Singleton instance
art_cache_repository = ArtCacheRepository()
