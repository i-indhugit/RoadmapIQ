"""
RoadmapIQ AI Service Layer
Delegates all generative AI requests exclusively to Google Gemini API (Cloud)
via the official google-genai Python SDK.
"""

from app.engine.gemini_service import (
    check_ai_status,
    test_gemini_connection,
    call_gemini,
    generate_roadmap_advice,
    explain_skill_gap,
    generate_weekly_learning_plan,
    generate_rag_gemini_answer,
    generate_project_recommendations,
    generate_interview_questions,
    evaluate_interview_answer,
    generate_project_mentor,
)

__all__ = [
    "check_ai_status",
    "test_gemini_connection",
    "call_gemini",
    "generate_roadmap_advice",
    "explain_skill_gap",
    "generate_weekly_learning_plan",
    "generate_rag_gemini_answer",
    "generate_project_recommendations",
    "generate_interview_questions",
    "evaluate_interview_answer",
    "generate_project_mentor",
]
