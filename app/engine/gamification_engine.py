import logging
from datetime import datetime, timezone
from typing import Tuple, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    StudentProfile,
    Roadmap,
    RoadmapTask,
    SkillAssessmentResult,
    InterviewQuestion,
    DailyChallenge,
    XPTransaction,
    Achievement,
    StudentAchievement,
    BossBattle,
    BossBattleAttempt,
    ArenaChallenge,
    ArenaAttempt,
)
from app.schemas import (
    CareerReadinessBreakdown,
    QuestItemOut,
    AchievementOut,
    XPTransactionOut,
)

logger = logging.getLogger("roadmapiq.gamification")

# Level Tiers Configuration
LEVEL_TIERS = [
    (1, "Novice Explorer", 0, 250),
    (2, "Skill Seeker", 251, 750),
    (3, "Rising Specialist", 751, 1500),
    (4, "Career Builder", 1501, 3000),
    (5, "Career Champion", 3001, 999999),
]


def calculate_player_level(xp: int) -> Tuple[int, str, int, float]:
    """Calculates level, title, next_level_xp threshold, and progress percentage."""
    for lvl, title, min_xp, max_xp in LEVEL_TIERS:
        if lvl == 5 and xp >= min_xp:
            return 5, "Career Champion", 3000, 100.0
        if xp <= max_xp:
            range_span = max_xp - min_xp
            curr_in_range = max(0, xp - min_xp)
            pct = round((curr_in_range / range_span * 100.0) if range_span > 0 else 100.0, 1)
            return lvl, title, max_xp, min(100.0, pct)
    return 5, "Career Champion", 999999, 100.0


def award_xp_transaction(
    db: Session,
    profile: StudentProfile,
    amount: int,
    source_type: str,
    source_id: str,
    description: str
) -> Tuple[bool, int, str]:
    """
    Centrally awards XP and creates an immutable XPTransaction ledger entry.
    Strictly prevents duplicate rewards via unique constraint on (profile_id, source_type, source_id).
    """
    if amount <= 0:
        return False, 0, "Amount must be positive"

    # Check for duplicate
    existing = (
        db.query(XPTransaction)
        .filter(
            XPTransaction.profile_id == profile.id,
            XPTransaction.source_type == source_type,
            XPTransaction.source_id == str(source_id)
        )
        .first()
    )
    if existing:
        return False, 0, f"XP already awarded for {source_type}:{source_id} on {existing.created_at.strftime('%Y-%m-%d')}"

    # Record transaction
    tx = XPTransaction(
        profile_id=profile.id,
        amount=amount,
        source_type=source_type,
        source_id=str(source_id),
        description=description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(tx)

    # Increment profile XP and recalculate level
    profile.xp += amount
    lvl, title, _, _ = calculate_player_level(profile.xp)
    profile.level = lvl

    db.commit()
    db.refresh(profile)

    # Check and trigger achievements (prevent recursion if source_type is achievement)
    if source_type != "achievement":
        check_and_unlock_achievements(db, profile)

    return True, amount, f"+{amount} XP Awarded: {description}"


def check_and_unlock_achievements(db: Session, profile: StudentProfile) -> List[Achievement]:
    """Evaluates milestone conditions and unlocks achievements without duplicate triggers."""
    unlocked = []
    already_unlocked_ids = {
        sa.achievement_id for sa in db.query(StudentAchievement).filter_by(profile_id=profile.id).all()
    }

    achievements = db.query(Achievement).all()
    ach_by_slug = {a.slug: a for a in achievements}

    # 1. First Quest
    if "first_quest" in ach_by_slug and ach_by_slug["first_quest"].id not in already_unlocked_ids:
        has_completed_task = (
            db.query(RoadmapTask)
            .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
            .filter(Roadmap.profile_id == profile.id, RoadmapTask.is_completed == True)
            .first()
        )
        if has_completed_task:
            unlocked.append(ach_by_slug["first_quest"])

    # 2. First Coding Problem
    if "first_coding_problem" in ach_by_slug and ach_by_slug["first_coding_problem"].id not in already_unlocked_ids:
        passed_arena = db.query(ArenaAttempt).filter_by(profile_id=profile.id, passed=True).first()
        if passed_arena:
            unlocked.append(ach_by_slug["first_coding_problem"])

    # 3. 7-Day Streak
    if "seven_day_streak" in ach_by_slug and ach_by_slug["seven_day_streak"].id not in already_unlocked_ids:
        if profile.streak_days >= 7:
            unlocked.append(ach_by_slug["seven_day_streak"])

    # 4. Boss Slayer
    if "bug_slayer" in ach_by_slug and ach_by_slug["bug_slayer"].id not in already_unlocked_ids:
        defeated_boss = db.query(BossBattleAttempt).filter_by(profile_id=profile.id, passed=True).first()
        if defeated_boss:
            unlocked.append(ach_by_slug["bug_slayer"])

    # 5. Project Architect
    if "project_architect" in ach_by_slug and ach_by_slug["project_architect"].id not in already_unlocked_ids:
        has_evidence = (
            db.query(RoadmapTask)
            .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
            .filter(Roadmap.profile_id == profile.id, RoadmapTask.evidence_link != None, RoadmapTask.evidence_link != "")
            .first()
        )
        if has_evidence:
            unlocked.append(ach_by_slug["project_architect"])

    # 6. Interview Warrior
    if "interview_warrior" in ach_by_slug and ach_by_slug["interview_warrior"].id not in already_unlocked_ids:
        completed_interviews = db.query(InterviewQuestion).filter_by(is_completed=True).count()
        if completed_interviews >= 5:
            unlocked.append(ach_by_slug["interview_warrior"])

    # 7. Roadmap Master
    if "roadmap_master" in ach_by_slug and ach_by_slug["roadmap_master"].id not in already_unlocked_ids:
        completed_roadmaps = (
            db.query(Roadmap)
            .filter(Roadmap.profile_id == profile.id, Roadmap.readiness_score >= 90.0)
            .first()
        )
        if completed_roadmaps:
            unlocked.append(ach_by_slug["roadmap_master"])

    for ach in unlocked:
        existing_sa = db.query(StudentAchievement).filter_by(
            profile_id=profile.id,
            achievement_id=ach.id
        ).first()
        if not existing_sa:
            sa = StudentAchievement(
                profile_id=profile.id,
                achievement_id=ach.id,
                unlocked_at=datetime.now(timezone.utc)
            )
            db.add(sa)
            db.commit()
            # Bonus XP for achievement
            award_xp_transaction(
                db=db,
                profile=profile,
                amount=ach.xp_reward,
                source_type="achievement",
                source_id=ach.slug,
                description=f"Unlocked Achievement: {ach.title}"
            )

    return unlocked


def calculate_career_readiness(db: Session, profile: StudentProfile, role_id: Optional[int] = None) -> CareerReadinessBreakdown:
    """
    Computes a placement-readiness score (0-100%) independently of XP.
    Weights:
      - Skill Competency Assessments: 35%
      - Coding & DSA Challenges: 25%
      - Aptitude Results: 15%
      - Project Deliverables & Evidence: 15%
      - Mock Interview Evaluations: 10%
    """
    # 1. Skill Assessment Score (35%)
    results = db.query(SkillAssessmentResult).filter_by(profile_id=profile.id).all()
    if results:
        avg_assessment = sum(r.score_percentage for r in results) / len(results)
    else:
        # Fallback to self-reported proficiencies normalized to 100%
        skills_dict = profile.skills_assessment or {}
        if skills_dict:
            avg_prof = sum(skills_dict.values()) / (len(skills_dict) * 5)
            avg_assessment = avg_prof * 100.0
        else:
            avg_assessment = 35.0

    # 2. Coding & DSA Arena Score (25%)
    dsa_attempts = (
        db.query(ArenaAttempt)
        .filter(ArenaAttempt.profile_id == profile.id, ArenaAttempt.arena_type == "dsa")
        .all()
    )
    if dsa_attempts:
        coding_score = sum(a.score for a in dsa_attempts) / len(dsa_attempts)
    else:
        # Fallback based on completed programming tasks
        coding_score = min(100.0, avg_assessment * 0.9)

    # 3. Aptitude Score (15%)
    apt_attempts = (
        db.query(ArenaAttempt)
        .filter(ArenaAttempt.profile_id == profile.id, ArenaAttempt.arena_type == "aptitude")
        .all()
    )
    if apt_attempts:
        aptitude_score = sum(a.score for a in apt_attempts) / len(apt_attempts)
    else:
        # Estimate from level and streak consistency
        aptitude_score = min(100.0, 50.0 + (profile.streak_days * 5.0))

    # 4. Project Deliverables Score (15%)
    project_tasks_count = (
        db.query(RoadmapTask)
        .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
        .filter(Roadmap.profile_id == profile.id, RoadmapTask.deliverable != None)
        .count()
    )
    completed_projects_count = (
        db.query(RoadmapTask)
        .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
        .filter(
            Roadmap.profile_id == profile.id,
            RoadmapTask.deliverable != None,
            RoadmapTask.is_completed == True
        )
        .count()
    )
    if project_tasks_count > 0:
        project_score = round((completed_projects_count / project_tasks_count) * 100.0, 1)
    else:
        project_score = 40.0

    # 5. Interview Performance Score (10%)
    interview_count = db.query(InterviewQuestion).filter_by(is_completed=True).count()
    interview_score = min(100.0, interview_count * 12.5)  # 8 completed questions = 100%

    # Weighted aggregate calculation
    overall = (
        (avg_assessment * 0.35) +
        (coding_score * 0.25) +
        (aptitude_score * 0.15) +
        (project_score * 0.15) +
        (interview_score * 0.10)
    )
    overall = round(min(100.0, max(0.0, overall)), 1)

    is_ready = overall >= 75.0 and completed_projects_count >= 1

    summary = (
        f"Placement readiness calculated across 5 objective pillars: "
        f"Competencies ({round(avg_assessment, 1)}%), Coding ({round(coding_score, 1)}%), "
        f"Aptitude ({round(aptitude_score, 1)}%), Projects ({round(project_score, 1)}%), "
        f"and Interviews ({round(interview_score, 1)}%)."
    )

    return CareerReadinessBreakdown(
        overall_score=overall,
        skill_competency_score=round(avg_assessment, 1),
        coding_dsa_score=round(coding_score, 1),
        aptitude_score=round(aptitude_score, 1),
        project_deliverables_score=round(project_score, 1),
        interview_performance_score=round(interview_score, 1),
        summary=summary,
        is_ready_for_placement=is_ready,
    )


def map_task_to_quest(task: RoadmapTask, all_tasks: List[RoadmapTask]) -> QuestItemOut:
    """Converts a standard roadmap task into an engaging RPG Quest item."""
    # Classify quest type
    hours = task.estimated_hours
    t_type = task.task_type or "theory"
    title = task.title.lower()

    if task.deliverable and ("project" in title or "capstone" in title or hours >= 10):
        quest_type = "epic_project"
        xp = 250
    elif task.week_number == all_tasks[-1].week_number and task.order_in_week == len([t for t in all_tasks if t.week_number == task.week_number]):
        quest_type = "boss"
        xp = 350
    elif t_type in ["assessment", "quiz"]:
        quest_type = "skill_quest"
        xp = 100
    elif t_type == "revision" or "review" in title:
        quest_type = "revision"
        xp = 60
    elif hours <= 2 or task.order_in_week == 1:
        quest_type = "daily"
        xp = 50
    else:
        quest_type = "weekly_mission"
        xp = 80

    # Determine status
    if task.is_completed:
        status_str = "completed"
    elif task.status == "in_progress":
        status_str = "in_progress"
    else:
        # Check if previous tasks are complete
        prev_incomplete = any(
            t.week_number < task.week_number and not t.is_completed
            for t in all_tasks
        )
        status_str = "locked" if prev_incomplete else "available"

    # Difficulty mapping
    diff = "Medium"
    if hours <= 2:
        diff = "Easy"
    elif hours >= 8:
        diff = "Hard"

    res_list = [
        {"title": r.title, "url": r.url, "provider": r.provider, "format": r.format}
        for r in (task.resources or [])
    ]

    return QuestItemOut(
        task_id=task.id,
        roadmap_id=task.roadmap_id,
        title=task.mission_title or task.title,
        quest_type=quest_type,
        skill_name=task.skill.name if task.skill else task.skill_category,
        phase_name=task.phase_name,
        week_number=task.week_number,
        difficulty=diff,
        estimated_hours=task.estimated_hours,
        xp_reward=task.xp_reward or xp,
        description=task.description,
        completion_criteria=task.completion_criteria,
        deliverable=task.deliverable,
        evidence_link=task.evidence_link,
        status=status_str,
        is_completed=task.is_completed,
        resources=res_list
    )
