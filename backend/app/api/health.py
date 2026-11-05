from fastapi import APIRouter
from app.config import settings
from app.engine.gemini_service import get_gemini_api_key

router = APIRouter()


@router.get("/health")
def get_health():
    has_gemini = bool(get_gemini_api_key())
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "connected",
        "ai_provider": "Google Gemini API (Cloud)",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": has_gemini
    }
