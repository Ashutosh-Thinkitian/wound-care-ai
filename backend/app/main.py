from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import router as api_v1_router
from app.core.database import engine, Base
from app.models import db_models  # noqa

import threading
import time
import httpx

app = FastAPI(
    title="WoundCare AI",
    description="AI-powered wound assessment API",
    version="1.0.0",
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables verified")

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "env": settings.APP_ENV}

@app.get("/ping")
async def ping():
    return {"ping": "pong"}

def keep_alive():
    while True:
        time.sleep(14 * 60)
        try:
            httpx.get("http://localhost:8000/ping", timeout=10)
            print("✅ Keep-alive ping sent")
        except Exception as e:
            print(f"⚠️ Keep-alive ping failed: {e}")

@app.on_event("startup")
async def start_keep_alive():
    if settings.APP_ENV == "production":
        thread = threading.Thread(target=keep_alive, daemon=True)
        thread.start()
        print("✅ Keep-alive thread started")
