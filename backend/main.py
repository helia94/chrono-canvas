"""ChronoCanvas API - Art through time and regions."""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from models import ConfigResponse, ArtDataResponse, ArtData
from data import (
    REGIONS,
    ART_FORMS,
    TIME_PERIODS,
    get_art_data,
    get_default_or_art_data,
)

app = FastAPI(
    title="ChronoCanvas API",
    description="API for exploring art through different time periods and regions",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # Allow all origins in development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "ChronoCanvas API is running"}


@app.get("/api/config", response_model=ConfigResponse)
async def get_config():
    """
    Get configuration data including available regions, art forms, and time periods.
    
    This endpoint returns all the available options for filtering art data.
    """
    return ConfigResponse(
        regions=REGIONS,
        artForms=ART_FORMS,
        timePeriods=TIME_PERIODS,
    )


@app.get("/api/art", response_model=ArtDataResponse)
async def get_art(
    decade: str = Query(..., description="Time period (e.g., '1920', '1960')"),
    region: str = Query(..., description="Geographic region"),
    artForm: str = Query(..., description="Type of art form"),
):
    """
    Get art data for a specific decade, region, and art form.
    
    Returns both the 'popular' art of the decade and the 'timeless' work.
    If no exact match is found, returns a fallback from the same decade.
    """
    data = get_default_or_art_data(decade, region, artForm)
    exact_match = get_art_data(decade, region, artForm) is not None
    
    return ArtDataResponse(
        data=data,
        found=exact_match,
    )


@app.get("/api/art/exact", response_model=ArtDataResponse)
async def get_art_exact(
    decade: str = Query(..., description="Time period (e.g., '1920', '1960')"),
    region: str = Query(..., description="Geographic region"),
    artForm: str = Query(..., description="Type of art form"),
):
    """
    Get art data for an exact match only.
    
    Returns null if no exact match is found (no fallback).
    """
    data = get_art_data(decade, region, artForm)
    
    return ArtDataResponse(
        data=data,
        found=data is not None,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

