"""Pydantic models for ChronoCanvas API."""

from pydantic import BaseModel
from typing import Optional


class ArtEntry(BaseModel):
    """A single art entry with name and description."""
    name: str
    description: str


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

