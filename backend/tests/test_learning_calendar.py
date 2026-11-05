"""
Test suite for RoadmapIQ Personal Learning Calendar, Activity Tracking, and Streak Engine.
"""
import pytest
from datetime import date
from app.database import SessionLocal
from app.models import StudentProfile
from app.api.activities import (
    log_student_activity_internal,
    get_learning_calendar,
    get_date_activities,
    get_learning_analytics,
    get_student_streak_status,
)


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def test_profile(db):
    profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
    assert profile is not None, "Profile 1 should exist in the seeded database"
    return profile


def test_calendar_endpoint_structure(db, test_profile):
    """Verify get_learning_calendar returns full month days with intensity and metadata."""
    res = get_learning_calendar(profile_id=test_profile.id, year=2026, month=11, category=None, db=db)
    assert res is not None
    assert res["year"] == 2026
    assert res["month"] == 11
    assert len(res["days"]) == 30
    first_day = res["days"][0]
    assert "date" in first_day
    assert "intensity" in first_day
    assert "activity_count" in first_day
    assert "total_hours" in first_day
    assert "categories" in first_day


def test_log_student_activity_internal_and_idempotency(db, test_profile):
    """Verify activity logging is persistent and idempotent."""
    import uuid
    initial_xp = test_profile.xp or 0
    idempotency_key = f"test_idem_quiz_{uuid.uuid4().hex[:10]}"

    # Log 1st time
    res1 = log_student_activity_internal(
        db=db,
        profile_id=test_profile.id,
        activity_type="quiz_completed",
        category="quiz",
        title="Python Data Structures Quiz",
        xp_reward=40,
        hours_spent=0.5,
        duration_minutes=30,
        score=9,
        score_total=10,
        idempotency_key=idempotency_key,
    )
    assert res1.get("status") == "success"

    # Check XP awarded
    db.refresh(test_profile)
    assert test_profile.xp >= initial_xp + 40

    # Log 2nd time with SAME idempotency key -> Must NOT duplicate
    res2 = log_student_activity_internal(
        db=db,
        profile_id=test_profile.id,
        activity_type="quiz_completed",
        category="quiz",
        title="Python Data Structures Quiz",
        xp_reward=40,
        hours_spent=0.5,
        duration_minutes=30,
        idempotency_key=idempotency_key,
    )
    assert res2.get("idempotent_duplicate") is True
    assert res2.get("status") == "already_recorded"
    assert res2.get("xp_awarded") == 0


def test_date_activities_retrieval(db, test_profile):
    """Verify get_date_activities returns all logged items for that day."""
    today_str = date.today().isoformat()
    # Log a distinct practice activity
    log_student_activity_internal(
        db=db,
        profile_id=test_profile.id,
        activity_type="exercise_solved",
        category="practice",
        title="Binary Search Algorithm Practice",
        xp_reward=30,
        hours_spent=0.4,
        duration_minutes=24,
        idempotency_key=f"test_practice_bs_{today_str}",
    )

    day_res = get_date_activities(profile_id=test_profile.id, date_str=today_str, category=None, db=db)
    assert "activities" in day_res
    assert len(day_res["activities"]) >= 1
    assert day_res["total_activities"] >= 1
    assert day_res["total_xp"] >= 30

    # Test category filter
    filtered = get_date_activities(profile_id=test_profile.id, date_str=today_str, category="practice", db=db)
    for act in filtered["activities"]:
        assert act["category"] == "practice"


def test_streak_status_and_milestones(db, test_profile):
    """Verify streak status returns current daily streak, weekly streak, and next milestone."""
    streak_info = get_student_streak_status(profile_id=test_profile.id, db=db)
    assert "current_daily_streak" in streak_info
    assert "longest_daily_streak" in streak_info
    assert "current_weekly_streak" in streak_info
    assert "next_streak_milestone" in streak_info
    assert "days_to_milestone" in streak_info
    assert streak_info["next_streak_milestone"] in (3, 7, 14, 21, 30, 60, 90, 180, 365)
    assert streak_info["current_daily_streak"] >= 1


def test_learning_analytics_metrics(db, test_profile):
    """Verify get_learning_analytics returns accurate summary statistics."""
    ana = get_learning_analytics(profile_id=test_profile.id, timeframe="monthly", year=2026, month=11, db=db)
    assert ana["timeframe"] == "monthly"
    assert ana["total_learning_days"] >= 1
    assert ana["total_learning_hours"] > 0
    assert "category_distribution" in ana
    assert "most_studied_topics" in ana
    assert "most_productive_days" in ana
    assert len(ana["most_productive_days"]) == 7
