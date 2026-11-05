import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


# Locate .env file in backend/ or root
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env" if (BACKEND_DIR / ".env").exists() else ".env"


class Settings(BaseSettings):
    APP_NAME: str = "RoadmapIQ"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database (supports POSTGRES_URL from Neon and DATABASE_URL)
    DATABASE_URL: str = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or "sqlite:///./roadmapiq.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Google Gemini API Settings (Cloud Only - No Local LLM)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT_SECONDS: float = 20.0
    GEMINI_MAX_OUTPUT_TOKENS: int = 4096
    DEFAULT_AI_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
