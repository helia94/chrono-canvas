"""Pydantic models for ChronoCanvas API."""

from pydantic import BaseModel
from typing import Optional


class ArtImage(BaseModel):
    """Image data for an artwork."""
    url: str
    sourceUrl: Optional[str] = None


class ArtEntry(BaseModel):
    """A single art entry with name, description, and optional image."""
    name: str
    description: str
    image: Optional[ArtImage] = None


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

