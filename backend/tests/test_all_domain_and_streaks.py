"""
Tests for All-Domain Career Library, Career Discovery, Streaks & Reassessment.
Direct function tests matching the architecture of test_career_assessment_system.py.
"""
import pytest
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal
from app.models import StudentProfile, CareerRole, DailyActivityLog, WeeklyGoalRecord
from app.engine.all_domain_careers_data import ALL_DOMAIN_CAREERS, get_career_by_slug
from app.api.discovery import (
    get_discovery_questions,
    discover_career_paths,
    DiscoverySubmitRequest,
)
from app.api.activities import (
    log_activity_and_update_streaks,
    get_student_streak_status,
    update_weekly_goal,
    ActivityCompleteRequest,
    WeeklyGoalUpdateRequest,
)
from app.api.career_assessment import (
    start_career_assessment,
    submit_career_assessment,
    reassess_career_role,
    compare_assessment_attempts,
)
from app.schemas import (
    StartAssessmentRequest,
    SubmitAssessmentRequest,
)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_all_domain_careers_catalog_completeness():
    """Verify that catalog has at least 150 (actual 252) roles across 18 domains."""
    assert len(ALL_DOMAIN_CAREERS) >= 150
    domains = {c["domain"] for c in ALL_DOMAIN_CAREERS}
    assert len(domains) == 18
    assert "Technology and IT" in domains
    assert "Commerce, Finance & Banking" in domains
    assert "Healthcare, Medicine & Life Sciences" in domains
    assert "Law & Legal Services" in domains
    assert "Government, Civil Services & Public Policy" in domains
    assert "Core Engineering" in domains

    # Verify regulated disclaimers exist for medical and law
    doctor = get_career_by_slug("general-practitioner")
    assert doctor is not None
    assert doctor["is_regulated_profession"] is True
    assert "MBBS" in doctor["regulatory_disclaimer"]

    lawyer = get_career_by_slug("litigation-advocate")
    assert lawyer is not None
    assert lawyer["is_regulated_profession"] is True
    assert "Bar Council" in lawyer["regulatory_disclaimer"]


def test_career_discovery_questionnaire_and_evaluation(db):
    """Verify discovery questions and evaluator response."""
    # 1. Get questions
    q_data = get_discovery_questions()
    assert "questions" in q_data
    assert len(q_data["questions"]) >= 5

    # 2. Submit answers for technology profile
    req_tech = DiscoverySubmitRequest(
        answers={
            "stream": "engineering_tech",
            "interests": "coding_software",
            "analytical_style": "algorithmic",
            "work_style": "remote_tech",
            "career_priority": "high_growth_tech"
        }
    )
    res_tech = discover_career_paths(req_tech, db=db)
    assert len(res_tech.recommended_careers) >= 3
    top_role = res_tech.recommended_careers[0]
    assert top_role.match_percentage >= 75.0
    assert top_role.domain == "Technology and IT"
    assert len(top_role.key_competencies) > 0

    # 3. Submit answers for commerce profile
    req_comm = DiscoverySubmitRequest(
        answers={
            "stream": "commerce_finance",
            "interests": "finance_money",
            "analytical_style": "data_driven",
            "work_style": "corporate_client",
            "career_priority": "corporate_prestige"
        }
    )
    res_comm = discover_career_paths(req_comm, db=db)
    top_comm = res_comm.recommended_careers[0]
    assert "Finance" in top_comm.domain or "Commerce" in top_comm.domain or "Business" in top_comm.domain


def test_daily_streaks_and_duplicate_prevention(db):
    """Verify that daily streak increments once per calendar day and rejects artificial inflation."""
    yesterday_str = (datetime.now(timezone.utc).date() - timedelta(days=1)).strftime("%Y-%m-%d")
    test_student = StudentProfile(
        display_name="Streak Rigor Tester",
        education_level="Undergraduate",
        educational_field="Technology",
        degree_specialization="CS",
        streak_days=1,
        longest_streak=1,
        last_active_date=yesterday_str,  # Yesterday
        weekly_goal_type="days_per_week",
        weekly_goal_target=5,
        weekly_streak_count=0
    )
    db.add(test_student)
    db.commit()
    db.refresh(test_student)
    p_id = test_student.id

    # Activity 1: Today
    act1 = ActivityCompleteRequest(
        profile_id=p_id,
        activity_type="learn",
        title="Deep Study Python Concurrency",
        hours_spent=1.0,
        xp_reward=50
    )
    res1 = log_activity_and_update_streaks(act1, db=db)
    assert res1["daily_streak"] >= 2  # Incremented from yesterday

    # Activity 2 on same day: should NOT increment streak again
    act2 = ActivityCompleteRequest(
        profile_id=p_id,
        activity_type="practice",
        title="Practice Threading Locks",
        hours_spent=0.5,
        xp_reward=50
    )
    res2 = log_activity_and_update_streaks(act2, db=db)
    assert res2["daily_streak"] == res1["daily_streak"]  # Same count!

    # Check streak status endpoint
    status_data = get_student_streak_status(p_id, db=db)
    assert status_data["daily_streak"] == res1["daily_streak"]
    assert "weekly_goal" in status_data
    assert "heatmap" in status_data

    # Update weekly goal
    goal_req = WeeklyGoalUpdateRequest(goal_type="activities_per_week", goal_target=10)
    goal_res = update_weekly_goal(p_id, goal_req, db=db)
    assert goal_res["status"] == "success"


def test_configurable_assessment_and_reassessment_comparison(db):
    """Verify starting with custom question count and comparing two attempts."""
    # Start assessment with 10 questions and 15 mins
    start_req = StartAssessmentRequest(
        career_id_or_slug="java-developer",
        question_count=10,
        difficulty="intermediate",
        duration_mins=15
    )
    init_data = start_career_assessment(start_req, db=db)
    assert init_data.total_questions <= 10
    assert init_data.duration_mins == 15
    att_id = init_data.attempt_id

    # Submit answers
    answers = {str(q.id): q.options[0] for q in init_data.questions}
    sub_req = SubmitAssessmentRequest(
        attempt_id=att_id,
        answers=answers,
        time_spent_secs=450
    )
    submit_career_assessment(att_id, sub_req, db=db)

    # Start reassessment
    reassess_data = reassess_career_role(start_req, db=db)
    new_att_id = reassess_data.attempt_id
    assert new_att_id != att_id

    # Submit second attempt
    sub_req2 = SubmitAssessmentRequest(
        attempt_id=new_att_id,
        answers=answers,
        time_spent_secs=400
    )
    submit_career_assessment(new_att_id, sub_req2, db=db)

    # Compare attempts
    comp_data = compare_assessment_attempts(new_att_id, att_id, db=db)
    assert "score_delta" in comp_data
    assert "readiness_delta" in comp_data
    assert "summary" in comp_data
    assert comp_data["current_attempt_id"] == new_att_id
    assert comp_data["previous_attempt_id"] == att_id
