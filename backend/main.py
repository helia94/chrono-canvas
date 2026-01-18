"""ChronoCanvas API - Art through time and regions."""

import logging
from contextlib import asynccontextmanager
from pydantic import BaseModel

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db, close_db, get_db
from models import ArtDataResponse
from art_service import art_service
from data import validate_inputs
from emotion_resolver import emotion_resolver


class FeedbackRequest(BaseModel):
    decade: str
    region: str
    artForm: str
    feedback: str  # "like" or "dislike"


class EmotionRequest(BaseModel):
    emotion: str

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("Starting up ChronoCanvas API...")
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}")
        logger.warning("Running without database - cache will not work")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_db()


app = FastAPI(
    title="ChronoCanvas API",
    description="API for exploring art through different time periods and regions",
    version="2.1.0",
    lifespan=lifespan,
)

# Configure CORS
settings = get_settings()
origins = [origin.strip() for origin in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # Allow all in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "ChronoCanvas API is running", "version": "2.1.0"}


@app.get("/api/art", response_model=ArtDataResponse)
async def get_art(
    decade: str = Query(..., description="Time period (e.g., '1920', '1960')"),
    region: str = Query(..., description="Geographic region"),
    artForm: str = Query(..., description="Type of art form"),
):
    """
    Get art data for a specific decade, region, and art form.
    
    This endpoint:
    1. Sanitizes and validates inputs (basic protection, no value restrictions)
    2. Checks the cache for existing data
    3. If not cached, queries multiple LLM providers for fact-checking
    4. Uses Claude to synthesize responses and write engaging descriptions
    5. Caches the result for future requests
    
    The frontend is the source of truth for available values.
    The backend accepts any reasonable input and caches the results.
    
    Returns both the 'popular' art of the decade and the 'timeless' work.
    """
    # Sanitize inputs (defense in depth, SQLAlchemy already uses parameterized queries)
    try:
        decade, region, artForm = validate_inputs(decade, region, artForm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        data = await art_service.get_art(decade, region, artForm)
        
        if data:
            return ArtDataResponse(data=data, found=True)
        else:
            return ArtDataResponse(data=None, found=False)
    except Exception as e:
        logger.error(f"Error fetching art data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch art data")


@app.delete("/api/cache")
async def clear_cache():
    """
    Clear all cached art data.
    
    Admin endpoint - use with caution.
    """
    try:
        count = await art_service.clear_cache()
        return {"status": "ok", "deleted": count}
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cache")


@app.delete("/api/cache/{decade}/{region}/{art_form}")
async def invalidate_cache_entry(decade: str, region: str, art_form: str):
    """
    Invalidate a specific cache entry.
    
    Admin endpoint for refreshing specific data.
    """
    try:
        deleted = await art_service.invalidate_cache(decade, region, art_form)
        return {"status": "ok", "deleted": deleted}
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to invalidate cache")


@app.get("/api/feedback")
async def get_feedback_counts(
    decade: str = Query(...),
    region: str = Query(...),
    artForm: str = Query(...),
):
    """Get like/dislike counts for a specific configuration."""
    try:
        db = await get_db()
        if db:
            # Ensure feedback table exists
            await db.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id SERIAL PRIMARY KEY,
                    decade VARCHAR(10) NOT NULL,
                    region VARCHAR(100) NOT NULL,
                    art_form VARCHAR(50) NOT NULL,
                    feedback VARCHAR(10) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            result = await db.fetch(
                """
                SELECT feedback, COUNT(*) as count 
                FROM feedback 
                WHERE decade = $1 AND region = $2 AND art_form = $3
                GROUP BY feedback
                """,
                decade, region, artForm
            )
            counts = {"likes": 0, "dislikes": 0}
            for row in result:
                if row["feedback"] == "like":
                    counts["likes"] = row["count"]
                elif row["feedback"] == "dislike":
                    counts["dislikes"] = row["count"]
            return counts
        return {"likes": 0, "dislikes": 0}
    except Exception as e:
        logger.error(f"Error fetching feedback counts: {e}")
        return {"likes": 0, "dislikes": 0}


@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    """
    Track anonymous like/dislike feedback for a configuration.
    Returns updated counts.
    """
    if req.feedback not in ("like", "dislike"):
        raise HTTPException(status_code=400, detail="Feedback must be 'like' or 'dislike'")
    
    try:
        db = await get_db()
        if db:
            # Ensure feedback table exists
            await db.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id SERIAL PRIMARY KEY,
                    decade VARCHAR(10) NOT NULL,
                    region VARCHAR(100) NOT NULL,
                    art_form VARCHAR(50) NOT NULL,
                    feedback VARCHAR(10) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            await db.execute(
                """
                INSERT INTO feedback (decade, region, art_form, feedback)
                VALUES ($1, $2, $3, $4)
                """,
                req.decade, req.region, req.artForm, req.feedback
            )
            # Return updated counts
            result = await db.fetch(
                """
                SELECT feedback, COUNT(*) as count 
                FROM feedback 
                WHERE decade = $1 AND region = $2 AND art_form = $3
                GROUP BY feedback
                """,
                req.decade, req.region, req.artForm
            )
            counts = {"likes": 0, "dislikes": 0}
            for row in result:
                if row["feedback"] == "like":
                    counts["likes"] = row["count"]
                elif row["feedback"] == "dislike":
                    counts["dislikes"] = row["count"]
            logger.info(f"Feedback recorded: {req.decade}/{req.region}/{req.artForm} = {req.feedback}")
            return {"status": "ok", **counts}
        return {"status": "ok", "likes": 0, "dislikes": 0}
    except Exception as e:
        logger.error(f"Error recording feedback: {e}")
        return {"status": "ok", "likes": 0, "dislikes": 0}


@app.post("/api/emotion")
async def resolve_emotion(req: EmotionRequest):
    """
    Resolve an emotion into nuanced cross-cultural variants.
    
    Takes a base emotion word and returns related emotion words
    from different languages and cultures with their meanings
    and cultural context.
    """
    emotion = req.emotion.strip()
    if not emotion:
        raise HTTPException(status_code=400, detail="Emotion is required")
    
    if len(emotion) > 100:
        raise HTTPException(status_code=400, detail="Emotion text too long")
    
    try:
        result = await emotion_resolver.resolve(emotion)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.error or "Failed to resolve emotion")
        
        return {
            "intro": result.intro,
            "emotions": [
                {
                    "name": e.name,
                    "language": e.language,
                    "meaning": e.meaning,
                    "cultural_context": e.cultural_context,
                }
                for e in result.emotions
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving emotion: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve emotion")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
