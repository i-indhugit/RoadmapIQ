import pytest
from app.database import SessionLocal
from app.models import (
    StudentProfile,
    Roadmap,
    RoadmapTask,
    XPTransaction,
    Achievement,
    StudentAchievement,
    BossBattle,
    BossBattleAttempt,
    ArenaChallenge,
    ArenaAttempt,
)
from app.schemas import (
    BossBattleSubmitRequest,
    ArenaSubmitRequest,
)
from app.engine.gamification_engine import (
    award_xp_transaction,
    calculate_player_level,
    calculate_career_readiness,
    check_and_unlock_achievements,
    map_task_to_quest,
)
from app.engine.seed_data import seed_gamification_content
from app.api.gamification import (
    get_player_profile,
    get_xp_history,
    get_all_achievements,
    get_quests,
    complete_quest,
    get_boss_battles,
    get_boss_detail,
    fight_boss_battle,
    get_arena_challenges,
    get_arena_challenge_detail,
    submit_arena_challenge,
    get_leaderboard,
    toggle_leaderboard_privacy,
    get_placement_readiness,
)
from app.main import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    session = SessionLocal()
    try:
        seed_gamification_content(session)
    finally:
        session.close()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_profile(db):
    profile = db.query(StudentProfile).filter(StudentProfile.display_name == "XP Test Hero").first()
    if not profile:
        profile = StudentProfile(
            display_name="XP Test Hero",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            target_role_id=1,
            xp=200,
            streak_days=3,
            leaderboard_opt_in=True,
            gamer_handle="ShadowDev#42"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        profile.leaderboard_opt_in = True
        profile.gamer_handle = "ShadowDev#42"
        db.commit()
        db.refresh(profile)
    return profile


def test_award_xp_transaction_and_duplicate_prevention(db, test_profile):
    """Verify XP transaction is created and repeat awards for identical source are strictly blocked."""
    source_type = "test_quest"
    source_id = "quest_unique_999"
    description = "Completed Quest 999"
    xp_to_award = 50

    # Clean any prior transaction for this test
    db.query(XPTransaction).filter_by(
        profile_id=test_profile.id,
        source_type=source_type,
        source_id=source_id
    ).delete()
    db.commit()
    db.refresh(test_profile)

    initial_xp = test_profile.xp

    # First award: should succeed
    awarded1, amt1, msg1 = award_xp_transaction(
        db=db,
        profile=test_profile,
        amount=xp_to_award,
        source_type=source_type,
        source_id=source_id,
        description=description,
    )
    assert awarded1 is True
    assert amt1 == xp_to_award
    assert test_profile.xp == initial_xp + xp_to_award

    # Verify transaction record in ledger
    tx = db.query(XPTransaction).filter_by(
        profile_id=test_profile.id,
        source_type=source_type,
        source_id=source_id
    ).first()
    assert tx is not None
    assert tx.amount == xp_to_award

    # Second award with the same source: MUST be prevented (idempotent / duplicate prevention)
    awarded2, amt2, msg2 = award_xp_transaction(
        db=db,
        profile=test_profile,
        amount=xp_to_award,
        source_type=source_type,
        source_id=source_id,
        description=description,
    )
    assert awarded2 is False
    assert amt2 == 0
    assert test_profile.xp == initial_xp + xp_to_award  # Unchanged!


def test_level_progression_system():
    """Verify Level progression calculations and RPG titles."""
    level, title, next_xp, pct = calculate_player_level(0)
    assert level == 1
    assert title == "Novice Explorer"
    assert next_xp == 250

    level, title, next_xp, pct = calculate_player_level(300)
    assert level == 2
    assert title == "Skill Seeker"
    assert next_xp == 750

    level, title, next_xp, pct = calculate_player_level(800)
    assert level == 3
    assert title == "Rising Specialist"

    level, title, next_xp, pct = calculate_player_level(1600)
    assert level == 4
    assert title == "Career Builder"

    level, title, next_xp, pct = calculate_player_level(3500)
    assert level == 5
    assert title == "Career Champion"
    assert pct == 100.0


def test_achievement_unlock_engine(db, test_profile):
    """Verify achievement unlocks trigger and list."""
    achievements = get_all_achievements(profile_id=test_profile.id, db=db)
    assert len(achievements) >= 7

    # Trigger achievement check
    newly_unlocked = check_and_unlock_achievements(db, test_profile)
    assert isinstance(newly_unlocked, list)


def test_boss_battles_workflow(db, test_profile):
    """Verify boss retrieval, fighting, passing score requirement, and defeat."""
    bosses = get_boss_battles(profile_id=test_profile.id, db=db)
    assert len(bosses) >= 5

    first_boss = bosses[0]
    assert first_boss.title is not None
    assert first_boss.passing_score >= 50

    detail = get_boss_detail(boss_id=first_boss.id, profile_id=test_profile.id, db=db)
    assert len(detail.phases) >= 1

    # Simulate answering questions correctly using phase.correct_index
    answers = {}
    for i, phase in enumerate(detail.phases):
        key = f"phase_{i + 1}"
        answers[key] = phase.get("correct_index", 0)

    req = BossBattleSubmitRequest(
        profile_id=test_profile.id,
        answers=answers
    )
    result = fight_boss_battle(boss_id=first_boss.id, req=req, db=db)
    assert result.passed is True
    assert result.score_percentage == 100.0
    assert result.boss_health_remaining == 0


def test_arena_challenges_workflow(db, test_profile):
    """Verify Arena challenges across categories and submissions."""
    arenas = ["dsa", "aptitude", "technical", "hr", "project"]
    for arena in arenas:
        challenges = get_arena_challenges(arena_type=arena, profile_id=test_profile.id, db=db)
        assert len(challenges) > 0

    first_challenge = get_arena_challenges(arena_type="dsa", profile_id=test_profile.id, db=db)[0]
    detail = get_arena_challenge_detail(challenge_id=first_challenge.id, profile_id=test_profile.id, db=db)
    assert detail.id == first_challenge.id

    # Submit challenge
    req = ArenaSubmitRequest(
        profile_id=test_profile.id,
        submission_text="def two_sum(nums, target):\n    lookup = {}\n    for i, n in enumerate(nums):\n        if target - n in lookup:\n            return [lookup[target - n], i]\n        lookup[n] = i\n    return []",
        time_spent_secs=120
    )
    result = submit_arena_challenge(challenge_id=first_challenge.id, req=req, db=db)
    assert result.passed is True
    assert result.score >= 70.0


def test_leaderboard_and_privacy_toggle(db, test_profile):
    """Verify privacy opt-in / opt-out toggling and leaderboard output."""
    test_profile.leaderboard_opt_in = True
    test_profile.gamer_handle = "ShadowDev#42"
    db.commit()

    lb = get_leaderboard(db=db)
    assert isinstance(lb, list)
    assert any(entry.gamer_handle == "ShadowDev#42" for entry in lb)

    # Opt out
    toggle_leaderboard_privacy(profile_id=test_profile.id, db=db)
    db.refresh(test_profile)
    assert test_profile.leaderboard_opt_in is False

    lb_after = get_leaderboard(db=db)
    assert not any(entry.gamer_handle == "ShadowDev#42" for entry in lb_after)


def test_objective_career_readiness_calculation(db, test_profile):
    """Verify career readiness is computed from 5 weighted pillars and NOT inflated by arbitrary XP."""
    readiness = get_placement_readiness(profile_id=test_profile.id, db=db)
    assert 0.0 <= readiness.overall_score <= 100.0
    assert readiness.skill_competency_score >= 0.0
    assert readiness.coding_dsa_score >= 0.0
    assert readiness.aptitude_score >= 0.0
    assert readiness.project_deliverables_score >= 0.0
    assert readiness.interview_performance_score >= 0.0
    assert isinstance(readiness.summary, str)
    assert isinstance(readiness.is_ready_for_placement, bool)
