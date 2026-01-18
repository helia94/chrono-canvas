"""Repository for EmotionCache database operations."""

import json
import logging
from typing import Optional

from sqlalchemy import select

from database import EmotionCache, get_session

logger = logging.getLogger(__name__)


class EmotionCacheRepository:
    """Repository for emotion cache database operations."""

    async def find_by_emotion(self, emotion: str) -> Optional[dict]:
        """Find cached emotion result by emotion query."""
        try:
            normalized = emotion.strip().lower()
            async for session in get_session():
                result = await session.execute(
                    select(EmotionCache).where(EmotionCache.emotion == normalized)
                )
                cached = result.scalar_one_or_none()
                if cached:
                    return {
                        "intro": cached.intro,
                        "emotions": json.loads(cached.emotions_json),
                    }
                return None
        except Exception as e:
            logger.warning(f"Repository find_by_emotion failed: {e}")
            return None

    async def save(self, emotion: str, intro: str, emotions: list[dict]) -> bool:
        """Save emotion result to cache."""
        try:
            normalized = emotion.strip().lower()
            async for session in get_session():
                # Check if exists
                result = await session.execute(
                    select(EmotionCache).where(EmotionCache.emotion == normalized)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    existing.intro = intro
                    existing.emotions_json = json.dumps(emotions)
                else:
                    entry = EmotionCache(
                        emotion=normalized,
                        intro=intro,
                        emotions_json=json.dumps(emotions),
                    )
                    session.add(entry)

                await session.commit()
                return True
        except Exception as e:
            logger.warning(f"Repository save failed: {e}")
            return False

    async def delete(self, emotion: str) -> bool:
        """Delete cached emotion result."""
        try:
            normalized = emotion.strip().lower()
            async for session in get_session():
                result = await session.execute(
                    select(EmotionCache).where(EmotionCache.emotion == normalized)
                )
                cached = result.scalar_one_or_none()
                if cached:
                    await session.delete(cached)
                    await session.commit()
                    return True
                return False
        except Exception as e:
            logger.warning(f"Repository delete failed: {e}")
            return False


# Singleton instance
emotion_cache_repository = EmotionCacheRepository()
