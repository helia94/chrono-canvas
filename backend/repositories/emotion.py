"""Repository for Emotion database operations."""

import logging
from typing import Optional

from sqlalchemy import select

from database import Emotion, get_session

logger = logging.getLogger(__name__)


class EmotionRepository:
    """Repository for emotion database operations."""

    async def find_by_id(self, emotion_id: str) -> Optional[Emotion]:
        """Find emotion by ID."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(Emotion).where(Emotion.id == emotion_id)
                )
                return result.scalar_one_or_none()
        except Exception as e:
            logger.warning(f"Repository find_by_id failed: {e}")
            return None

    async def search(self, query: str, limit: int = 10) -> list[Emotion]:
        """Search emotions by name (case-insensitive contains)."""
        try:
            async for session in get_session():
                if not query:
                    result = await session.execute(
                        select(Emotion).order_by(Emotion.name).limit(limit)
                    )
                else:
                    result = await session.execute(
                        select(Emotion)
                        .where(Emotion.name.ilike(f"%{query}%"))
                        .order_by(Emotion.name)
                        .limit(limit)
                    )
                return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Repository search failed: {e}")
            return []

    async def find_all(self) -> list[Emotion]:
        """Find all emotions."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(Emotion).order_by(Emotion.name)
                )
                return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Repository find_all failed: {e}")
            return []

    async def count(self) -> int:
        """Count all emotions."""
        try:
            async for session in get_session():
                result = await session.execute(select(Emotion))
                return len(result.scalars().all())
        except Exception as e:
            logger.warning(f"Repository count failed: {e}")
            return 0

    async def save(self, emotion: Emotion) -> bool:
        """Save an emotion."""
        try:
            async for session in get_session():
                session.add(emotion)
                await session.commit()
                return True
        except Exception as e:
            logger.warning(f"Repository save failed: {e}")
            return False

    async def save_many(self, emotions: list[Emotion]) -> bool:
        """Save multiple emotions."""
        try:
            async for session in get_session():
                for emotion in emotions:
                    session.add(emotion)
                await session.commit()
                return True
        except Exception as e:
            logger.warning(f"Repository save_many failed: {e}")
            return False

    async def delete_by_ids(self, ids: list[str]) -> bool:
        """Delete emotions by IDs."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(Emotion).where(Emotion.id.in_(ids))
                )
                emotions = result.scalars().all()
                for emotion in emotions:
                    await session.delete(emotion)
                await session.commit()
                return True
        except Exception as e:
            logger.warning(f"Repository delete_by_ids failed: {e}")
            return False


# Singleton instance
emotion_repository = EmotionRepository()
