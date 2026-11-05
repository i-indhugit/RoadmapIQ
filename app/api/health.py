from fastapi import APIRouter, Response, status
from app.config import settings
from app.engine.gemini_service import get_gemini_api_key
from sqlalchemy import text
from app.database import engine

router = APIRouter()


@router.get("/health")
def get_health():
    """Liveness probe: returns 200 if the FastAPI application process is alive."""
    has_gemini = bool(get_gemini_api_key())
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_provider": "Google Gemini API (Cloud)",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": has_gemini
    }


@router.get("/ready")
def get_ready(response: Response):
    """Readiness probe: verifies that database connection is operational."""
    db_connected = False
    error_message = None
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        error_message = str(e)
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if db_connected else "degraded",
        "database": "connected" if db_connected else "disconnected",
        "database_url_dialect": engine.dialect.name,
        "error": error_message,
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
