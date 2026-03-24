"""Application settings loaded from environment variables and .env file."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the WoundCare AI backend."""

    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # Google AI (Gemini)
    GOOGLE_API_KEY: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_WOUND_IMAGES_BUCKET: str = "wound-images"

    # Database
    DATABASE_URL: str

    SESSION_TTL_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
