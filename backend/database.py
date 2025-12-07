"""Database connection and models."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Text, DateTime, Index
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
    popular_name = Column(String(500), nullable=False)
    popular_description = Column(Text, nullable=False)
    popular_image_url = Column(String(1000), nullable=True)
    popular_image_source_url = Column(String(1000), nullable=True)
    
    # Timeless art entry
    timeless_name = Column(String(500), nullable=False)
    timeless_description = Column(Text, nullable=False)
    timeless_image_url = Column(String(1000), nullable=True)
    timeless_image_source_url = Column(String(1000), nullable=True)
    
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

