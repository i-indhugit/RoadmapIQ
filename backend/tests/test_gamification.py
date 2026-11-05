import pytest
from app.database import SessionLocal
from app.models import StudentProfile, DailyChallenge
from app.schemas import DailyChallengeSubmitRequest
from app.api.gamification import (
    get_gamification_status,
    get_daily_challenge,
    submit_daily_challenge,
    get_interactive_skill_tree,
    calculate_level,
    check_and_update_streak,
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


def test_level_calculation():
    lvl, title, next_xp, pct = calculate_level(150)
    assert lvl == 1
    assert title == "Beginner Explorer"
    assert next_xp == 250

    lvl2, title2, next_xp2, pct2 = calculate_level(500)
    assert lvl2 == 2
    assert title2 == "Skill Seeker"

    lvl5, title5, _, _ = calculate_level(5000)
    assert lvl5 == 5
    assert title5 == "Career Champion"


def test_gamification_status_endpoint(db):
    status = get_gamification_status(profile_id=None, db=db)
    assert status.xp >= 0
    assert status.level >= 1
    assert status.level_title is not None
    assert status.streak_days >= 1
    assert isinstance(status.badges, list)


def test_daily_challenge_and_submission(db):
    challenge = get_daily_challenge(db=db)
    assert challenge.id is not None
    assert challenge.title is not None
    assert challenge.xp_reward > 0
    assert challenge.instructions is not None

    # Get or create student profile
    profile = db.query(StudentProfile).first()
    if not profile:
        profile = StudentProfile(
            name="Test Hero",
            education_level="Bachelor's Degree",
            degree_specialization="Computer Science",
            current_technical_skills=["python"],
            target_role_id=1,
            xp=120,
            streak_days=2
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    initial_xp = profile.xp

    req = DailyChallengeSubmitRequest(
        challenge_id=challenge.id,
        solution_text="SELECT user_id, COUNT(*) FROM Orders GROUP BY user_id HAVING COUNT(*) > 5;",
        profile_id=profile.id
    )
    result = submit_daily_challenge(req=req, db=db)
    assert result.success is True
    assert result.xp_earned in (challenge.xp_reward, 0)
    assert result.total_xp >= initial_xp


def test_interactive_skill_tree_generation(db):
    tree = get_interactive_skill_tree(role_id=None, profile_id=None, db=db)
    assert tree.nodes is not None
    assert len(tree.nodes) > 0
    assert tree.role_title is not None
    assert tree.readiness_score >= 0.0

    # Ensure nodes have required gamified RPG fields
    valid_statuses = {"locked", "available", "in_progress", "completed"}
    for node in tree.nodes:
        assert node.slug is not None
        assert node.status in valid_statuses
        assert node.required_proficiency >= 1
        assert isinstance(node.unmet_prerequisites, list)
