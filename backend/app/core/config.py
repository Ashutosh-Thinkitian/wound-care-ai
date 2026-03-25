from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    GOOGLE_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_WOUND_IMAGES_BUCKET: str = "wound-images"
    DATABASE_URL: str
    SESSION_TTL_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
