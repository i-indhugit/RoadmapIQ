from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RoadmapTask, Roadmap, ProgressSnapshot, StudentProfile
from app.schemas import TaskOut, TaskUpdate, TaskResourceOut
from app.api.gamification import check_and_update_streak
from app.engine.gamification_engine import award_xp_transaction

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update task status, hours logged, completion state, or evidence link.
    Persists updated state, records timestamp, and recalculates student snapshot metrics.
    """
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    was_completed = bool(task.is_completed)

    if task_in.status is not None:
        task.status = task_in.status
        if task_in.status == "completed":
            task.is_completed = True
            task.completed_at = datetime.now(timezone.utc)
        elif task_in.status in ("not_started", "in_progress"):
            task.is_completed = False
            task.completed_at = None

    if task_in.is_completed is not None:
        task.is_completed = task_in.is_completed
        if task_in.is_completed:
            task.status = "completed"
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.status = "in_progress" if task.status == "completed" else task.status
            task.completed_at = None

    if task_in.actual_hours_spent is not None:
        task.actual_hours_spent = task_in.actual_hours_spent

    if task_in.evidence_link is not None:
        task.evidence_link = task_in.evidence_link

    # Recalculate progress snapshot and update gamification rewards
    roadmap = db.query(Roadmap).filter(Roadmap.id == task.roadmap_id).first()
    if roadmap:
        all_tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
        total_tasks = len(all_tasks)
        completed_count = sum(1 for t in all_tasks if t.is_completed)
        comp_pct = round((completed_count / total_tasks * 100.0) if total_tasks > 0 else 0.0, 1)
        hours_spent = sum(t.actual_hours_spent if t.actual_hours_spent > 0 else (t.estimated_hours if t.is_completed else 0) for t in all_tasks)

        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        snapshot = db.query(ProgressSnapshot).filter(
            ProgressSnapshot.roadmap_id == roadmap.id,
            ProgressSnapshot.recorded_date == today_str
        ).first()

        if snapshot:
            snapshot.completed_tasks_count = completed_count
            snapshot.completion_percentage = comp_pct
            snapshot.hours_spent = hours_spent
        else:
            snapshot = ProgressSnapshot(
                profile_id=roadmap.profile_id,
                roadmap_id=roadmap.id,
                recorded_date=today_str,
                completed_tasks_count=completed_count,
                total_tasks_count=total_tasks,
                completion_percentage=comp_pct,
                readiness_score=roadmap.readiness_score,
                hours_spent=hours_spent
            )
            db.add(snapshot)

        # Gamification reward & Activity logging: if newly completed, log activity, award XP, update streak, unlock badges
        if task.is_completed and not was_completed:
            profile = db.query(StudentProfile).filter(StudentProfile.id == roadmap.profile_id).first()
            if profile:
                from app.api.activities import log_student_activity_internal
                earned_xp = getattr(task, "xp_reward", 50) or 50
                try:
                    log_student_activity_internal(
                        db=db,
                        profile_id=profile.id,
                        roadmap_id=task.roadmap_id,
                        task_id=task.id,
                        career_role_id=roadmap.role_id,
                        career_title=roadmap.role_title,
                        activity_type="milestone_completion",
                        category="roadmap",
                        title=task.title,
                        hours_spent=task.actual_hours_spent if task.actual_hours_spent > 0 else (task.estimated_hours or 1.0),
                        duration_minutes=int((task.actual_hours_spent if task.actual_hours_spent > 0 else (task.estimated_hours or 1.0)) * 60),
                        xp_reward=earned_xp,
                        reference_type="task",
                        reference_id=str(task.id),
                        action_url=f"/journey?tab=roadmap&checkpoint={task.id}",
                        idempotency_key=f"task_{task.id}_completion"
                    )
                except Exception as log_err:
                    # Fallback to award_xp_transaction if already handled
                    award_xp_transaction(
                        db=db,
                        profile=profile,
                        amount=earned_xp,
                        source_type="task_completion",
                        source_id=str(task.id),
                        description=f"Completed quest: {task.title}"
                    )
                    check_and_update_streak(profile)

                badges = list(profile.badges or [])
                existing_badge_ids = {b.get("id") for b in badges if isinstance(b, dict)}

                if "first_mission" not in existing_badge_ids:
                    badges.append({
                        "id": "first_mission",
                        "title": "First Step",
                        "description": "Completed your first roadmap learning mission",
                        "icon": "Trophy",
                        "unlocked_at": today_str
                    })
                if completed_count >= 5 and "fast_learner" not in existing_badge_ids:
                    badges.append({
                        "id": "fast_learner",
                        "title": "Fast Learner",
                        "description": "Completed 5 learning missions",
                        "icon": "Zap",
                        "unlocked_at": today_str
                    })
                if completed_count >= 10 and "skill_master" not in existing_badge_ids:
                    badges.append({
                        "id": "skill_master",
                        "title": "Skill Master",
                        "description": "Mastered 10 roadmap learning missions",
                        "icon": "Award",
                        "unlocked_at": today_str
                    })
                profile.badges = badges

    db.commit()
    db.refresh(task)

    res_out = [
        TaskResourceOut(
            id=r.id,
            title=r.title,
            url=r.url,
            provider=r.provider,
            format=r.format
        ) for r in task.resources
    ]

    return TaskOut(
        id=task.id,
        roadmap_id=task.roadmap_id,
        skill_id=task.skill_id,
        phase_number=task.phase_number,
        phase_name=task.phase_name,
        week_number=task.week_number,
        order_in_week=task.order_in_week,
        title=task.title,
        skill_category=task.skill_category,
        task_type=task.task_type,
        description=task.description,
        estimated_hours=task.estimated_hours,
        actual_hours_spent=task.actual_hours_spent,
        priority=task.priority,
        status=task.status,
        is_completed=task.is_completed,
        completed_at=task.completed_at,
        completion_criteria=task.completion_criteria,
        deliverable=task.deliverable,
        evidence_link=task.evidence_link,
        xp_reward=getattr(task, "xp_reward", 50) or 50,
        mission_title=getattr(task, "mission_title", task.title) or task.title,
        resources=res_out
    )


# Alias for backward compatibility
update_task_completion = update_task
toggle_task_completion = update_task

