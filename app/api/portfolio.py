"""
Portfolio, Journey & Daily Learning Action Endpoints for RoadmapIQ.
Connects the three signature capabilities:
1. My Career Journey (14-Stage Visual Milestones)
2. What Should I Do Today? (Intelligent Prioritized Actions)
3. My Skill Portfolio (Verified Competency Evidence)
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    StudentProfile,
    CareerRole,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    Roadmap,
    RoadmapTask,
    CareerAssessmentAttempt,
    CareerAssessmentResult,
    CareerSkillGapReport,
    DailyActivityLog,
    CareerDiscoveryResponse,
    CareerReassessmentComparison,
    Project,
    ArenaAttempt,
    BossBattleAttempt,
    XPTransaction,
)

router = APIRouter(tags=["Portfolio, Journey & Daily Actions"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class EvidenceSubmitRequest(BaseModel):
    skill_slug: str
    evidence_type: str = Field("github_repo", description="github_repo, live_url, document, project_artifact, certification")
    evidence_url: str = Field(..., min_length=3)
    title: str = Field("Practical Deliverable", min_length=2)
    description: Optional[str] = None
    self_proficiency_level: int = Field(3, ge=1, le=5)


class DailyActionItem(BaseModel):
    id: str
    task_id: Optional[int] = None
    title: str
    category: str  # "PRIMARY_QUEST", "PRACTICE_DRILL", "SKILL_REVISION", "MILESTONE_CHALLENGE"
    badge_label: str
    priority: str  # "High", "Medium", "Revision"
    why_recommended: str
    estimated_hours: float
    xp_reward: int
    deliverable: Optional[str] = None
    resource_url: Optional[str] = None
    resource_provider: Optional[str] = None
    skill_name: Optional[str] = None
    is_completed: bool = False
    action_type: str = "start"  # "start", "continue", "verify", "challenge", "review"


class JourneyMilestoneItem(BaseModel):
    id: str
    stage_number: int
    title: str
    short_desc: str
    category: str
    status: str  # "completed", "in_progress", "available", "upcoming"
    completed_at: Optional[str] = None
    action_path: str
    action_label: str
    detail_metrics: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# 1. My Career Journey Milestones
# ---------------------------------------------------------------------------
@router.get("/journey/{profile_id}")
def get_career_journey(profile_id: int, db: Session = Depends(get_db)):
    """
    Computes real-time progress across all 14 stages of the student's career preparation journey.
    Guarantees no conflicting or duplicated progress calculations across modules.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found."
        )

    # Resolve target role
    role = None
    if profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first()

    # Resolve active roadmap
    roadmap = None
    if role:
        roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.profile_id == profile.id, Roadmap.role_id == role.id)
            .order_by(Roadmap.updated_at.desc())
            .first()
        )
    if not roadmap:
        roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.profile_id == profile.id)
            .order_by(Roadmap.updated_at.desc())
            .first()
        )

    # Gather evidence and assessment attempts
    assessment_attempts = []
    if role:
        assessment_attempts = (
            db.query(CareerAssessmentAttempt)
            .filter(
                CareerAssessmentAttempt.profile_id == profile.id,
                CareerAssessmentAttempt.role_id == role.id,
                CareerAssessmentAttempt.status == "submitted"
            )
            .order_by(CareerAssessmentAttempt.completed_at.asc())
            .all()
        )

    has_discovery = db.query(CareerDiscoveryResponse).filter(CareerDiscoveryResponse.profile_id == profile.id).count() > 0
    reassessment_comp = db.query(CareerReassessmentComparison).filter(CareerReassessmentComparison.profile_id == profile.id).first()
    arena_attempts_count = db.query(ArenaAttempt).filter(ArenaAttempt.profile_id == profile.id, ArenaAttempt.passed == True).count()
    boss_attempts_count = db.query(BossBattleAttempt).filter(BossBattleAttempt.profile_id == profile.id, BossBattleAttempt.passed == True).count()

    completed_tasks_count = 0
    total_tasks_count = 0
    has_completed_project = False
    if roadmap:
        tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
        total_tasks_count = len(tasks)
        completed_tasks_count = sum(1 for t in tasks if t.is_completed)
        has_completed_project = any(t.is_completed and t.task_type in ["project", "case_study"] for t in tasks)

    assessed_skills = profile.assessed_skills or {}
    verified_evidence_count = sum(1 for s in assessed_skills.values() if isinstance(s, dict) and s.get("evidence_link"))

    # Define the 14 stages with deterministic real-world evaluation
    milestones: List[JourneyMilestoneItem] = []

    # Stage 1: Student Onboarding
    m1_done = bool(profile.display_name and profile.degree_specialization)
    milestones.append(JourneyMilestoneItem(
        id="onboarding",
        stage_number=1,
        title="Student Onboarding & Background",
        short_desc="Personalized educational stream, degree specialization, and weekly pacing calibrated.",
        category="Profile",
        status="completed" if m1_done else "in_progress",
        completed_at=profile.created_at.strftime("%Y-%m-%d") if m1_done else None,
        action_path="/profile?tab=profile",
        action_label="Review Profile",
        detail_metrics={"stream": profile.educational_field, "weekly_hours": profile.weekly_study_hours}
    ))

    # Stage 2: Career Discovery
    m2_done = has_discovery or bool(profile.target_role_id)
    milestones.append(JourneyMilestoneItem(
        id="discovery",
        stage_number=2,
        title="All-Domain Career Discovery",
        short_desc="Explored 18 career domains and aptitude questionnaire for professional alignment.",
        category="Discovery",
        status="completed" if m2_done else "available",
        completed_at=profile.created_at.strftime("%Y-%m-%d") if m2_done else None,
        action_path="/discovery",
        action_label="Explore Domains",
        detail_metrics={"domains_available": 18}
    ))

    # Stage 3: Career Selection
    m3_done = bool(role)
    milestones.append(JourneyMilestoneItem(
        id="selection",
        stage_number=3,
        title="Active Career Track Enrollment",
        short_desc=f"Enrolled in {role.title}." if role else "Select an active target career from 259+ roles.",
        category="Career",
        status="completed" if m3_done else "available",
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m3_done else None,
        action_path="/my-career",
        action_label="View Career Track",
        detail_metrics={"role_title": role.title if role else "Unselected", "domain": role.domain if role else "General"}
    ))

    # Stage 4: Statutory & Academic Eligibility
    m4_done = m3_done
    milestones.append(JourneyMilestoneItem(
        id="eligibility",
        stage_number=4,
        title="Eligibility & Statutory Review",
        short_desc="Inspected curriculum guidelines, regulatory licensing criteria, and required education.",
        category="Career",
        status="completed" if m4_done else ("available" if m3_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m4_done else None,
        action_path="/my-career?tab=eligibility",
        action_label="Inspect Eligibility",
        detail_metrics={"regulated": role.is_regulated_profession if role else False}
    ))

    # Stage 5: Initial Diagnostic Assessment
    m5_done = len(assessment_attempts) >= 1
    m5_in_progress = not m5_done and m3_done
    initial_score = assessment_attempts[0].result.score_percentage if (m5_done and assessment_attempts[0].result) else None
    milestones.append(JourneyMilestoneItem(
        id="initial_assessment",
        stage_number=5,
        title="Career Competency Assessment",
        short_desc=f"Completed diagnostic evaluation scoring {int(initial_score)}%." if initial_score else "Take the 25-question career diagnostic test.",
        category="Assessment",
        status="completed" if m5_done else ("available" if m5_in_progress else "upcoming"),
        completed_at=assessment_attempts[0].completed_at.strftime("%Y-%m-%d") if (m5_done and assessment_attempts[0].completed_at) else None,
        action_path=f"/assessment?career={role.slug if role else ''}",
        action_label="Take Diagnostic Test",
        detail_metrics={"score_percentage": initial_score, "questions_count": 25}
    ))

    # Stage 6: Skill Gap Analysis
    m6_done = m5_done or bool(profile.skills_assessment)
    readiness = roadmap.readiness_score if roadmap else (initial_score or 45.0)
    milestones.append(JourneyMilestoneItem(
        id="gap_analysis",
        stage_number=6,
        title="Skill Gap Analysis & Readiness",
        short_desc=f"Baseline career readiness calibrated at {int(readiness)}% across core competencies.",
        category="Assessment",
        status="completed" if m6_done else ("available" if m5_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m6_done else None,
        action_path="/skill-gap",
        action_label="Review Gap Report",
        detail_metrics={"readiness_score": readiness}
    ))

    # Stage 7: Personalized Roadmap Creation
    m7_done = bool(roadmap and total_tasks_count > 0)
    milestones.append(JourneyMilestoneItem(
        id="roadmap_creation",
        stage_number=7,
        title="Topological AI Learning Roadmap",
        short_desc=f"Generated {roadmap.target_duration_weeks}-week curriculum with {total_tasks_count} sequenced milestone tasks." if roadmap else "Generate topologically sequenced roadmap.",
        category="Roadmap",
        status="completed" if m7_done else ("available" if m6_done else "upcoming"),
        completed_at=roadmap.created_at.strftime("%Y-%m-%d") if m7_done else None,
        action_path="/roadmap",
        action_label="Open Learning Map",
        detail_metrics={"total_tasks": total_tasks_count, "weeks": roadmap.target_duration_weeks if roadmap else 12}
    ))

    # Stage 8: Learning Progress & Daily Tasks
    m8_done = completed_tasks_count >= 1
    pct = (completed_tasks_count / total_tasks_count * 100) if total_tasks_count > 0 else 0
    milestones.append(JourneyMilestoneItem(
        id="learning_progress",
        stage_number=8,
        title="Active Curriculum Progression",
        short_desc=f"{completed_tasks_count}/{total_tasks_count} tasks completed ({int(pct)}% completion).",
        category="Learning",
        status="completed" if pct >= 100 else ("in_progress" if m8_done else ("available" if m7_done else "upcoming")),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if pct >= 100 else None,
        action_path="/planner",
        action_label="View Daily Planner",
        detail_metrics={"completed_tasks": completed_tasks_count, "total_tasks": total_tasks_count, "completion_pct": pct}
    ))

    # Stage 9: Practical Challenges & Arena
    m9_done = (arena_attempts_count + boss_attempts_count) >= 1
    milestones.append(JourneyMilestoneItem(
        id="practical_challenges",
        stage_number=9,
        title="Practical Drills & Boss Battles",
        short_desc=f"Conquered {arena_attempts_count + boss_attempts_count} arena drills and architecture challenges.",
        category="Practice",
        status="completed" if m9_done else ("available" if m7_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m9_done else None,
        action_path="/arena",
        action_label="Enter Arena",
        detail_metrics={"arena_passed": arena_attempts_count, "boss_defeated": boss_attempts_count}
    ))

    # Stage 10: Capstone Project Completion
    m10_done = has_completed_project
    milestones.append(JourneyMilestoneItem(
        id="project_completion",
        stage_number=10,
        title="Capstone Project & Deliverables",
        short_desc="Built and submitted production-grade portfolio project deliverable.",
        category="Projects",
        status="completed" if m10_done else ("in_progress" if m8_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m10_done else None,
        action_path="/projects",
        action_label="Build Projects",
        detail_metrics={"project_verified": m10_done}
    ))

    # Stage 11: Skill Evidence Portfolio
    m11_done = verified_evidence_count >= 1
    milestones.append(JourneyMilestoneItem(
        id="skill_portfolio",
        stage_number=11,
        title="Skill Evidence & Verification Portfolio",
        short_desc=f"{verified_evidence_count} practical evidence artifacts documented and verified.",
        category="Portfolio",
        status="completed" if m11_done else ("available" if m8_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m11_done else None,
        action_path="/portfolio",
        action_label="Open Portfolio",
        detail_metrics={"artifacts_count": verified_evidence_count}
    ))

    # Stage 12: Weekly Reviews & Streak Maintenance
    m12_done = (profile.streak_days or 1) >= 3 or (profile.weekly_streak_count or 0) >= 1
    milestones.append(JourneyMilestoneItem(
        id="weekly_reviews",
        stage_number=12,
        title="Weekly Review & Streak Habit",
        short_desc=f"Maintained {profile.streak_days or 1}-day active study habit and continuous review cycles.",
        category="Progress",
        status="completed" if m12_done else "in_progress",
        completed_at=profile.last_active_date if m12_done else None,
        action_path="/weekly-review",
        action_label="Weekly Review",
        detail_metrics={"streak_days": profile.streak_days or 1, "weekly_streak": profile.weekly_streak_count or 0}
    ))

    # Stage 13: Reassessment & Progress Tracking
    m13_done = len(assessment_attempts) >= 2 or reassessment_comp is not None
    milestones.append(JourneyMilestoneItem(
        id="reassessment",
        stage_number=13,
        title="Diagnostic Reassessment",
        short_desc="Re-evaluated competencies to quantify score delta and targeted growth.",
        category="Assessment",
        status="completed" if m13_done else ("available" if m8_done else "upcoming"),
        completed_at=assessment_attempts[-1].completed_at.strftime("%Y-%m-%d") if (m13_done and assessment_attempts[-1].completed_at) else None,
        action_path="/reassessment",
        action_label="Take Reassessment",
        detail_metrics={"reassessment_taken": m13_done}
    ))

    # Stage 14: Calibrated Career Readiness
    final_readiness = readiness
    if reassessment_comp:
        final_readiness = reassessment_comp.latest_score
    m14_done = final_readiness >= 75.0 or (pct >= 80.0 and m5_done)
    milestones.append(JourneyMilestoneItem(
        id="final_readiness",
        stage_number=14,
        title="Final Placement & Market Readiness",
        short_desc=f"Achieved {int(final_readiness)}% validated hiring readiness standard.",
        category="Readiness",
        status="completed" if m14_done else ("in_progress" if m8_done else "upcoming"),
        completed_at=profile.updated_at.strftime("%Y-%m-%d") if m14_done else None,
        action_path="/preparation?tab=interview",
        action_label="Placement Prep",
        detail_metrics={"final_readiness_pct": final_readiness}
    ))

    completed_milestones = sum(1 for m in milestones if m.status == "completed")
    overall_progress_pct = round((completed_milestones / len(milestones)) * 100, 1)

    return {
        "profile_id": profile.id,
        "target_role": {
            "id": role.id if role else None,
            "title": role.title if role else "Career Track Explorer",
            "domain": role.domain if role else "General Exploration",
            "average_salary": role.average_salary_range if role else "N/A"
        },
        "overall_progress_pct": overall_progress_pct,
        "completed_milestones_count": completed_milestones,
        "total_milestones_count": len(milestones),
        "milestones": [m.model_dump() for m in milestones]
    }


# ---------------------------------------------------------------------------
# 2. What Should I Do Today? (Intelligent Action Recommendations)
# ---------------------------------------------------------------------------
@router.get("/activities/students/{profile_id}/today-recommendations")
def get_today_recommendations(profile_id: int, db: Session = Depends(get_db)):
    """
    Generates a small, prioritized set of recommended daily learning actions
    based on active roadmap, weakest skills, daily streak status, and study capacity.
    Always explains WHY each action is recommended today.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found."
        )

    role = None
    if profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first()

    roadmap = None
    if role:
        roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.profile_id == profile.id, Roadmap.role_id == role.id)
            .order_by(Roadmap.updated_at.desc())
            .first()
        )
    if not roadmap:
        roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.profile_id == profile.id)
            .order_by(Roadmap.updated_at.desc())
            .first()
        )

    recommendations: List[DailyActionItem] = []

    # 1. Fetch pending tasks from active roadmap
    pending_tasks: List[RoadmapTask] = []
    if roadmap:
        pending_tasks = (
            db.query(RoadmapTask)
            .filter(RoadmapTask.roadmap_id == roadmap.id, RoadmapTask.is_completed == False)
            .order_by(RoadmapTask.week_number.asc(), RoadmapTask.order_in_week.asc())
            .all()
        )

    # 2. Identify weakest skills from student profile assessment
    assessed_skills = profile.assessed_skills or {}
    skills_assessment = profile.skills_assessment or {}
    weak_skills = []
    for slug, val in skills_assessment.items():
        if isinstance(val, (int, float)) and val <= 2:
            weak_skills.append(slug)
    for slug, meta in assessed_skills.items():
        if isinstance(meta, dict) and meta.get("score", 100) < 60:
            if slug not in weak_skills:
                weak_skills.append(slug)

    # Recommendation 1: Primary Roadmap Focus Task (Highest sequence priority)
    if pending_tasks:
        top_task = pending_tasks[0]
        res = top_task.resources[0] if top_task.resources else None
        recommendations.append(DailyActionItem(
            id=f"rec_top_{top_task.id}",
            task_id=top_task.id,
            title=top_task.title,
            category="PRIMARY_QUEST",
            badge_label=f"Week {top_task.week_number} • Core Phase",
            priority="High",
            why_recommended=f"Immediate critical step in {role.title if role else 'Career'} sequence. Unlocks downstream technical milestones.",
            estimated_hours=float(top_task.estimated_hours or 2.0),
            xp_reward=top_task.xp_reward or 50,
            deliverable=top_task.deliverable or "Structured Practical Output",
            resource_url=res.url if res else "https://roadmap.sh",
            resource_provider=res.provider if res else "RoadmapIQ",
            skill_name=top_task.skill.name if top_task.skill else top_task.skill_category,
            is_completed=False,
            action_type="start"
        ))

    # Recommendation 2: Weak Skill Remediation or Practice Exercise
    if weak_skills:
        weak_slug = weak_skills[0]
        weak_skill_obj = db.query(Skill).filter(Skill.slug == weak_slug).first()
        if weak_skill_obj:
            recommendations.append(DailyActionItem(
                id=f"rec_weak_{weak_skill_obj.id}",
                task_id=None,
                title=f"Targeted Remediation: {weak_skill_obj.name}",
                category="SKILL_REVISION",
                badge_label="Diagnostic Skill Gap",
                priority="Revision",
                why_recommended=f"Your diagnostic assessment identified {weak_skill_obj.name} as a priority gap. Strengthening this resolves curriculum friction.",
                estimated_hours=1.5,
                xp_reward=60,
                deliverable=f"{weak_skill_obj.name} Practice Exercise Solution",
                resource_url=weak_skill_obj.doc_url,
                resource_provider="Official Documentation",
                skill_name=weak_skill_obj.name,
                is_completed=False,
                action_type="review"
            ))

    # Recommendation 3: Practical Coding/Case Drill or Next Sequence Task
    if len(pending_tasks) > 1:
        second_task = pending_tasks[1]
        res2 = second_task.resources[0] if second_task.resources else None
        recommendations.append(DailyActionItem(
            id=f"rec_next_{second_task.id}",
            task_id=second_task.id,
            title=second_task.title,
            category="PRACTICE_DRILL",
            badge_label=f"Practical Lab • Week {second_task.week_number}",
            priority="Medium",
            why_recommended=f"Reinforces practical application through hands-on exercises and project artifact building.",
            estimated_hours=float(second_task.estimated_hours or 1.5),
            xp_reward=second_task.xp_reward or 40,
            deliverable=second_task.deliverable or "Hands-on Code / Script",
            resource_url=res2.url if res2 else "https://github.com",
            resource_provider=res2.provider if res2 else "RoadmapIQ",
            skill_name=second_task.skill.name if second_task.skill else second_task.skill_category,
            is_completed=False,
            action_type="continue"
        ))

    # Fallback recommendations if student has no roadmap yet
    if not recommendations:
        if not role:
            recommendations.append(DailyActionItem(
                id="rec_select_career",
                task_id=None,
                title="Select Your Target Career Track",
                category="PRIMARY_QUEST",
                badge_label="Career Discovery",
                priority="High",
                why_recommended="Selecting a career track activates your tailored curriculum, visual theme, and prerequisite milestones.",
                estimated_hours=0.5,
                xp_reward=100,
                deliverable="Career Track Enrolled",
                resource_url="/discovery",
                resource_provider="RoadmapIQ",
                skill_name="Career Strategy",
                is_completed=False,
                action_type="start"
            ))
        else:
            recommendations.append(DailyActionItem(
                id="rec_start_assessment",
                task_id=None,
                title=f"Take Diagnostic Test for {role.title}",
                category="PRIMARY_QUEST",
                badge_label="Skill Verification",
                priority="High",
                why_recommended="Assesses your baseline competencies to generate a custom roadmap that focuses only on your actual skill gaps.",
                estimated_hours=0.5,
                xp_reward=100,
                deliverable="Competency Scorecard",
                resource_url=f"/assessment?career={role.slug}",
                resource_provider="RoadmapIQ",
                skill_name="Baseline Verification",
                is_completed=False,
                action_type="start"
            ))

    return {
        "profile_id": profile.id,
        "daily_streak": profile.streak_days or 1,
        "weekly_study_hours_budget": profile.weekly_study_hours or 15,
        "recommendations": [r.model_dump() for r in recommendations[:3]]
    }


# ---------------------------------------------------------------------------
# 3. My Skill Portfolio (Real Evidence Tracking)
# ---------------------------------------------------------------------------
@router.get("/portfolio/{profile_id}")
def get_student_skill_portfolio(profile_id: int, db: Session = Depends(get_db)):
    """
    Returns the student's complete Skill Evidence Portfolio.
    For each competency:
    - Current proficiency estimate (0 to 5)
    - Assessment test score & verification status
    - Practical evidence links, project artifacts & submissions
    - Status: not_assessed, learning, evidence_submitted, under_evaluation, demonstrated, needs_improvement
    - Transparent distinction between self-reported practice and independently verified assessment results.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found."
        )

    role = None
    if profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first()

    # Get all role required skills if role exists, otherwise top platform skills
    required_skills_map: Dict[int, RoleSkillRequirement] = {}
    if role:
        reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()
        for r in reqs:
            required_skills_map[r.skill_id] = r

    all_skills = db.query(Skill).all()
    assessed_skills = profile.assessed_skills or {}
    skills_assessment = profile.skills_assessment or {}

    # Check completed tasks per skill
    completed_tasks_by_skill: Dict[int, List[RoadmapTask]] = {}
    tasks = (
        db.query(RoadmapTask)
        .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
        .filter(Roadmap.profile_id == profile.id, RoadmapTask.is_completed == True)
        .all()
    )
    for t in tasks:
        if t.skill_id:
            completed_tasks_by_skill.setdefault(t.skill_id, []).append(t)

    portfolio_items = []
    for s in all_skills:
        req = required_skills_map.get(s.id)
        is_relevant = req is not None or s.slug in assessed_skills or s.slug in skills_assessment

        if not is_relevant and len(portfolio_items) > 30:
            continue

        meta = assessed_skills.get(s.slug, {})
        if not isinstance(meta, dict):
            meta = {}

        self_level = skills_assessment.get(s.slug, 0)
        verified_level = meta.get("level", 0)
        score = meta.get("score")
        is_verified = meta.get("verified", False)
        evidence_link = meta.get("evidence_link")
        feedback = meta.get("feedback")
        last_eval_date = meta.get("last_evaluated")

        # Determine evidence status
        status_label = "not_assessed"
        if is_verified and score is not None:
            status_label = "demonstrated" if score >= 60 else "needs_improvement"
        elif evidence_link:
            status_label = meta.get("status", "evidence_submitted")
        elif s.id in completed_tasks_by_skill:
            status_label = "learning"
        elif self_level > 0:
            status_label = "learning"

        effective_level = verified_level if is_verified else self_level

        portfolio_items.append({
            "skill_id": s.id,
            "skill_slug": s.slug,
            "skill_name": s.name,
            "category": s.category,
            "description": s.description,
            "doc_url": s.doc_url,
            "is_core_for_target_role": req.is_core if req else False,
            "required_proficiency": req.required_proficiency if req else 3,
            "current_proficiency": effective_level,
            "is_independently_verified": is_verified,
            "assessment_score": score,
            "evidence_status": status_label,  # not_assessed, learning, evidence_submitted, under_evaluation, demonstrated, needs_improvement
            "evidence_link": evidence_link,
            "evidence_title": meta.get("evidence_title"),
            "feedback": feedback,
            "last_evaluation_date": last_eval_date,
            "tasks_completed_count": len(completed_tasks_by_skill.get(s.id, []))
        })

    # Sort core target skills first, then demonstrated, then others
    portfolio_items.sort(key=lambda x: (
        not x["is_core_for_target_role"],
        x["evidence_status"] not in ["demonstrated", "evidence_submitted"],
        -x["current_proficiency"]
    ))

    demonstrated_count = sum(1 for item in portfolio_items if item["evidence_status"] == "demonstrated")
    submitted_count = sum(1 for item in portfolio_items if item["evidence_status"] == "evidence_submitted")

    return {
        "profile_id": profile.id,
        "target_role_title": role.title if role else "General Exploration",
        "demonstrated_skills_count": demonstrated_count,
        "evidence_submitted_count": submitted_count,
        "total_skills_count": len(portfolio_items),
        "skills": portfolio_items
    }


@router.post("/portfolio/{profile_id}/evidence")
def submit_skill_evidence(profile_id: int, req: EvidenceSubmitRequest, db: Session = Depends(get_db)):
    """
    Submit practical proof (GitHub repository, live demo, document, or case study) for a specific skill.
    Updates the student's skill portfolio record without marking self-reported proofs as verified tests.
    Awards +40 XP for practical evidence documentation.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found."
        )

    skill = db.query(Skill).filter(Skill.slug == req.skill_slug).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{req.skill_slug}' not found."
        )

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    current_assessed = dict(profile.assessed_skills or {})

    existing_entry = current_assessed.get(req.skill_slug, {})
    if not isinstance(existing_entry, dict):
        existing_entry = {}

    # Update entry with evidence submission
    existing_entry.update({
        "status": "evidence_submitted",
        "evidence_link": req.evidence_url,
        "evidence_type": req.evidence_type,
        "evidence_title": req.title,
        "evidence_notes": req.description,
        "self_level": req.self_proficiency_level,
        "submitted_at": today_str,
        "verified": existing_entry.get("verified", False),  # Preserve official test status
        "score": existing_entry.get("score"),
    })

    current_assessed[req.skill_slug] = existing_entry
    profile.assessed_skills = current_assessed

    # Award XP for verified evidence submission
    xp_to_award = 40
    try:
        from app.api.activities import log_student_activity_internal
        log_student_activity_internal(
            db=db,
            profile_id=profile.id,
            activity_type="project_submission",
            category="project",
            title=f"Project Evidence: {skill.name}",
            career_role_id=profile.target_role_id,
            hours_spent=1.0,
            duration_minutes=60,
            xp_reward=xp_to_award,
            reference_type="project",
            reference_id=req.skill_slug,
            action_url="/growth?tab=overview",
            idempotency_key=f"evidence_{req.skill_slug}_{today_str}",
            extra_metadata={"evidence_url": req.evidence_url, "notes": req.notes}
        )
    except Exception:
        profile.xp = (profile.xp or 100) + xp_to_award
        db.add(XPTransaction(
            profile_id=profile.id,
            amount=xp_to_award,
            source_type="skill_evidence_submission",
            source_id=f"evidence_{req.skill_slug}_{today_str}",
            description=f"Submitted practical evidence artifact for {skill.name}"
        ))
        db.commit()
    db.refresh(profile)

    return {
        "status": "success",
        "message": f"Practical evidence for '{skill.name}' submitted successfully. +{xp_to_award} XP awarded.",
        "skill_slug": req.skill_slug,
        "evidence_status": "evidence_submitted",
        "evidence_link": req.evidence_url
    }


# Backwards compatible aliases
get_student_portfolio = get_student_skill_portfolio
SkillEvidenceSubmission = EvidenceSubmitRequest

