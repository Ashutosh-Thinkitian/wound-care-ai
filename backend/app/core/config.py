from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # Anthropic
    ANTHROPIC_API_KEY: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str          # service role key (server-side only, never expose)
    SUPABASE_WOUND_IMAGES_BUCKET: str = "wound-images"

    SESSION_TTL_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
