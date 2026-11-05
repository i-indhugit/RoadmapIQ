from datetime import datetime, timezone
import math
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Roadmap,
    RoadmapTask,
    TaskResource,
    StudentProfile,
    CareerRole,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    LearningResource,
    Project,
    ProgressSnapshot,
)
from app.schemas import (
    RoadmapGenerateRequest,
    RoadmapSwitchRequest,
    RoadmapRescheduleRequest,
    RoadmapOut,
    RoadmapProgressOut,
    SkillGapAnalysisResponse,
    TaskOut,
    TaskResourceOut,
)
from app.engine.roadmap_generator import generate_roadmap_plan
from app.engine.skill_gap_analyzer import analyze_skill_gaps

router = APIRouter(tags=["Roadmaps"])


def format_roadmap_out(roadmap: Roadmap, db: Session) -> RoadmapOut:
    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).order_by(
        RoadmapTask.week_number, RoadmapTask.order_in_week
    ).all()

    # Pre-fetch prerequisite mappings for all skills in this roadmap
    all_skill_ids = [t.skill_id for t in tasks if t.skill_id]
    prereq_rows = (
        db.query(SkillPrerequisite).filter(SkillPrerequisite.skill_id.in_(all_skill_ids)).all()
        if all_skill_ids
        else []
    )
    needed_skill_ids = set(all_skill_ids) | {p.prerequisite_skill_id for p in prereq_rows}
    skills_map = (
        {s.id: s.name for s in db.query(Skill).filter(Skill.id.in_(needed_skill_ids)).all()}
        if needed_skill_ids
        else {}
    )

    prereqs_by_skill: Dict[int, List[int]] = {}
    for p in prereq_rows:
        prereqs_by_skill.setdefault(p.skill_id, []).append(p.prerequisite_skill_id)

    tasks_out = []
    completed_count = 0
    for t in tasks:
        if t.is_completed:
            completed_count += 1
        res_out = [
            TaskResourceOut(
                id=r.id,
                title=r.title,
                url=r.url,
                provider=r.provider,
                format=r.format
            ) for r in t.resources
        ]

        task_prereq_ids = prereqs_by_skill.get(t.skill_id, []) if t.skill_id else []
        task_prereq_titles = [skills_map.get(pid, f"Skill #{pid}") for pid in task_prereq_ids]

        tasks_out.append(
            TaskOut(
                id=t.id,
                roadmap_id=t.roadmap_id,
                skill_id=t.skill_id,
                phase_number=t.phase_number,
                phase_name=t.phase_name,
                week_number=t.week_number,
                order_in_week=t.order_in_week,
                title=t.title,
                skill_category=t.skill_category,
                task_type=t.task_type,
                description=t.description,
                estimated_hours=t.estimated_hours,
                actual_hours_spent=t.actual_hours_spent,
                priority=t.priority,
                status=t.status,
                is_completed=t.is_completed,
                completed_at=t.completed_at,
                completion_criteria=t.completion_criteria,
                deliverable=t.deliverable,
                evidence_link=t.evidence_link,
                day_of_week=getattr(t, "day_of_week", "Monday") or "Monday",
                day_number=getattr(t, "day_number", 1) or 1,
                activity_category=getattr(t, "activity_category", "LEARN") or "LEARN",
                practice_exercises=getattr(t, "practice_exercises", []) or [],
                quiz_data=getattr(t, "quiz_data", []) or [],
                coding_challenge=getattr(t, "coding_challenge", None),
                activity_method=getattr(t, "activity_method", "theory") or "theory",
                specialization_branch=getattr(t, "specialization_branch", None),
                workspace_data=getattr(t, "workspace_data", {}) or {},
                prerequisite_skill_ids=task_prereq_ids,
                prerequisite_titles=task_prereq_titles,
                resources=res_out
            )
        )

    role_title = roadmap.career_role.title if roadmap.career_role else f"Role #{roadmap.role_id}"

    return RoadmapOut(
        id=roadmap.id,
        profile_id=roadmap.profile_id,
        role_id=roadmap.role_id,
        role_title=role_title,
        target_duration_weeks=roadmap.target_duration_weeks,
        weekly_hours=roadmap.weekly_hours,
        readiness_score=roadmap.readiness_score,
        total_estimated_hours=roadmap.total_estimated_hours,
        is_over_capacity=roadmap.is_over_capacity,
        capacity_warning=roadmap.capacity_warning,
        summary=roadmap.summary,
        ai_advice=roadmap.ai_advice,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at,
        tasks_count=len(tasks),
        completed_tasks_count=completed_count,
        tasks=tasks_out
    )


def _build_and_persist_roadmap(
    role: CareerRole,
    profile: StudentProfile,
    weekly_hours: int,
    target_duration_weeks: int,
    preferred_format: str,
    skills_assessment: dict,
    db: Session
) -> Roadmap:
    from app.engine.universal_roadmap_engine import (
        ensure_role_curriculum_requirements,
        get_domain_config,
        get_specialization_branches,
        synthesize_milestone_workspace,
    )

    role_requirements = db.query(RoleSkillRequirement).filter(
        RoleSkillRequirement.role_id == role.id
    ).all()
    if not role_requirements:
        role_requirements = ensure_role_curriculum_requirements(role, db)

    domain_cfg = get_domain_config(role.domain or "Technology")
    specializations = get_specialization_branches(role.domain or "Technology")
    active_branch = specializations[0]["id"] if specializations else "core"

    # 1. Prerequisites
    prereqs = db.query(SkillPrerequisite.skill_id, SkillPrerequisite.prerequisite_skill_id).all()
    prereq_tuples = [(p[0], p[1]) for p in prereqs]

    # 2. Lookup maps
    all_skills = db.query(Skill).all()
    skills_by_id = {s.id: s for s in all_skills}

    all_resources = db.query(LearningResource).all()
    resources_by_skill_id: Dict[int, List[LearningResource]] = {}
    for r in all_resources:
        if r.skill_id not in resources_by_skill_id:
            resources_by_skill_id[r.skill_id] = []
        resources_by_skill_id[r.skill_id].append(r)

    projects = db.query(Project).filter(Project.role_id == role.id).all()

    # 3. Generate plan using the deterministic engine
    plan = generate_roadmap_plan(
        role=role,
        role_requirements=role_requirements,
        prerequisites=prereq_tuples,
        skills_by_id=skills_by_id,
        resources_by_skill_id=resources_by_skill_id,
        student_skills=skills_assessment or {},
        weekly_study_hours=weekly_hours,
        target_duration_weeks=target_duration_weeks,
        preferred_format=preferred_format,
        projects=projects
    )

    # 4. Save Roadmap entity (optionally enriched with Gemini)
    summary_text = plan.summary
    try:
        from app.engine.gemini_service import call_gemini
        gemini_summary = call_gemini(
            prompt=(
                f"Create a 2-sentence executive curriculum summary for a student preparing for '{role.title}'. "
                f"They have {target_duration_weeks} weeks, {weekly_hours} hrs/week, and {plan.readiness_score}% baseline readiness. "
                f"Highlight prerequisite focus and practical capstone execution."
            ),
            system_instruction="You are a senior technical hiring manager. Return strictly a 2-sentence executive summary."
        )
        if gemini_summary:
            summary_text = gemini_summary
    except Exception:
        pass

    new_roadmap = Roadmap(
        profile_id=profile.id,
        role_id=role.id,
        target_duration_weeks=plan.target_duration_weeks,
        weekly_hours=plan.weekly_hours,
        readiness_score=plan.readiness_score,
        total_estimated_hours=plan.total_estimated_hours,
        is_over_capacity=plan.is_over_capacity,
        capacity_warning=plan.capacity_warning,
        summary=summary_text
    )
    db.add(new_roadmap)
    db.flush()

    # 5. Save Tasks & TaskResources with Universal Workspace Data
    for t_data in plan.tasks:
        res_list = t_data.resources or []
        if not res_list:
            res_list = [
                {
                    "title": f"{t_data.title} Reference Guide",
                    "url": "https://en.wikipedia.org/wiki/" + t_data.title.replace(" ", "_"),
                    "provider": "Open Educational Reference",
                    "format": "documentation",
                    "is_free": True,
                }
            ]
        else:
            for r in res_list:
                if isinstance(r, dict) and "is_free" not in r:
                    r["is_free"] = True

        workspace = synthesize_milestone_workspace(
            title=t_data.title,
            phase_number=getattr(t_data, 'phase_number', 1),
            phase_name=getattr(t_data, 'phase_name', 'Phase 1: Foundations'),
            role=role,
            domain_cfg=domain_cfg,
            resources=res_list,
            week_number=t_data.week_number
        )

        practice_ex = workspace.get("practice", {})
        if "exercises" in practice_ex and isinstance(practice_ex["exercises"], dict):
            practice_ex = practice_ex["exercises"]
        task_entity = RoadmapTask(
            roadmap_id=new_roadmap.id,
            skill_id=t_data.skill_id,
            phase_number=getattr(t_data, 'phase_number', 1),
            phase_name=getattr(t_data, 'phase_name', 'Phase 1: Foundations'),
            week_number=t_data.week_number,
            order_in_week=t_data.order_in_week,
            title=t_data.title,
            skill_category=t_data.skill_category,
            task_type=t_data.task_type,
            description=t_data.description,
            estimated_hours=t_data.estimated_hours,
            priority=t_data.priority,
            completion_criteria=t_data.completion_criteria,
            deliverable=getattr(t_data, 'deliverable', None),
            status="not_started",
            is_completed=getattr(t_data, 'is_completed', False),
            actual_hours_spent=getattr(t_data, 'actual_hours_spent', 0.0),
            evidence_link=getattr(t_data, 'evidence_link', None),
            activity_method=domain_cfg["method"],
            specialization_branch=active_branch,
            workspace_data=workspace,
            practice_exercises=[
                practice_ex.get("beginner", ""),
                practice_ex.get("intermediate", ""),
                practice_ex.get("advanced", ""),
            ],
            quiz_data=workspace.get("evaluate", {}).get("checkpoint_quiz", []),
        )
        db.add(task_entity)
        db.flush()

        for res in res_list:
            db.add(
                TaskResource(
                    task_id=task_entity.id,
                    title=res["title"],
                    url=res["url"],
                    provider=res["provider"],
                    format=res.get("format", "documentation")
                )
            )

    # 6. Record initial ProgressSnapshot
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    snapshot = ProgressSnapshot(
        profile_id=profile.id,
        roadmap_id=new_roadmap.id,
        recorded_date=today_str,
        completed_tasks_count=0,
        total_tasks_count=len(plan.tasks),
        completion_percentage=0.0,
        readiness_score=plan.readiness_score,
        hours_spent=0.0
    )
    db.add(snapshot)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap


@router.post("/roadmaps/generate", response_model=RoadmapOut, status_code=status.HTTP_201_CREATED)
def generate_roadmap(req: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    """
    Generates a personalized, topologically sequenced AI learning roadmap.
    Executes rule-based gap analysis, checks prerequisite DAG, and persists tasks across 5 phases.
    """
    # 1. Resolve student profile
    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        profile = StudentProfile(
            display_name="Future Professional",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            current_status="student",
            current_experience_level="Intermediate",
            target_role_id=req.role_id,
            weekly_study_hours=req.weekly_hours,
            target_duration_weeks=req.target_duration_weeks,
            preferred_learning_format=req.preferred_format,
            skills_assessment=req.skills_assessment
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Update profile target role and assessment if provided
    profile.target_role_id = req.role_id
    profile.weekly_study_hours = req.weekly_hours
    profile.target_duration_weeks = req.target_duration_weeks
    profile.preferred_learning_format = req.preferred_format
    if req.skills_assessment:
        profile.skills_assessment = req.skills_assessment
    db.commit()

    # 2. Fetch role
    role = db.query(CareerRole).filter(CareerRole.id == req.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role #{req.role_id} not found"
        )

    new_roadmap = _build_and_persist_roadmap(
        role=role,
        profile=profile,
        weekly_hours=req.weekly_hours,
        target_duration_weeks=req.target_duration_weeks,
        preferred_format=req.preferred_format,
        skills_assessment=req.skills_assessment or profile.skills_assessment or {},
        db=db
    )

    return format_roadmap_out(new_roadmap, db)


@router.post("/roadmaps/switch", response_model=RoadmapOut)
def switch_career_roadmap(req: RoadmapSwitchRequest, db: Session = Depends(get_db)):
    """
    Switches active career dynamically.
    - If a roadmap already exists for (profile_id, role_id) and force_regenerate is False:
      Restores that roadmap and its exact saved task completion progress.
    - If no roadmap exists yet for that career:
      Generates and persists a new topologically sequenced roadmap for that career.
    - Updates the profile's target_role_id in the database immediately.
    """
    role = db.query(CareerRole).filter(CareerRole.id == req.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role #{req.role_id} not found"
        )

    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        profile = StudentProfile(
            display_name="Future Professional",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            current_status="student",
            current_experience_level="Intermediate",
            target_role_id=role.id,
            weekly_study_hours=req.weekly_hours or 15,
            target_duration_weeks=req.target_duration_weeks or 12,
            preferred_learning_format=req.preferred_format or "mixed",
            skills_assessment=req.skills_assessment or {}
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Sync profile target role
    profile.target_role_id = role.id
    if req.weekly_hours:
        profile.weekly_study_hours = req.weekly_hours
    if req.target_duration_weeks:
        profile.target_duration_weeks = req.target_duration_weeks
    if req.preferred_format:
        profile.preferred_learning_format = req.preferred_format
    if req.skills_assessment:
        profile.skills_assessment = req.skills_assessment
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Look for existing roadmap for this profile and role
    if not req.force_regenerate:
        existing = db.query(Roadmap).filter(
            Roadmap.profile_id == profile.id,
            Roadmap.role_id == role.id
        ).order_by(Roadmap.updated_at.desc()).first()

        if existing:
            # Check it has tasks
            task_count = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == existing.id).count()
            if task_count > 0:
                existing.updated_at = datetime.now(timezone.utc)
                db.commit()
                db.refresh(existing)
                return format_roadmap_out(existing, db)

    # If force_regenerate or no existing roadmap, generate one
    new_roadmap = _build_and_persist_roadmap(
        role=role,
        profile=profile,
        weekly_hours=req.weekly_hours or profile.weekly_study_hours or 15,
        target_duration_weeks=req.target_duration_weeks or profile.target_duration_weeks or 12,
        preferred_format=req.preferred_format or profile.preferred_learning_format or "mixed",
        skills_assessment=req.skills_assessment or profile.skills_assessment or {},
        db=db
    )

    return format_roadmap_out(new_roadmap, db)


@router.get("/roadmaps/by-role/{role_id}", response_model=RoadmapOut)
def get_roadmap_by_role(role_id: int, profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetch the latest saved roadmap for a specific career role and profile."""
    prof_id = profile_id
    if not prof_id:
        latest_prof = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
        if latest_prof:
            prof_id = latest_prof.id

    if not prof_id:
        raise HTTPException(status_code=404, detail="No profile found")

    roadmap = db.query(Roadmap).filter(
        Roadmap.profile_id == prof_id,
        Roadmap.role_id == role_id
    ).order_by(Roadmap.updated_at.desc()).first()

    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail=f"No existing roadmap for role #{role_id} on profile #{prof_id}"
        )

    return format_roadmap_out(roadmap, db)


@router.post("/roadmaps/{roadmap_id}/reschedule", response_model=RoadmapOut)
def reschedule_roadmap(roadmap_id: int, req: RoadmapRescheduleRequest, db: Session = Depends(get_db)):
    """
    Adaptive roadmap rescheduling:
    Preserves all completed tasks, completion timestamps, and evidence links.
    Recalculates week pacing for incomplete tasks based on new study hours and target duration.
    """
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap #{roadmap_id} not found"
        )

    # Update parameters if provided
    new_hours = req.new_weekly_hours or roadmap.weekly_hours
    new_weeks = req.new_duration_weeks or roadmap.target_duration_weeks
    roadmap.weekly_hours = new_hours
    roadmap.target_duration_weeks = new_weeks

    # Separate completed tasks from uncompleted tasks
    completed_tasks = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap.id,
        RoadmapTask.is_completed == True
    ).order_by(RoadmapTask.week_number, RoadmapTask.order_in_week).all()

    incomplete_tasks = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap.id,
        RoadmapTask.is_completed == False
    ).order_by(RoadmapTask.phase_number, RoadmapTask.id).all()

    max_completed_week = max([t.week_number for t in completed_tasks], default=0)
    start_week = max_completed_week + 1
    total_weeks_available = max(start_week, new_weeks)
    remaining_weeks = total_weeks_available - max_completed_week

    # Calculate remaining capacity
    remaining_hours_needed = sum(t.estimated_hours for t in incomplete_tasks)
    remaining_capacity = remaining_weeks * new_hours

    if remaining_hours_needed > remaining_capacity:
        roadmap.is_over_capacity = True
        hours_deficit = remaining_hours_needed - remaining_capacity
        extra_weeks = math.ceil(hours_deficit / new_hours)
        roadmap.capacity_warning = (
            f"At {new_hours} hrs/week over the remaining {remaining_weeks} weeks, your study capacity is {remaining_capacity} hours, "
            f"but remaining tasks require {remaining_hours_needed} hours. We recommend extending your timeline by {extra_weeks} weeks "
            f"or increasing study to {math.ceil(remaining_hours_needed / remaining_weeks)} hrs/week."
        )
    else:
        roadmap.is_over_capacity = False
        roadmap.capacity_warning = None

    # Distribute incomplete tasks across remaining weeks
    current_week = start_week
    accumulated_week_hours = 0
    order_in_week = 1

    for task in incomplete_tasks:
        if accumulated_week_hours + task.estimated_hours > new_hours and current_week < total_weeks_available:
            current_week += 1
            accumulated_week_hours = 0
            order_in_week = 1

        task.week_number = current_week
        task.order_in_week = order_in_week
        accumulated_week_hours += task.estimated_hours
        order_in_week += 1

    roadmap.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(roadmap)

    return format_roadmap_out(roadmap, db)


@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapOut)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    """Fetch a generated roadmap by ID with all tasks and resources."""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap #{roadmap_id} not found"
        )
    return format_roadmap_out(roadmap, db)


@router.get("/roadmaps/{roadmap_id}/progress", response_model=RoadmapProgressOut)
def get_roadmap_progress(roadmap_id: int, db: Session = Depends(get_db)):
    """Fetch detailed progress statistics, hours logged, and completion breakdown."""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap #{roadmap_id} not found"
        )

    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.is_completed)
    completion_percentage = round((completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 0.0, 1)

    total_hours = sum(t.estimated_hours for t in tasks)
    completed_hours = sum(t.actual_hours_spent if t.actual_hours_spent > 0 else (t.estimated_hours if t.is_completed else 0) for t in tasks)

    # Mastered skills: skills where all tasks are completed
    skill_tasks: Dict[int, List[bool]] = {}
    for t in tasks:
        if t.skill_id:
            if t.skill_id not in skill_tasks:
                skill_tasks[t.skill_id] = []
            skill_tasks[t.skill_id].append(t.is_completed)

    mastered_count = sum(1 for sid, statuses in skill_tasks.items() if all(statuses))

    # Weekly breakdown
    weeks_map: Dict[int, Dict[str, Any]] = {}
    for t in tasks:
        wn = t.week_number
        if wn not in weeks_map:
            weeks_map[wn] = {
                "week_number": wn,
                "total_tasks": 0,
                "completed_tasks": 0,
                "total_hours": 0,
                "completed_hours": 0
            }
        weeks_map[wn]["total_tasks"] += 1
        weeks_map[wn]["total_hours"] += t.estimated_hours
        if t.is_completed:
            weeks_map[wn]["completed_tasks"] += 1
            weeks_map[wn]["completed_hours"] += (t.actual_hours_spent if t.actual_hours_spent > 0 else t.estimated_hours)

    weekly_progress = sorted(weeks_map.values(), key=lambda w: w["week_number"])

    return RoadmapProgressOut(
        roadmap_id=roadmap.id,
        readiness_score=roadmap.readiness_score,
        completion_percentage=completion_percentage,
        completed_tasks=completed_tasks,
        total_tasks=total_tasks,
        completed_hours=completed_hours,
        total_hours=total_hours,
        skills_mastered_count=mastered_count,
        streak_days=3,
        weekly_progress=weekly_progress
    )


@router.get("/roadmaps/{roadmap_id}/skill-gaps", response_model=SkillGapAnalysisResponse)
def get_roadmap_skill_gaps(roadmap_id: int, db: Session = Depends(get_db)):
    """Fetch skill-gap analysis for the roadmap's target role and student skills."""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap #{roadmap_id} not found"
        )

    role = db.query(CareerRole).filter(CareerRole.id == roadmap.role_id).first()
    role_requirements = db.query(RoleSkillRequirement).filter(
        RoleSkillRequirement.role_id == roadmap.role_id
    ).all()

    # Prerequisites
    prereqs = db.query(SkillPrerequisite.skill_id, SkillPrerequisite.prerequisite_skill_id).all()
    prereq_map: Dict[int, List[int]] = {}
    for sid, pid in prereqs:
        if sid not in prereq_map:
            prereq_map[sid] = []
        prereq_map[sid].append(pid)

    all_skills = db.query(Skill).all()
    skills_by_id = {s.id: s for s in all_skills}

    student_skills = roadmap.student_profile.skills_assessment if roadmap.student_profile else {}

    return analyze_skill_gaps(
        role=role,
        role_requirements=role_requirements,
        prerequisite_map=prereq_map,
        skill_lookup=skills_by_id,
        student_skills=student_skills
    )


@router.post("/skill-gaps/analyze", response_model=SkillGapAnalysisResponse)
def analyze_gaps_ad_hoc(role_id: int, skills: Dict[str, int], db: Session = Depends(get_db)):
    """Analyze skill gaps for a selected role and self-reported skills without generating a full roadmap."""
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role_requirements = db.query(RoleSkillRequirement).filter(
        RoleSkillRequirement.role_id == role.id
    ).all()

    prereqs = db.query(SkillPrerequisite.skill_id, SkillPrerequisite.prerequisite_skill_id).all()
    prereq_map: Dict[int, List[int]] = {}
    for sid, pid in prereqs:
        if sid not in prereq_map:
            prereq_map[sid] = []
        prereq_map[sid].append(pid)

    all_skills = db.query(Skill).all()
    skills_by_id = {s.id: s for s in all_skills}

    return analyze_skill_gaps(
        role=role,
        role_requirements=role_requirements,
        prerequisite_map=prereq_map,
        skill_lookup=skills_by_id,
        student_skills=skills
    )


@router.get("/roadmaps/{roadmap_id}/specializations")
def get_roadmap_specializations(roadmap_id: int, db: Session = Depends(get_db)):
    """Fetch available career specialization tracks for this roadmap's domain."""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    from app.engine.universal_roadmap_engine import get_specialization_branches
    role = roadmap.career_role
    branches = get_specialization_branches(role.domain if role else "Technology")
    return {
        "roadmap_id": roadmap.id,
        "role_title": role.title if role else "Career Track",
        "domain": role.domain if role else "Technology",
        "specializations": branches
    }


@router.post("/roadmaps/{roadmap_id}/specialization", response_model=RoadmapOut)
def switch_roadmap_specialization(roadmap_id: int, data: Dict[str, str], db: Session = Depends(get_db)):
    """Select or toggle a specialization branch within the active roadmap."""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    branch_id = data.get("specialization_branch")
    if not branch_id:
        raise HTTPException(status_code=400, detail="specialization_branch is required")

    # Update Phase 3 and Phase 4 tasks
    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
    for t in tasks:
        t.specialization_branch = branch_id
        if t.phase_number == 3:
            t.phase_name = f"Phase 3: Applied Competencies ({branch_id.replace('_', ' ').title()})"
            if isinstance(t.workspace_data, dict):
                ws = dict(t.workspace_data)
                ws["specialization_branch"] = branch_id
                t.workspace_data = ws

    db.commit()
    db.refresh(roadmap)
    return format_roadmap_out(roadmap, db)
