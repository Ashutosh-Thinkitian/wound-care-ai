"""WoundCare AI — FastAPI application entry point.

AI-powered wound assessment API that accepts wound images, analyzes them
using Google Gemini, and returns structured clinical assessments.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_v1_router
from app.core.config import settings

app = FastAPI(
    title="WoundCare AI",
    description="AI-powered wound assessment API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.on_event("startup")
async def validate_config():
    """Validate required configuration on startup."""
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set in .env")
    if not settings.SUPABASE_URL or "dummy" in settings.SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not set or is a dummy value in .env")
    print("[Startup] Configuration validated successfully")
    print(f"[Startup] Google API key: {settings.GOOGLE_API_KEY[:15]}...")
    print(f"[Startup] Supabase URL: {settings.SUPABASE_URL}")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}
