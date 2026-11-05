import pytest
from app.database import SessionLocal
from app.models import (
    StudentProfile,
    CareerRole,
    CareerAssessmentQuestion,
    CareerAssessmentAttempt,
    CareerAssessmentResult,
    CareerSkillGapReport,
    Roadmap,
)
from app.schemas import (
    StartAssessmentRequest,
    SaveAssessmentAnswersRequest,
    SubmitAssessmentRequest,
    GenerateRoadmapFromAssessmentRequest,
)
from app.api.career_assessment import (
    list_careers,
    get_career_detail,
    get_career_overview,
    start_career_assessment,
    save_assessment_answers,
    submit_career_assessment,
    get_assessment_results,
    get_assessment_skill_analysis,
    create_roadmap_from_assessment,
    get_student_assessment_history,
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


@pytest.fixture
def candidate_profile(db):
    profile = db.query(StudentProfile).filter_by(display_name="Assessment Test Candidate").first()
    if not profile:
        profile = StudentProfile(
            display_name="Assessment Test Candidate",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            xp=100,
            streak_days=2
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def test_career_selection_and_overview(db):
    """Verify available careers include requested tracks with tools, competencies, and assessment format."""
    careers = list_careers(db=db)
    assert len(careers) >= 13

    career_slugs = {c.slug for c in careers}
    assert "java-developer" in career_slugs
    assert "python-developer" in career_slugs
    assert "data-analyst" in career_slugs
    assert "agentic-ai-engineer" in career_slugs
    assert "full-stack-developer" in career_slugs

    # Test Java Developer overview
    java_overview = get_career_overview(career_id_or_slug="java-developer", db=db)
    assert java_overview.title == "Java Developer"
    assert len(java_overview.core_competencies) >= 8
    assert len(java_overview.tools_and_technologies) >= 5
    assert java_overview.assessment_duration_mins >= 20
    assert java_overview.assessment_question_count == 25


def test_career_specific_assessment_generation(db, candidate_profile):
    """Verify career-specific assessments generate 25 balanced questions hiding answers."""
    req = StartAssessmentRequest(
        career_id_or_slug="java-developer",
        profile_id=candidate_profile.id
    )
    start_res = start_career_assessment(req=req, db=db)
    assert start_res.attempt_id > 0
    assert start_res.role_slug == "java-developer"
    assert start_res.total_questions == 25
    assert len(start_res.questions) == 25

    # Verify questions do not expose correct answers or explanations
    for q in start_res.questions:
        assert len(q.options) == 4
        assert not hasattr(q, "correct_answer_index")
        assert not hasattr(q, "explanation")
        assert q.category is not None
        assert q.difficulty in ["fundamentals", "intermediate", "practical", "advanced"]


def test_distinct_career_assessments(db, candidate_profile):
    """Verify different careers generate distinct assessments specific to their domains."""
    # Data Analyst assessment
    da_req = StartAssessmentRequest(
        career_id_or_slug="data-analyst",
        profile_id=candidate_profile.id
    )
    da_res = start_career_assessment(req=da_req, db=db)
    da_cats = {q.category for q in da_res.questions}

    # Agentic AI assessment
    ai_req = StartAssessmentRequest(
        career_id_or_slug="agentic-ai-engineer",
        profile_id=candidate_profile.id
    )
    ai_res = start_career_assessment(req=ai_req, db=db)
    ai_cats = {q.category for q in ai_res.questions}

    # They must test completely different competency categories
    assert any("Excel" in c or "Pandas" in c for c in da_cats)
    assert any("Agent" in c or "LangGraph" in c or "RAG" in c for c in ai_cats)


def test_answers_autosave_and_submission(db, candidate_profile):
    """Verify incremental autosave of answers and full scoring on submit."""
    # Start fresh Java Developer attempt
    role = db.query(CareerRole).filter_by(slug="java-developer").first()
    questions = db.query(CareerAssessmentQuestion).filter_by(role_id=role.id, is_active=True).all()
    assert len(questions) == 25

    attempt = CareerAssessmentAttempt(
        profile_id=candidate_profile.id,
        role_id=role.id,
        status="in_progress",
        answers={},
        review_flags=[]
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # 1. Autosave answers for first 10 questions
    sample_answers = {}
    for i, q in enumerate(questions[:10]):
        sample_answers[str(q.id)] = q.correct_answer_index  # answer correctly

    save_req = SaveAssessmentAnswersRequest(
        answers=sample_answers,
        review_flags=[questions[0].id, questions[1].id],
        time_spent_secs=300
    )
    save_res = save_assessment_answers(attempt_id=attempt.id, req=save_req, db=db)
    assert save_res["status"] == "saved"

    # 2. Submit assessment with answers for all 25 (first 21 correct, last 4 incorrect)
    all_answers = {}
    for i, q in enumerate(questions):
        if i < 21:
            all_answers[str(q.id)] = q.correct_answer_index
        else:
            all_answers[str(q.id)] = (q.correct_answer_index + 1) % 4  # wrong

    submit_req = SubmitAssessmentRequest(
        answers=all_answers,
        time_spent_secs=1200
    )
    submit_res = submit_career_assessment(attempt_id=attempt.id, req=submit_req, db=db)

    assert submit_res.attempt_id == attempt.id
    assert submit_res.total_questions == 25
    assert submit_res.answered_count == 25
    assert submit_res.correct_count == 21
    assert submit_res.incorrect_count == 4
    assert 60.0 <= submit_res.score_percentage <= 85.0
    assert submit_res.proficiency_level in ["Intermediate", "Advanced"]
    assert len(submit_res.category_scores) > 0
    assert len(submit_res.difficulty_scores) > 0
    assert len(submit_res.question_details) == 25


def test_skill_gap_analysis_and_career_readiness(db, candidate_profile):
    """Verify detailed skill gap analysis table, categories, and objective career readiness score."""
    # Find most recent evaluated attempt
    attempt = (
        db.query(CareerAssessmentAttempt)
        .filter_by(profile_id=candidate_profile.id, status="evaluated")
        .order_by(CareerAssessmentAttempt.completed_at.desc())
        .first()
    )
    assert attempt is not None

    gap_report = get_assessment_skill_analysis(attempt_id=attempt.id, db=db)
    assert gap_report.attempt_id == attempt.id
    assert gap_report.role_title is not None
    assert 0.0 <= gap_report.readiness_score <= 100.0
    assert len(gap_report.skills_table) > 0

    # Ensure table columns match requirements
    for item in gap_report.skills_table:
        assert item.skill_name is not None
        assert item.required_level in ["Advanced", "Intermediate", "Developing"]
        assert item.assessed_level in ["Advanced", "Intermediate", "Developing", "Beginner", "Not Covered"]
        assert item.gap_level in ["None", "Moderate", "High", "Critical", "Missing"]
        assert item.gap_status in ["Strong", "Needs Improvement", "Critical Gap", "High Gap", "Missing"]
        assert 1 <= item.priority <= 5


def test_personalized_roadmap_generation_from_assessment(db, candidate_profile):
    """Verify that personalized roadmap adapts to assessment results, prioritizing weak skills."""
    attempt = (
        db.query(CareerAssessmentAttempt)
        .filter_by(profile_id=candidate_profile.id, status="evaluated")
        .order_by(CareerAssessmentAttempt.completed_at.desc())
        .first()
    )
    assert attempt is not None

    req = GenerateRoadmapFromAssessmentRequest(
        attempt_id=attempt.id,
        weekly_hours=15,
        duration_weeks=12
    )
    roadmap = create_roadmap_from_assessment(req=req, db=db)

    assert roadmap.id > 0
    assert roadmap.role_id == attempt.role_id
    assert roadmap.tasks_count > 0
    assert len(roadmap.tasks) > 0
    assert roadmap.readiness_score >= 0.0


def test_assessment_history_persistence(db, candidate_profile):
    """Verify candidate can view past assessment attempts and track improvement over time."""
    history = get_student_assessment_history(profile_id=candidate_profile.id, db=db)
    assert len(history) >= 1
    first_attempt = history[0]
    assert first_attempt.id > 0
    assert first_attempt.role_title is not None
    assert first_attempt.status == "evaluated"
