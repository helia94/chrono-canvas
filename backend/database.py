"""Database connection and models."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Text, DateTime, Index, text
from datetime import datetime
from typing import AsyncGenerator

from config import get_settings


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""
    pass


class ArtCache(Base):
    """Cache table for art data."""
    
    __tablename__ = "chrono_art_cache"
    
    # Composite primary key
    decade = Column(String(10), primary_key=True)
    region = Column(String(100), primary_key=True)
    art_form = Column(String(100), primary_key=True)
    
    # Popular art entry
    popular_genre = Column(String(200), nullable=False)
    popular_artists = Column(String(500), nullable=False)
    popular_example_work = Column(String(500), nullable=False)
    popular_description = Column(Text, nullable=False)
    popular_image_url = Column(String(1000), nullable=True)
    popular_image_source_url = Column(String(1000), nullable=True)
    # YouTube data for Music
    popular_youtube_video_id = Column(String(20), nullable=True)
    popular_youtube_url = Column(String(500), nullable=True)
    popular_youtube_embed_url = Column(String(500), nullable=True)
    popular_record_sales = Column(String(200), nullable=True)
    # Blog URL (personal perspective)
    popular_blog_url = Column(String(1000), nullable=True)
    
    # Timeless art entry
    timeless_genre = Column(String(200), nullable=False)
    timeless_artists = Column(String(500), nullable=False)
    timeless_example_work = Column(String(500), nullable=False)
    timeless_description = Column(Text, nullable=False)
    timeless_image_url = Column(String(1000), nullable=True)
    timeless_image_source_url = Column(String(1000), nullable=True)
    # YouTube data for Music
    timeless_youtube_video_id = Column(String(20), nullable=True)
    timeless_youtube_url = Column(String(500), nullable=True)
    timeless_youtube_embed_url = Column(String(500), nullable=True)
    timeless_record_sales = Column(String(200), nullable=True)
    # Blog URL (personal perspective)
    timeless_blog_url = Column(String(1000), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Index for faster lookups
    __table_args__ = (
        Index('idx_chrono_art_cache_lookup', 'decade', 'region', 'art_form'),
    )


# Engine and session factory (initialized lazily)
_engine = None
_async_session_factory = None


async def init_db():
    """Initialize database connection and create tables."""
    global _engine, _async_session_factory
    
    settings = get_settings()
    _engine = create_async_engine(
        settings.database_url,
        echo=settings.debug,
        pool_pre_ping=True,
    )
    
    _async_session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    # Create tables
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Add new columns if they don't exist (migrations)
    async with _engine.begin() as conn:
        await conn.execute(text("""
            ALTER TABLE chrono_art_cache 
            ADD COLUMN IF NOT EXISTS popular_blog_url VARCHAR(1000),
            ADD COLUMN IF NOT EXISTS timeless_blog_url VARCHAR(1000),
            ADD COLUMN IF NOT EXISTS popular_record_sales VARCHAR(200),
            ADD COLUMN IF NOT EXISTS timeless_record_sales VARCHAR(200),
            ADD COLUMN IF NOT EXISTS popular_youtube_video_id VARCHAR(20),
            ADD COLUMN IF NOT EXISTS popular_youtube_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS popular_youtube_embed_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS timeless_youtube_video_id VARCHAR(20),
            ADD COLUMN IF NOT EXISTS timeless_youtube_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS timeless_youtube_embed_url VARCHAR(500)
        """))
    
    return _engine


async def close_db():
    """Close database connection."""
    global _engine
    if _engine:
        await _engine.dispose()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    if _async_session_factory is None:
        await init_db()

    async with _async_session_factory() as session:
        yield session


async def get_db():
    """Get raw database connection for direct queries.

    Returns None - feedback features require separate asyncpg connection setup.
    The API endpoints handle None gracefully by returning default values.
    """
    return None

