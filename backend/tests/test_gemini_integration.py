import pytest
from app.database import SessionLocal
from app.schemas import (
    AIRoadmapAdviceRequest,
    AIExplainRequest,
    ProjectMentorRequest,
    InterviewFeedbackRequest,
    RAGQueryRequest,
    WeeklyPlannerAIRequest,
    AIProjectRecommendationRequest,
    AIInterviewGenRequest,
)
from app.api.health import get_health
from app.api.ai import (
    get_ai_status,
    test_gemini_api as call_test_gemini_api,
    get_roadmap_advice,
    get_skill_gap_explanation,
    ask_learning_assistant,
    get_project_milestone_mentor,
    get_weekly_study_plan,
    get_project_recommendations,
    get_interview_questions,
    evaluate_interview_response,
)
from app.engine.gemini_service import (
    check_ai_status,
    test_gemini_connection as run_test_gemini_connection
)
from app.main import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_health_reports_gemini():
    """Verify health endpoint explicitly advertises Google Gemini API (Cloud)."""
    h = get_health()
    assert h["status"] == "healthy"
    assert h["ai_provider"] == "Google Gemini API (Cloud)"
    assert "gemini_configured" in h


def test_ai_status_service():
    """Verify check_ai_status returns Google Gemini provider and gemini-2.5-flash model."""
    status = check_ai_status()
    assert status.provider == "Google Gemini API (Cloud)"
    assert status.model == "gemini-2.5-flash"
    assert status.enabled is True
    assert "Google Gemini" in status.message


def test_ai_status_endpoint():
    """Verify /api/ai/status endpoint responds with Gemini metadata."""
    res = get_ai_status()
    assert res.provider == "Google Gemini API (Cloud)"
    assert res.model == "gemini-2.5-flash"
    assert res.enabled is True


def test_gemini_test_connection_endpoint():
    """Verify /api/ai/test endpoint returns valid Gemini test response structure."""
    res = call_test_gemini_api()
    assert res.model == "gemini-2.5-flash"
    assert res.status in ["ok", "missing_key", "error"]
    assert isinstance(res.api_key_configured, bool)
    assert len(res.message) > 0


def test_gemini_connection_service():
    """Verify direct service invocation handles missing/configured key gracefully."""
    res = run_test_gemini_connection()
    assert res.model == "gemini-2.5-flash"
    assert res.status in ["ok", "missing_key", "error"]


def test_gemini_roadmap_advice():
    """Verify Gemini roadmap advice generation with deterministic fallback safety."""
    req = AIRoadmapAdviceRequest(
        role_title="AI/ML Engineer",
        readiness_score=45.0,
        target_duration_weeks=12,
        weekly_hours=15,
        top_gaps=["Deep Learning", "PyTorch", "Model Deployment"]
    )
    res = get_roadmap_advice(req)
    assert len(res.weekly_pacing_strategy) > 0
    assert len(res.high_priority_focus_areas) > 0
    assert len(res.potential_bottlenecks) > 0


def test_gemini_skill_gap_explanation():
    """Verify skill gap explanation generates pedagogical insights."""
    req = AIExplainRequest(
        topic="Neural Network Backpropagation",
        target_role="AI/ML Engineer"
    )
    res = get_skill_gap_explanation(req)
    assert res.topic == "Neural Network Backpropagation"
    assert len(res.explanation) > 20
    assert len(res.why_important) > 10


def test_gemini_weekly_planner():
    """Verify Gemini day-by-day weekly schedule generation."""
    req = WeeklyPlannerAIRequest(
        role_title="Software Developer",
        target_skills=["FastAPI", "Async Python", "PostgreSQL"],
        weekly_hours=14,
        week_number=3,
        focus_topic="Backend Architecture"
    )
    res = get_weekly_study_plan(req)
    assert res.role_title == "Software Developer"
    assert res.weekly_hours == 14
    assert len(res.daily_schedule) >= 5
    assert len(res.pacing_advice) > 0
    first_day = res.daily_schedule[0]
    assert first_day.day in ["Monday", "Day 1"]
    assert first_day.hours_allocated > 0
    assert len(first_day.recommended_activity) > 0


def test_gemini_project_recommendations():
    """Verify Gemini portfolio project generator."""
    req = AIProjectRecommendationRequest(
        role_title="Cybersecurity Analyst",
        difficulty="Intermediate",
        skills=["Network Analysis", "Wireshark", "Python Security Scripts"]
    )
    res = get_project_recommendations(req)
    assert res.role_title == "Cybersecurity Analyst"
    assert len(res.projects) >= 2
    p0 = res.projects[0]
    assert len(p0.title) > 0
    assert len(p0.deliverable) > 0
    assert len(p0.tech_stack) > 0
    assert len(p0.learning_outcomes) > 0


def test_gemini_interview_question_generator():
    """Verify Gemini generates targeted placement interview questions."""
    req = AIInterviewGenRequest(
        role_title="Business Analyst",
        category="Technical",
        difficulty="Medium"
    )
    res = get_interview_questions(req)
    assert len(res.questions) >= 2
    q0 = res.questions[0]
    assert len(q0.question) > 0
    assert len(q0.model_answer) > 0


def test_gemini_interview_evaluation():
    """Verify Gemini rubric scoring of mock interview responses."""
    req = InterviewFeedbackRequest(
        question_id=1,
        question_title="QuickSort Complexity",
        question_text="Explain the time complexity of QuickSort in worst and average cases.",
        student_answer="Average case is O(N log N) because we partition roughly in half. Worst case is O(N^2) if pivot is already sorted."
    )
    res = evaluate_interview_response(req)
    assert res.score >= 5
    assert len(res.strengths) > 0
    assert len(res.areas_for_improvement) > 0


def test_gemini_rag_grounded_assistant(db):
    """Verify RAG retrieval passes SQLite resources to Gemini for grounded answers."""
    req = RAGQueryRequest(
        query="What are the best free resources to learn Python and SQL for beginners?",
        target_role="Business Analyst"
    )
    res = ask_learning_assistant(req, db=db)
    assert res.has_relevant_sources is True
    assert len(res.sources) > 0
    assert len(res.answer) > 20
    assert any("python" in s.title.lower() or "sql" in s.title.lower() for s in res.sources)
