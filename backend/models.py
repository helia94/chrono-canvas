"""Pydantic models for ChronoCanvas API."""

from pydantic import BaseModel
from typing import Optional


class ArtImage(BaseModel):
    """Image data for an artwork."""
    url: str
    sourceUrl: Optional[str] = None


class YouTubeVideo(BaseModel):
    """YouTube video data for music entries."""
    videoId: str
    title: str
    url: str  # YouTube watch URL
    embedUrl: str  # YouTube embed URL for iframe
    recordSales: Optional[str] = None  # e.g., "50 million copies sold"


class ArtEntry(BaseModel):
    """Art entry with genre, artists, example work, and optional media."""
    genre: str  # e.g., "Surrealism", "Jazz", "Magical Realism"
    artists: str  # Prominent artist(s) of this genre
    exampleWork: str  # Specific work for image/album search
    description: str  # About the genre and its significance
    image: Optional[ArtImage] = None  # For Visual Arts
    youtube: Optional[YouTubeVideo] = None  # For Music
    blogUrl: Optional[str] = None  # Personal blog about this genre
    
    # For backwards compatibility, expose 'name' as alias for exampleWork
    @property
    def name(self) -> str:
        return self.exampleWork


class ArtData(BaseModel):
    """Complete art data for a decade/region/art form combination."""
    decade: str
    region: str
    artForm: str
    popular: ArtEntry
    timeless: ArtEntry


class ArtDataResponse(BaseModel):
    """Response wrapper for art data."""
    data: Optional[ArtData]
    found: bool

