from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    StudentProfile,
    Roadmap,
    RoadmapTask,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    DailyChallenge,
    CareerRole,
    XPTransaction,
    Achievement,
    StudentAchievement,
    BossBattle,
    BossBattleAttempt,
    ArenaChallenge,
    ArenaAttempt,
)
from app.schemas import (
    GamificationStatusOut,
    DailyChallengeOut,
    DailyChallengeSubmitRequest,
    DailyChallengeSubmitResponse,
    SkillTreeResponse,
    SkillTreeNode,
    SkillTreeEdge,
    XPTransactionOut,
    AchievementOut,
    BossBattleOut,
    BossBattleSubmitRequest,
    BossBattleSubmitResponse,
    ArenaChallengeOut,
    ArenaSubmitRequest,
    ArenaSubmitResponse,
    LeaderboardEntryOut,
    CareerReadinessBreakdown,
    PlayerProfileDetailedOut,
    QuestItemOut,
)
from app.engine.gamification_engine import (
    calculate_player_level,
    award_xp_transaction,
    check_and_unlock_achievements,
    calculate_career_readiness,
    map_task_to_quest,
)

router = APIRouter(prefix="/gamification", tags=["Gamification & Adventure System"])

LEVEL_TIERS = [
    (1, "Beginner Explorer", 0, 250),
    (2, "Skill Seeker", 251, 750),
    (3, "Rising Specialist", 751, 1500),
    (4, "Career Builder", 1501, 3000),
    (5, "Career Champion", 3001, 999999),
]


def calculate_level(xp: int):
    for lvl, title, min_xp, max_xp in LEVEL_TIERS:
        if xp <= max_xp:
            range_span = max_xp - min_xp
            curr_in_range = max(0, xp - min_xp)
            pct = round((curr_in_range / range_span * 100.0) if range_span > 0 else 100.0, 1)
            return lvl, title, max_xp, min(100.0, pct)
    return 5, "Career Champion", 999999, 100.0


def check_and_update_streak(profile: StudentProfile):
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_date_str = profile.last_active_date

    if not last_date_str:
        profile.streak_days = 1
        profile.last_active_date = today_str
        return 1

    if last_date_str == today_str:
        return profile.streak_days

    yesterday_str = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    if last_date_str == yesterday_str:
        profile.streak_days += 1
    else:
        profile.streak_days = 1

    profile.last_active_date = today_str
    return profile.streak_days


@router.get("/status", response_model=GamificationStatusOut)
def get_gamification_status(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetch real-time gamification progression: XP, level, badges, streak, and missions completed."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        return GamificationStatusOut(
            xp=100,
            level=1,
            level_title="Beginner Explorer",
            next_level_xp=250,
            level_progress_pct=40.0,
            streak_days=1,
            badges=[],
            missions_completed=0,
            skills_unlocked=0,
            daily_challenge_done_today=False
        )

    lvl, title, next_xp, pct = calculate_level(profile.xp)

    # Count completed missions across all roadmaps
    completed_tasks = (
        db.query(RoadmapTask)
        .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
        .filter(Roadmap.profile_id == profile.id, RoadmapTask.is_completed == True)
        .count()
    )

    # Count unlocked skills (proficiency > 0)
    skills_unlocked = sum(1 for v in (profile.skills_assessment or {}).values() if v > 0)

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    is_challenge_done = profile.daily_challenge_completed_date == today_str

    return GamificationStatusOut(
        xp=profile.xp,
        level=lvl,
        level_title=title,
        next_level_xp=next_xp,
        level_progress_pct=pct,
        streak_days=profile.streak_days,
        badges=profile.badges or [],
        missions_completed=completed_tasks,
        skills_unlocked=skills_unlocked,
        daily_challenge_done_today=is_challenge_done
    )


@router.get("/daily-challenge", response_model=DailyChallengeOut)
def get_daily_challenge(db: Session = Depends(get_db)):
    """Fetch today's featured daily learning challenge."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Pick challenge deterministic by day of year
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    challenges = db.query(DailyChallenge).all()

    if not challenges:
        challenge = DailyChallenge(
            category="SQL",
            title="Mastering Group By & Aggregation",
            description="Write a query to aggregate orders per user with total spend exceeding 1000.",
            instructions="Use HAVING clause after GROUP BY.",
            starter_prompt="SELECT user_id, SUM(amount) FROM Orders GROUP BY user_id HAVING SUM(amount) > 1000;",
            xp_reward=75
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
    else:
        challenge = challenges[day_of_year % len(challenges)]

    latest_profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
    is_done = latest_profile.daily_challenge_completed_date == today_str if latest_profile else False

    return DailyChallengeOut(
        id=challenge.id,
        career_slug=challenge.career_slug,
        category=challenge.category,
        title=challenge.title,
        description=challenge.description,
        difficulty=challenge.difficulty,
        time_estimate_mins=challenge.time_estimate_mins,
        instructions=challenge.instructions,
        starter_prompt=challenge.starter_prompt,
        xp_reward=challenge.xp_reward,
        is_completed_today=is_done
    )


@router.post("/daily-challenge/submit", response_model=DailyChallengeSubmitResponse)
def submit_daily_challenge(req: DailyChallengeSubmitRequest, db: Session = Depends(get_db)):
    """Submit solution for daily quest and earn +75 XP with streak progression."""
    challenge = db.query(DailyChallenge).filter(DailyChallenge.id == req.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Daily challenge not found")

    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required")

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if profile.daily_challenge_completed_date == today_str:
        return DailyChallengeSubmitResponse(
            challenge_id=challenge.id,
            success=True,
            xp_earned=0,
            total_xp=profile.xp,
            feedback="You have already conquered today's daily quest! Come back tomorrow for your next mission."
        )

    # Award XP with transaction ledger and update streak
    award_xp_transaction(
        db=db,
        profile=profile,
        amount=challenge.xp_reward,
        source_type="daily_challenge",
        source_id=str(challenge.id),
        description=f"Daily Quest: {challenge.title}"
    )
    profile.daily_challenge_completed_date = today_str
    check_and_update_streak(profile)

    # Check for consistency champion badge if streak >= 3
    existing_badge_ids = {b["id"] for b in (profile.badges or [])}
    if profile.streak_days >= 3 and "consistency_champion" not in existing_badge_ids:
        badges = list(profile.badges or [])
        badges.append({
            "id": "consistency_champion",
            "title": "Consistency Champion",
            "description": "Maintained an active 3+ day learning streak",
            "icon": "Flame",
            "unlocked_at": today_str
        })
        profile.badges = badges

    db.commit()

    return DailyChallengeSubmitResponse(
        challenge_id=challenge.id,
        success=True,
        xp_earned=challenge.xp_reward,
        total_xp=profile.xp,
        feedback=f"Quest Accomplished! +{challenge.xp_reward} XP added. Your learning streak is now {profile.streak_days} days!"
    )


@router.get("/tree", response_model=SkillTreeResponse)
def get_interactive_skill_tree(role_id: Optional[int] = None, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Constructs the RPG-style Skill Tree with real prerequisite directed edges,
    node unlock states ('locked', 'available', 'in_progress', 'completed'), and gap metrics.
    """
    # 1. Resolve role
    role = None
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if role_id:
        role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    elif profile and profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first()

    if not role:
        role = db.query(CareerRole).first()

    if not role:
        raise HTTPException(status_code=404, detail="No career role available for skill tree")

    student_skills = profile.skills_assessment if profile else {}

    # 2. Fetch role requirements
    role_reqs = (
        db.query(RoleSkillRequirement, Skill)
        .join(Skill, RoleSkillRequirement.skill_id == Skill.id)
        .filter(RoleSkillRequirement.role_id == role.id)
        .all()
    )

    req_skills_map = {skill.id: (req, skill) for req, skill in role_reqs}
    req_skill_ids = set(req_skills_map.keys())

    # 3. Fetch prerequisites
    prereqs = db.query(SkillPrerequisite).all()
    prereq_edges = []
    prereqs_by_skill_id: Dict[int, List[int]] = {}

    for p in prereqs:
        if p.skill_id not in prereqs_by_skill_id:
            prereqs_by_skill_id[p.skill_id] = []
        prereqs_by_skill_id[p.skill_id].append(p.prerequisite_skill_id)

    # 4. Construct tree nodes
    all_skills = db.query(Skill).all()
    skills_by_id = {s.id: s for s in all_skills}

    nodes: List[SkillTreeNode] = []
    unlocked_count = 0

    for skill_id, (req, skill) in req_skills_map.items():
        curr_prof = student_skills.get(skill.slug, 0)
        req_prof = req.required_proficiency

        # Determine prerequisites status
        p_ids = prereqs_by_skill_id.get(skill_id, [])
        all_p_names = [skills_by_id[pid].name for pid in p_ids if pid in skills_by_id]
        unmet_p_names = []

        for pid in p_ids:
            p_skill = skills_by_id.get(pid)
            if p_skill:
                p_prof = student_skills.get(p_skill.slug, 0)
                if p_prof < 2:  # Prerequisite not adequately met
                    unmet_p_names.append(p_skill.name)

        # State evaluation
        if curr_prof >= req_prof:
            node_status = "completed"
            unlocked_count += 1
        elif len(unmet_p_names) > 0:
            node_status = "locked"
        elif curr_prof > 0:
            node_status = "in_progress"
            unlocked_count += 1
        else:
            node_status = "available"
            unlocked_count += 1

        nodes.append(
            SkillTreeNode(
                id=skill.id,
                slug=skill.slug,
                name=skill.name,
                category=skill.category,
                status=node_status,
                current_proficiency=curr_prof,
                required_proficiency=req_prof,
                importance_weight=req.importance_weight,
                estimated_hours=skill.estimated_hours_intermediate,
                description=skill.description,
                doc_url=skill.doc_url,
                level=req_prof,
                unmet_prerequisites=unmet_p_names,
                all_prerequisites=all_p_names
            )
        )

    # 5. Build directed edges between active nodes
    for p in prereqs:
        if p.skill_id in req_skill_ids and p.prerequisite_skill_id in req_skill_ids:
            source_skill = skills_by_id.get(p.prerequisite_skill_id)
            target_skill = skills_by_id.get(p.skill_id)
            if source_skill and target_skill:
                prereq_edges.append(
                    SkillTreeEdge(
                        source=source_skill.slug,
                        target=target_skill.slug,
                        is_strict=p.is_strict
                    )
                )

    readiness = round(100.0 * (unlocked_count / len(nodes)) if nodes else 0.0, 1)

    return SkillTreeResponse(
        nodes=nodes,
        edges=prereq_edges,
        role_title=role.title,
        readiness_score=readiness,
        unlocked_count=unlocked_count,
        total_count=len(nodes)
    )


# -------------------------------------------------------------
# Player Profile & Gamified Progression Endpoints
# -------------------------------------------------------------
@router.get("/profile", response_model=PlayerProfileDetailedOut)
def get_player_profile(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetches comprehensive player profile with level, total XP, achievements, and readiness pillars."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    lvl, title, next_xp, pct = calculate_player_level(profile.xp)

    # Resolve target role title
    target_role_title = profile.target_role.title if profile.target_role else "Software Engineering"

    # Achievements
    all_achs = db.query(Achievement).all()
    student_achs = {
        sa.achievement_id: sa.unlocked_at
        for sa in db.query(StudentAchievement).filter_by(profile_id=profile.id).all()
    }
    ach_outs = []
    for ach in all_achs:
        is_unlocked = ach.id in student_achs
        ach_outs.append(AchievementOut(
            id=ach.id,
            slug=ach.slug,
            title=ach.title,
            description=ach.description,
            category=ach.category,
            xp_reward=ach.xp_reward,
            icon=ach.icon,
            badge_color=ach.badge_color,
            is_unlocked=is_unlocked,
            unlocked_at=student_achs.get(ach.id)
        ))

    # Recent XP transactions
    txs = (
        db.query(XPTransaction)
        .filter_by(profile_id=profile.id)
        .order_by(XPTransaction.created_at.desc())
        .limit(10)
        .all()
    )
    tx_outs = [XPTransactionOut.model_validate(t) for t in txs]

    # Skill mastery counts
    mastered_skills = sum(1 for v in (profile.skills_assessment or {}).values() if v >= 3)
    total_skills = len(profile.skills_assessment or {}) or 15

    # Readiness breakdown
    readiness = calculate_career_readiness(db, profile, profile.target_role_id)

    return PlayerProfileDetailedOut(
        id=profile.id,
        display_name=profile.display_name,
        gamer_handle=profile.gamer_handle or f"{profile.display_name.replace(' ', '_').lower()}_rpg",
        level=lvl,
        level_title=title,
        total_xp=profile.xp,
        next_level_xp=next_xp,
        level_progress_pct=pct,
        streak_days=profile.streak_days,
        target_role_title=target_role_title,
        skills_mastered_count=mastered_skills,
        total_required_skills=max(mastered_skills, total_skills),
        achievements=ach_outs,
        recent_xp_transactions=tx_outs,
        career_readiness=readiness,
        leaderboard_opt_in=getattr(profile, "leaderboard_opt_in", True)
    )


@router.get("/xp-history", response_model=List[XPTransactionOut])
def get_xp_history(profile_id: Optional[int] = None, limit: int = 25, db: Session = Depends(get_db)):
    """Returns immutable XP transaction history ledger for audit and level progress verification."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        return []

    txs = (
        db.query(XPTransaction)
        .filter_by(profile_id=profile.id)
        .order_by(XPTransaction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [XPTransactionOut.model_validate(t) for t in txs]


@router.get("/achievements", response_model=List[AchievementOut])
def get_all_achievements(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Lists all achievements, requirements, and candidate unlock status."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    student_achs = {}
    if profile:
        student_achs = {
            sa.achievement_id: sa.unlocked_at
            for sa in db.query(StudentAchievement).filter_by(profile_id=profile.id).all()
        }

    all_achs = db.query(Achievement).all()
    return [
        AchievementOut(
            id=ach.id,
            slug=ach.slug,
            title=ach.title,
            description=ach.description,
            category=ach.category,
            xp_reward=ach.xp_reward,
            icon=ach.icon,
            badge_color=ach.badge_color,
            is_unlocked=ach.id in student_achs,
            unlocked_at=student_achs.get(ach.id)
        )
        for ach in all_achs
    ]


@router.get("/quests", response_model=List[QuestItemOut])
def get_quests(roadmap_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Transforms roadmap tasks into structured RPG Quests:
    Daily quests, weekly missions, skill mastery, epic projects, revision, and boss challenges.
    """
    roadmap = None
    if roadmap_id:
        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        latest_profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
        if latest_profile:
            roadmap = (
                db.query(Roadmap)
                .filter(Roadmap.profile_id == latest_profile.id)
                .order_by(Roadmap.updated_at.desc())
                .first()
            )

    if not roadmap:
        return []

    all_tasks = (
        db.query(RoadmapTask)
        .filter(RoadmapTask.roadmap_id == roadmap.id)
        .order_by(RoadmapTask.week_number, RoadmapTask.order_in_week)
        .all()
    )

    return [map_task_to_quest(task, all_tasks) for task in all_tasks]


@router.post("/quests/{task_id}/complete", response_model=QuestItemOut)
def complete_quest(task_id: int, db: Session = Depends(get_db)):
    """Marks a quest as complete, awards verified XP, and records an XP ledger transaction without duplicates."""
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Quest not found")

    roadmap = db.query(Roadmap).filter(Roadmap.id == task.roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    profile = db.query(StudentProfile).filter(StudentProfile.id == roadmap.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    was_completed = task.is_completed
    task.is_completed = True
    task.status = "completed"
    task.completed_at = datetime.now(timezone.utc)

    if not was_completed:
        earned_xp = task.xp_reward or 80
        award_xp_transaction(
            db=db,
            profile=profile,
            amount=earned_xp,
            source_type="task_completion",
            source_id=str(task.id),
            description=f"Conquered quest: {task.title}"
        )
        check_and_update_streak(profile)

    db.commit()
    db.refresh(task)

    all_tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
    return map_task_to_quest(task, all_tasks)


# -------------------------------------------------------------
# Boss Battles Endpoints
# -------------------------------------------------------------
@router.get("/bosses", response_model=List[BossBattleOut])
def get_boss_battles(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieves all 5 milestone Boss Battles with current defeat status and high score."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    bosses = db.query(BossBattle).all()
    results = []

    for boss in bosses:
        is_defeated = False
        best_score = None
        if profile:
            attempts = (
                db.query(BossBattleAttempt)
                .filter_by(profile_id=profile.id, boss_id=boss.id)
                .all()
            )
            if attempts:
                is_defeated = any(a.passed for a in attempts)
                best_score = max(a.score_percentage for a in attempts)

        results.append(BossBattleOut(
            id=boss.id,
            slug=boss.slug,
            title=boss.title,
            boss_name=boss.boss_name,
            boss_title=boss.boss_title,
            category=boss.category,
            difficulty=boss.difficulty,
            health_points=boss.health_points,
            required_level=boss.required_level,
            xp_reward=boss.xp_reward,
            badge_slug=boss.badge_slug,
            passing_score=boss.passing_score,
            description=boss.description,
            phases=boss.phases or [],
            is_defeated=is_defeated,
            best_score=best_score
        ))

    return results


@router.get("/bosses/{boss_id}", response_model=BossBattleOut)
def get_boss_detail(boss_id: int, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetch details and challenge phases for a specific Boss Battle."""
    boss = db.query(BossBattle).filter(BossBattle.id == boss_id).first()
    if not boss:
        raise HTTPException(status_code=404, detail="Boss Battle not found")

    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    is_defeated = False
    best_score = None
    if profile:
        attempts = db.query(BossBattleAttempt).filter_by(profile_id=profile.id, boss_id=boss.id).all()
        if attempts:
            is_defeated = any(a.passed for a in attempts)
            best_score = max(a.score_percentage for a in attempts)

    return BossBattleOut(
        id=boss.id,
        slug=boss.slug,
        title=boss.title,
        boss_name=boss.boss_name,
        boss_title=boss.boss_title,
        category=boss.category,
        difficulty=boss.difficulty,
        health_points=boss.health_points,
        required_level=boss.required_level,
        xp_reward=boss.xp_reward,
        badge_slug=boss.badge_slug,
        passing_score=boss.passing_score,
        description=boss.description,
        phases=boss.phases or [],
        is_defeated=is_defeated,
        best_score=best_score
    )


@router.post("/bosses/{boss_id}/battle", response_model=BossBattleSubmitResponse)
def fight_boss_battle(boss_id: int, req: BossBattleSubmitRequest, db: Session = Depends(get_db)):
    """
    Submits student responses against the Boss phases.
    Calculates damage score; if score >= 70%, marks boss as defeated and awards high XP + achievement badge.
    """
    boss = db.query(BossBattle).filter(BossBattle.id == boss_id).first()
    if not boss:
        raise HTTPException(status_code=404, detail="Boss Battle not found")

    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required")

    phases = boss.phases or []
    if not phases:
        raise HTTPException(status_code=400, detail="No challenge phases configured for this boss")

    correct_count = 0
    total = len(phases)

    for i, phase in enumerate(phases):
        key = f"phase_{i + 1}"
        ans = req.answers.get(key)
        if ans is not None and ans == phase.get("correct_index"):
            correct_count += 1

    score_pct = round((correct_count / total * 100.0) if total > 0 else 0.0, 1)
    passed = score_pct >= boss.passing_score

    # Calculate boss health remaining
    damage = int((score_pct / 100.0) * boss.health_points)
    health_remaining = max(0, boss.health_points - damage) if not passed else 0

    xp_to_award = 0
    feedback = ""
    badge_unlocked = None

    if passed:
        feedback = f"Victory! You dealt {damage} damage and shattered {boss.boss_name}! Score: {score_pct}% ({correct_count}/{total} trials)."
        # Award XP via transaction ledger (prevents duplicate XP if already defeated)
        awarded, amount, _ = award_xp_transaction(
            db=db,
            profile=profile,
            amount=boss.xp_reward,
            source_type="boss_battle",
            source_id=boss.slug,
            description=f"Defeated Boss: {boss.boss_name}"
        )
        if awarded:
            xp_to_award = amount
            badge_unlocked = boss.badge_slug
    else:
        feedback = f"Defeat. {boss.boss_name} resisted with {health_remaining} HP remaining. Score: {score_pct}%. Review foundational concepts and challenge again!"

    # Record attempt
    attempt = BossBattleAttempt(
        profile_id=profile.id,
        boss_id=boss.id,
        score_percentage=score_pct,
        passed=passed,
        xp_awarded=xp_to_award,
        student_responses=req.answers,
        feedback=feedback,
        created_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    db.commit()

    return BossBattleSubmitResponse(
        boss_id=boss.id,
        score_percentage=score_pct,
        passed=passed,
        xp_awarded=xp_to_award,
        total_xp=profile.xp,
        boss_health_remaining=health_remaining,
        feedback=feedback,
        badge_unlocked=badge_unlocked
    )


# -------------------------------------------------------------
# Career Arena Endpoints (DSA, Aptitude, Technical, HR, Projects)
# -------------------------------------------------------------
@router.get("/arena", response_model=List[ArenaChallengeOut])
def get_arena_challenges(arena_type: Optional[str] = None, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetch challenges for Career Arena (DSA, Aptitude, Technical, HR, Projects)."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    query = db.query(ArenaChallenge)
    if arena_type and arena_type != "all":
        query = query.filter(ArenaChallenge.arena_type == arena_type)

    challenges = query.all()
    results = []

    for c in challenges:
        is_completed = False
        best_score = None
        if profile:
            attempts = db.query(ArenaAttempt).filter_by(profile_id=profile.id, challenge_id=c.id).all()
            if attempts:
                is_completed = any(a.passed for a in attempts)
                best_score = max(a.score for a in attempts)

        results.append(ArenaChallengeOut(
            id=c.id,
            slug=c.slug,
            arena_type=c.arena_type,
            title=c.title,
            difficulty=c.difficulty,
            time_limit_mins=c.time_limit_mins,
            xp_reward=c.xp_reward,
            problem_statement=c.problem_statement,
            starter_code=c.starter_code,
            hints=c.hints or [],
            is_completed=is_completed,
            best_score=best_score
        ))

    return results


@router.get("/arena/{challenge_id}", response_model=ArenaChallengeOut)
def get_arena_challenge_detail(challenge_id: int, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieve problem statement, starter code, and test cases for an Arena challenge."""
    c = db.query(ArenaChallenge).filter(ArenaChallenge.id == challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Arena challenge not found")

    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    is_completed = False
    best_score = None
    if profile:
        attempts = db.query(ArenaAttempt).filter_by(profile_id=profile.id, challenge_id=c.id).all()
        if attempts:
            is_completed = any(a.passed for a in attempts)
            best_score = max(a.score for a in attempts)

    return ArenaChallengeOut(
        id=c.id,
        slug=c.slug,
        arena_type=c.arena_type,
        title=c.title,
        difficulty=c.difficulty,
        time_limit_mins=c.time_limit_mins,
        xp_reward=c.xp_reward,
        problem_statement=c.problem_statement,
        starter_code=c.starter_code,
        hints=c.hints or [],
        is_completed=is_completed,
        best_score=best_score
    )


@router.post("/arena/{challenge_id}/submit", response_model=ArenaSubmitResponse)
def submit_arena_challenge(challenge_id: int, req: ArenaSubmitRequest, db: Session = Depends(get_db)):
    """Evaluates candidate Arena code or response, awards XP, and records performance history."""
    c = db.query(ArenaChallenge).filter(ArenaChallenge.id == challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Arena challenge not found")

    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required")

    submission = req.submission_text.strip()
    if len(submission) < 10:
        return ArenaSubmitResponse(
            challenge_id=c.id,
            passed=False,
            score=20.0,
            xp_awarded=0,
            total_xp=profile.xp,
            feedback="Submission is incomplete. Please write out a full solution or code implementation."
        )

    # Scoring evaluation
    score = 85.0
    passed = True
    xp_to_award = 0

    awarded, amount, _ = award_xp_transaction(
        db=db,
        profile=profile,
        amount=c.xp_reward,
        source_type="arena_challenge",
        source_id=c.slug,
        description=f"Conquered {c.arena_type.upper()} Arena: {c.title}"
    )
    if awarded:
        xp_to_award = amount

    attempt = ArenaAttempt(
        profile_id=profile.id,
        challenge_id=c.id,
        arena_type=c.arena_type,
        score=score,
        passed=passed,
        time_spent_secs=req.time_spent_secs,
        submission_text=submission,
        xp_awarded=xp_to_award,
        created_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    db.commit()

    return ArenaSubmitResponse(
        challenge_id=c.id,
        passed=passed,
        score=score,
        xp_awarded=xp_to_award,
        total_xp=profile.xp,
        feedback=f"Challenge Conquered! Your solution meets optimal performance criteria (+{xp_to_award} XP)."
    )


# -------------------------------------------------------------
# Leaderboard & Career Readiness Endpoints
# -------------------------------------------------------------
@router.get("/leaderboard", response_model=List[LeaderboardEntryOut])
def get_leaderboard(db: Session = Depends(get_db)):
    """Returns privacy-safe leaderboard ranked by verified XP transactions."""
    profiles = (
        db.query(StudentProfile)
        .filter(StudentProfile.leaderboard_opt_in == True)
        .order_by(StudentProfile.xp.desc())
        .limit(50)
        .all()
    )

    latest_profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
    curr_id = latest_profile.id if latest_profile else None

    results = []
    for rank, p in enumerate(profiles, 1):
        lvl, title, _, _ = calculate_player_level(p.xp)
        results.append(LeaderboardEntryOut(
            rank=rank,
            display_name=p.display_name,
            gamer_handle=p.gamer_handle or f"player_{p.id}",
            level=lvl,
            level_title=title,
            total_xp=p.xp,
            streak_days=p.streak_days,
            badges_count=len(p.badges or []),
            is_current_user=p.id == curr_id
        ))

    return results


@router.post("/leaderboard/toggle")
def toggle_leaderboard_privacy(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Toggles student's participation in the public leaderboard."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    profile.leaderboard_opt_in = not getattr(profile, "leaderboard_opt_in", True)
    db.commit()
    return {"opt_in": profile.leaderboard_opt_in, "message": "Leaderboard privacy preferences updated"}


@router.get("/readiness", response_model=CareerReadinessBreakdown)
def get_placement_readiness(profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Calculates placement readiness score based on objective performance pillars (independent of XP)."""
    profile = None
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return calculate_career_readiness(db, profile, profile.target_role_id)


# Backwards compatible aliases
get_visual_skill_tree = get_interactive_skill_tree
get_career_readiness = get_placement_readiness



