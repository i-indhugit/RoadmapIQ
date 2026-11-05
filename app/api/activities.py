"""
Activity Logging, Personal Learning Calendar, Daily Streaks & Weekly Streaks Router for RoadmapIQ.
Ensures rigorous, verified streak tracking, automatic event recording across all workflows,
and multi-category persistent calendar history.
"""
from datetime import datetime, timezone, timedelta
import calendar
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models import (
    StudentProfile,
    Roadmap,
    RoadmapTask,
    CareerRole,
    DailyActivityLog,
    WeeklyGoalRecord,
    XPTransaction,
)

router = APIRouter(prefix="/activities", tags=["Activities & Streaks"])


# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class ActivityCompleteRequest(BaseModel):
    profile_id: int
    roadmap_id: Optional[int] = None
    task_id: Optional[int] = None
    career_role_id: Optional[int] = None
    career_title: Optional[str] = None
    activity_type: str = Field(
        "learn",
        description="learn, practice, test, build, revise, prepare, quiz, assessment, ai_tutor, project",
    )
    category: str = Field(
        "learning",
        description="learning, video_lesson, study_note, practice, quiz, project, assessment, roadmap, revision, ai_learning",
    )
    title: str = Field(..., min_length=2)
    hours_spent: float = Field(0.5, ge=0.05, le=14.0)
    duration_minutes: Optional[int] = None
    score: Optional[float] = None
    score_total: Optional[float] = None
    notes: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    action_url: Optional[str] = None
    activity_date: Optional[str] = None
    idempotency_key: Optional[str] = None
    xp_reward: int = Field(50, ge=0, le=500)
    extra_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class WeeklyGoalUpdateRequest(BaseModel):
    goal_type: str = Field(
        "days_per_week",
        description="days_per_week, activities_per_week, hours_per_week, milestones_per_week",
    )
    goal_target: int = Field(5, ge=1, le=50)


# =============================================================================
# DATE & TIMEZONE HELPERS
# =============================================================================

def parse_local_date(date_str: Optional[str] = None, tz_name: Optional[str] = None) -> str:
    """Returns a valid YYYY-MM-DD date string."""
    if date_str:
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return date_str
        except Exception:
            pass
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_current_date_str(tz_name: str = "UTC") -> str:
    """Returns today's date formatted as YYYY-MM-DD."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_current_week_str(date_obj: Optional[datetime] = None) -> str:
    """Returns current ISO week formatted as YYYY-W## (e.g. 2026-W45)."""
    now = date_obj or datetime.now(timezone.utc)
    year, week, _ = now.isocalendar()
    return f"{year}-W{week:02d}"


def calculate_next_milestone(current_streak: int) -> int:
    milestones = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365]
    for m in milestones:
        if m > current_streak:
            return m
    return current_streak + 50


VALID_CATEGORIES = {
    "learning",
    "video_lesson",
    "study_note",
    "practice",
    "quiz",
    "project",
    "assessment",
    "roadmap",
    "revision",
    "ai_learning",
}


def normalize_category(category: Optional[str], activity_type: Optional[str]) -> str:
    if category and category.lower() in VALID_CATEGORIES:
        return category.lower()
    act = (activity_type or "").lower()
    if "quiz" in act:
        return "quiz"
    elif "assess" in act:
        return "assessment"
    elif "project" in act or "evidence" in act:
        return "project"
    elif "practice" in act or "drill" in act:
        return "practice"
    elif "milestone" in act or "roadmap" in act:
        return "roadmap"
    elif "ai" in act or "tutor" in act:
        return "ai_learning"
    elif "video" in act:
        return "video_lesson"
    elif "note" in act:
        return "study_note"
    elif "revise" in act or "review" in act:
        return "revision"
    return "learning"


# =============================================================================
# CORE INTERNAL ACTIVITY LOGGING ENGINE
# =============================================================================

def log_student_activity_internal(
    db: Session,
    profile_id: int,
    activity_type: str,
    title: str,
    category: str = "learning",
    hours_spent: float = 0.5,
    duration_minutes: Optional[int] = None,
    score: Optional[float] = None,
    score_total: Optional[float] = None,
    roadmap_id: Optional[int] = None,
    task_id: Optional[int] = None,
    career_role_id: Optional[int] = None,
    career_title: Optional[str] = None,
    notes: Optional[str] = None,
    reference_type: Optional[str] = None,
    reference_id: Optional[str] = None,
    action_url: Optional[str] = None,
    activity_date: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    xp_reward: int = 50,
    extra_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Core activity logging engine used across all modules.
    Ensures idempotent logging, prevents duplicate streaks/XP,
    and updates daily & weekly streaks accurately.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    # 1. Idempotency Check
    if idempotency_key:
        existing = (
            db.query(DailyActivityLog)
            .filter(
                DailyActivityLog.profile_id == student.id,
                DailyActivityLog.idempotency_key == idempotency_key,
            )
            .first()
        )
        if existing:
            # Update score if improved
            if score is not None and (existing.score is None or score > existing.score):
                existing.score = score
                if score_total is not None:
                    existing.score_total = score_total
            if notes and not existing.notes:
                existing.notes = notes
            db.commit()
            return {
                "status": "already_recorded",
                "idempotent_duplicate": True,
                "activity_id": existing.id,
                "title": existing.title,
                "xp_awarded": 0,
                "total_xp": student.xp,
                "current_level": student.level,
                "daily_streak": student.streak_days,
                "longest_daily_streak": student.longest_streak,
                "weekly_streak": student.weekly_streak_count,
                "longest_weekly_streak": student.longest_weekly_streak,
            }

    # 2. Date & Timezone Calibration
    today_str = parse_local_date(activity_date, student.timezone)
    current_week_str = get_current_week_str()
    dur_mins = duration_minutes if duration_minutes is not None else max(5, int(hours_spent * 60))
    norm_category = normalize_category(category, activity_type)

    # 3. Contextual Enrichment from Task or Roadmap
    if task_id and not career_title:
        task_obj = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
        if task_obj:
            task_obj.is_completed = True
            task_obj.status = "completed"
            task_obj.completed_at = datetime.now(timezone.utc)
            if task_obj.roadmap:
                roadmap_id = task_obj.roadmap.id
                career_title = task_obj.roadmap.role_title
                career_role_id = task_obj.roadmap.role_id

    # 4. Insert DailyActivityLog
    activity_log = DailyActivityLog(
        profile_id=student.id,
        roadmap_id=roadmap_id,
        task_id=task_id,
        career_role_id=career_role_id,
        career_title=career_title,
        activity_date=today_str,
        activity_type=activity_type.lower(),
        category=norm_category,
        title=title,
        hours_spent=hours_spent,
        duration_minutes=dur_mins,
        score=score,
        score_total=score_total,
        xp_earned=xp_reward,
        completion_status="completed",
        notes=notes,
        reference_type=reference_type,
        reference_id=reference_id,
        action_url=action_url,
        idempotency_key=idempotency_key,
        extra_metadata=extra_metadata or {},
    )
    db.add(activity_log)

    # 5. Strict Daily Streak Logic (Once Per Calendar Date)
    already_active_today = student.last_active_date == today_str
    daily_streak_incremented = False

    if not already_active_today:
        if student.last_active_date:
            try:
                last_date = datetime.strptime(student.last_active_date, "%Y-%m-%d").date()
                curr_date = datetime.strptime(today_str, "%Y-%m-%d").date()
                delta_days = (curr_date - last_date).days
                if delta_days == 1:
                    student.streak_days = (student.streak_days or 0) + 1
                elif delta_days > 1:
                    student.streak_days = 1
                # delta_days <= 0 means same date or timezone variance: keep existing
            except Exception:
                student.streak_days = 1
        else:
            student.streak_days = 1

        student.longest_streak = max(student.longest_streak or 1, student.streak_days)
        student.last_active_date = today_str
        daily_streak_incremented = True

    # 6. Weekly Goal & Streak Evaluation
    weekly_goal = (
        db.query(WeeklyGoalRecord)
        .filter(
            WeeklyGoalRecord.profile_id == student.id,
            WeeklyGoalRecord.week_identifier == current_week_str,
        )
        .first()
    )

    if not weekly_goal:
        weekly_goal = WeeklyGoalRecord(
            profile_id=student.id,
            week_identifier=current_week_str,
            goal_type=student.weekly_goal_type or "days_per_week",
            goal_target=student.weekly_goal_target or 5,
            achieved_count=0,
            is_achieved=False,
        )
        db.add(weekly_goal)
        db.flush()

    # Calculate this week's progress across activities
    curr_dt = datetime.strptime(today_str, "%Y-%m-%d").date()
    week_start = curr_dt - timedelta(days=curr_dt.weekday())
    week_start_str = week_start.strftime("%Y-%m-%d")

    week_activities = (
        db.query(DailyActivityLog)
        .filter(
            DailyActivityLog.profile_id == student.id,
            DailyActivityLog.activity_date >= week_start_str,
            DailyActivityLog.activity_date <= today_str,
        )
        .all()
    )

    all_this_week = week_activities + [activity_log]

    if student.weekly_goal_type == "days_per_week":
        distinct_days = {act.activity_date for act in all_this_week}
        weekly_goal.achieved_count = len(distinct_days)
    elif student.weekly_goal_type == "activities_per_week":
        weekly_goal.achieved_count = len(all_this_week)
    elif student.weekly_goal_type == "hours_per_week":
        weekly_goal.achieved_count = int(sum(act.hours_spent for act in all_this_week))
    elif student.weekly_goal_type == "milestones_per_week":
        weekly_goal.achieved_count = sum(
            1 for act in all_this_week if act.category == "roadmap" or act.activity_type == "milestone_completion"
        )
    else:
        weekly_goal.achieved_count = len({act.activity_date for act in all_this_week})

    bonus_xp = 0
    weekly_goal_newly_achieved = False
    if weekly_goal.achieved_count >= weekly_goal.goal_target and not weekly_goal.is_achieved:
        weekly_goal.is_achieved = True
        weekly_goal.achieved_at = datetime.now(timezone.utc)
        student.weekly_streak_count = (student.weekly_streak_count or 0) + 1
        student.longest_weekly_streak = max(
            student.longest_weekly_streak or 0, student.weekly_streak_count
        )
        weekly_goal_newly_achieved = True
        bonus_xp = 200

    # 7. XP Awarding & Transaction Ledger
    total_xp_awarded = xp_reward + bonus_xp
    student.xp = (student.xp or 100) + total_xp_awarded
    student.level = max(1, 1 + (student.xp // 500))

    if total_xp_awarded > 0:
        xp_txn = XPTransaction(
            profile_id=student.id,
            amount=total_xp_awarded,
            source_type="activity_completion",
            source_id=f"activity_{activity_log.id or idempotency_key or 'new'}",
            description=f"Completed {norm_category.upper()}: {title}"
            + (" (+200 XP Weekly Goal Champion!)" if bonus_xp else ""),
        )
        db.add(xp_txn)

    db.commit()

    return {
        "status": "success",
        "activity_id": activity_log.id,
        "title": title,
        "category": norm_category,
        "activity_date": today_str,
        "xp_awarded": total_xp_awarded,
        "total_xp": student.xp,
        "current_level": student.level,
        "daily_streak": student.streak_days,
        "daily_streak_incremented": daily_streak_incremented,
        "longest_daily_streak": student.longest_streak,
        "weekly_streak": student.weekly_streak_count,
        "longest_weekly_streak": student.longest_weekly_streak,
        "weekly_goal": {
            "type": student.weekly_goal_type,
            "target": weekly_goal.goal_target,
            "achieved": weekly_goal.achieved_count,
            "is_achieved": weekly_goal.is_achieved,
            "newly_achieved": weekly_goal_newly_achieved,
        },
    }


# =============================================================================
# API ENDPOINTS
# =============================================================================

@router.post("/complete")
def log_activity_and_update_streaks(
    req: ActivityCompleteRequest, db: Session = Depends(get_db)
):
    """
    Log a verified learning activity, update daily streaks (preventing duplicate increments on the same day),
    and update weekly goal progress / weekly streak.
    """
    return log_student_activity_internal(
        db=db,
        profile_id=req.profile_id,
        activity_type=req.activity_type,
        category=req.category,
        title=req.title,
        hours_spent=req.hours_spent,
        duration_minutes=req.duration_minutes,
        score=req.score,
        score_total=req.score_total,
        roadmap_id=req.roadmap_id,
        task_id=req.task_id,
        career_role_id=req.career_role_id,
        career_title=req.career_title,
        notes=req.notes,
        reference_type=req.reference_type,
        reference_id=req.reference_id,
        action_url=req.action_url,
        activity_date=req.activity_date,
        idempotency_key=req.idempotency_key,
        xp_reward=req.xp_reward,
        extra_metadata=req.extra_metadata,
    )


@router.get("/students/{profile_id}/calendar")
def get_learning_calendar(
    profile_id: int,
    year: int = Query(..., description="Target Year, e.g. 2026"),
    month: Optional[int] = Query(None, description="Month 1-12. If omitted, uses current month"),
    category: Optional[str] = Query(None, description="Filter by category or 'all'"),
    db: Session = Depends(get_db),
):
    """
    Fetch comprehensive monthly activity calendar with day-by-day intensity heatmap,
    category badges, streak status, and monthly totals.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    now = datetime.now(timezone.utc)
    target_year = year if isinstance(year, int) else now.year
    target_month = month if isinstance(month, int) else now.month
    today_str = parse_local_date(None, student.timezone)

    _, days_in_month = calendar.monthrange(target_year, target_month)
    start_date = f"{target_year}-{target_month:02d}-01"
    end_date = f"{target_year}-{target_month:02d}-{days_in_month:02d}"

    query = (
        db.query(DailyActivityLog)
        .filter(
            DailyActivityLog.profile_id == student.id,
            DailyActivityLog.activity_date >= start_date,
            DailyActivityLog.activity_date <= end_date,
        )
    )

    cat_str = category if isinstance(category, str) else None
    if cat_str and cat_str.lower() != "all":
        query = query.filter(DailyActivityLog.category == cat_str.lower())

    activities = query.all()

    # Group activities by date
    act_by_date: Dict[str, List[DailyActivityLog]] = {}
    for a in activities:
        act_by_date.setdefault(a.activity_date, []).append(a)

    days_list = []
    category_counts: Dict[str, int] = {}
    total_month_hours = 0.0
    total_month_xp = 0
    active_days_count = 0
    most_productive_day = None
    max_day_count = 0

    for d in range(1, days_in_month + 1):
        cur_date_str = f"{year}-{target_month:02d}-{d:02d}"
        cur_dt = datetime(year, target_month, d)
        day_of_week = cur_dt.strftime("%A")

        day_acts = act_by_date.get(cur_date_str, [])
        count = len(day_acts)
        hours = sum(a.hours_spent for a in day_acts)
        xp = sum(a.xp_earned for a in day_acts)
        cats = sorted(list({a.category for a in day_acts if a.category}))

        total_month_hours += hours
        total_month_xp += xp

        if count > 0:
            active_days_count += 1
            if count > max_day_count:
                max_day_count = count
                most_productive_day = cur_date_str

        for a in day_acts:
            cat = a.category or "learning"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        # Intensity scale: 0 = none, 1 = 1-2 acts, 2 = 3-4 acts, 3 = 5+ acts
        intensity = 0
        if count >= 5:
            intensity = 3
        elif count >= 3:
            intensity = 2
        elif count >= 1:
            intensity = 1

        has_milestone = any(a.category == "roadmap" or a.activity_type == "milestone_completion" for a in day_acts)
        has_assessment = any(a.category == "assessment" for a in day_acts)
        has_project = any(a.category == "project" for a in day_acts)
        has_practice = any(a.category in ("practice", "quiz") for a in day_acts)
        has_ai_learning = any(a.category == "ai_learning" for a in day_acts)

        days_list.append({
            "date": cur_date_str,
            "day_number": d,
            "day_of_week": day_of_week,
            "activity_count": count,
            "total_hours": round(hours, 1),
            "total_xp": xp,
            "categories": cats,
            "intensity": intensity,
            "has_milestone": has_milestone,
            "has_assessment": has_assessment,
            "has_project": has_project,
            "has_practice": has_practice,
            "has_ai_learning": has_ai_learning,
            "is_today": (cur_date_str == today_str),
            "streak_qualifying": (count > 0),
        })

    # Weekly goal info
    current_week_str = get_current_week_str()
    weekly_goal = (
        db.query(WeeklyGoalRecord)
        .filter(
            WeeklyGoalRecord.profile_id == student.id,
            WeeklyGoalRecord.week_identifier == current_week_str,
        )
        .first()
    )

    month_name = calendar.month_name[target_month]

    return {
        "year": year,
        "month": target_month,
        "month_name": month_name,
        "start_date": start_date,
        "end_date": end_date,
        "today": today_str,
        "current_daily_streak": student.streak_days or 1,
        "longest_daily_streak": student.longest_streak or 1,
        "current_weekly_streak": student.weekly_streak_count or 0,
        "longest_weekly_streak": student.longest_weekly_streak or 0,
        "weekly_goal": {
            "type": student.weekly_goal_type or "days_per_week",
            "target": student.weekly_goal_target or 5,
            "achieved": weekly_goal.achieved_count if weekly_goal else 0,
            "is_achieved": weekly_goal.is_achieved if weekly_goal else False,
        },
        "days": days_list,
        "summary": {
            "total_active_days": active_days_count,
            "total_hours": round(total_month_hours, 1),
            "total_activities": len(activities),
            "total_xp": total_month_xp,
            "category_counts": category_counts,
            "most_productive_day": most_productive_day,
            "streak_records": {
                "daily_streak": student.streak_days or 1,
                "weekly_streak": student.weekly_streak_count or 0,
            },
        },
    }


@router.get("/students/{profile_id}/date/{date_str}")
def get_date_activities(
    profile_id: int,
    date_str: str,
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(get_db),
):
    """
    Fetch all persistent learning activities recorded on a specific date.
    Returns complete breakdown with category, duration, scores, timestamps, and return links.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    try:
        dt_obj = datetime.strptime(date_str, "%Y-%m-%d")
        day_of_week = dt_obj.strftime("%A")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    query = (
        db.query(DailyActivityLog)
        .filter(
            DailyActivityLog.profile_id == student.id,
            DailyActivityLog.activity_date == date_str,
        )
    )

    cat_str = category if isinstance(category, str) else None
    if cat_str and cat_str.lower() != "all":
        query = query.filter(DailyActivityLog.category == cat_str.lower())

    acts = query.order_by(DailyActivityLog.created_at.desc()).all()

    formatted_activities = []
    total_hours = 0.0
    total_xp = 0
    categories_present = set()

    for a in acts:
        total_hours += a.hours_spent or 0.0
        total_xp += a.xp_earned or 0
        if a.category:
            categories_present.add(a.category)

        time_str = a.created_at.strftime("%I:%M %p") if a.created_at else "12:00 PM"

        formatted_activities.append({
            "id": a.id,
            "activity_type": a.activity_type,
            "category": a.category or "learning",
            "title": a.title,
            "career_title": a.career_title or (a.roadmap.role_title if a.roadmap else None),
            "task_id": a.task_id,
            "roadmap_id": a.roadmap_id,
            "completion_status": a.completion_status or "completed",
            "score": a.score,
            "score_total": a.score_total,
            "hours_spent": a.hours_spent,
            "duration_minutes": a.duration_minutes or int((a.hours_spent or 0.5) * 60),
            "xp_earned": a.xp_earned,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "time_str": time_str,
            "action_url": a.action_url or "/journey?tab=roadmap",
            "notes": a.notes,
            "reference_type": a.reference_type,
            "reference_id": a.reference_id,
            "extra_metadata": a.extra_metadata or {},
        })

    return {
        "date": date_str,
        "day_of_week": day_of_week,
        "total_activities": len(acts),
        "total_hours": round(total_hours, 1),
        "total_xp": total_xp,
        "categories": sorted(list(categories_present)),
        "activities": formatted_activities,
    }


@router.get("/students/{profile_id}/analytics")
def get_learning_analytics(
    profile_id: int,
    timeframe: str = Query("all_time", description="monthly, weekly, all_time"),
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Computes rigorous aggregate learning statistics across real historical data:
    learning days, total hours, lessons completed, practice problems solved,
    quizzes, projects, milestones, streak records, and most productive days.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    now = datetime.now(timezone.utc)
    today_str = parse_local_date(None, student.timezone)

    query = db.query(DailyActivityLog).filter(DailyActivityLog.profile_id == student.id)

    tf_str = timeframe if isinstance(timeframe, str) else "all_time"

    if tf_str == "monthly":
        t_year = year if isinstance(year, int) else now.year
        t_month = month if isinstance(month, int) else now.month
        _, days_in_month = calendar.monthrange(t_year, t_month)
        start_date = f"{t_year}-{t_month:02d}-01"
        end_date = f"{t_year}-{t_month:02d}-{days_in_month:02d}"
        query = query.filter(
            DailyActivityLog.activity_date >= start_date,
            DailyActivityLog.activity_date <= end_date,
        )
    elif tf_str == "weekly":
        curr_dt = now.date()
        week_start = curr_dt - timedelta(days=curr_dt.weekday())
        query = query.filter(
            DailyActivityLog.activity_date >= week_start.strftime("%Y-%m-%d"),
            DailyActivityLog.activity_date <= today_str,
        )

    acts = query.all()

    # Aggregate stats
    distinct_dates = {a.activity_date for a in acts if a.activity_date}
    total_learning_days = len(distinct_dates)
    total_learning_hours = round(sum(a.hours_spent for a in acts), 1)

    lessons_completed = sum(1 for a in acts if a.category in ("learning", "video_lesson", "study_note"))
    practice_questions_solved = sum(1 for a in acts if a.category == "practice")
    quizzes_attempted = sum(1 for a in acts if a.category == "quiz")

    quiz_scores = [a.score for a in acts if a.category == "quiz" and a.score is not None]
    avg_quiz_score = round(sum(quiz_scores) / len(quiz_scores), 1) if quiz_scores else 0.0

    projects_completed = sum(1 for a in acts if a.category == "project")
    roadmap_milestones_completed = sum(1 for a in acts if a.category == "roadmap")
    assessments_completed = sum(1 for a in acts if a.category == "assessment")
    ai_sessions_completed = sum(1 for a in acts if a.category == "ai_learning")

    # Most studied topics
    topic_counts: Dict[str, Dict[str, Any]] = {}
    for a in acts:
        t_key = a.career_title or a.title
        if t_key not in topic_counts:
            topic_counts[t_key] = {"title": t_key, "count": 0, "hours": 0.0}
        topic_counts[t_key]["count"] += 1
        topic_counts[t_key]["hours"] = round(topic_counts[t_key]["hours"] + (a.hours_spent or 0.5), 1)

    most_studied_topics = sorted(
        topic_counts.values(), key=lambda x: (x["hours"], x["count"]), reverse=True
    )[:5]

    # Most productive days of week
    dow_counts: Dict[str, int] = {
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0,
        "Sunday": 0,
    }
    for a in acts:
        try:
            d_name = datetime.strptime(a.activity_date, "%Y-%m-%d").strftime("%A")
            dow_counts[d_name] = dow_counts.get(d_name, 0) + 1
        except Exception:
            pass

    most_productive_days = [
        {"day": k, "activities": v} for k, v in dow_counts.items()
    ]

    # Category distribution
    category_distribution: Dict[str, int] = {}
    for a in acts:
        cat = a.category or "learning"
        category_distribution[cat] = category_distribution.get(cat, 0) + 1

    # Weekly Goal History (last 6 records)
    weekly_records = (
        db.query(WeeklyGoalRecord)
        .filter(WeeklyGoalRecord.profile_id == student.id)
        .order_by(WeeklyGoalRecord.created_at.desc())
        .limit(6)
        .all()
    )

    weekly_goal_history = [
        {
            "week": w.week_identifier,
            "goal_type": w.goal_type,
            "target": w.goal_target,
            "achieved": w.achieved_count,
            "is_achieved": w.is_achieved,
            "achieved_at": w.achieved_at.isoformat() if w.achieved_at else None,
        }
        for w in weekly_records
    ]

    return {
        "timeframe": timeframe,
        "total_learning_days": total_learning_days,
        "total_learning_hours": total_learning_hours,
        "lessons_completed": lessons_completed,
        "practice_questions_solved": practice_questions_solved,
        "quizzes_attempted": quizzes_attempted,
        "average_quiz_score": avg_quiz_score,
        "projects_completed": projects_completed,
        "roadmap_milestones_completed": roadmap_milestones_completed,
        "assessments_completed": assessments_completed,
        "ai_sessions_completed": ai_sessions_completed,
        "current_daily_streak": student.streak_days or 1,
        "longest_daily_streak": student.longest_streak or 1,
        "current_weekly_streak": student.weekly_streak_count or 0,
        "longest_weekly_streak": student.longest_weekly_streak or 0,
        "most_studied_topics": most_studied_topics,
        "most_productive_days": most_productive_days,
        "category_distribution": category_distribution,
        "weekly_goal_history": weekly_goal_history,
    }


@router.get("/students/{profile_id}/streak-status")
def get_student_streak_status(profile_id: int, db: Session = Depends(get_db)):
    """
    Fetch comprehensive daily & weekly streak metrics, today's status, missed days,
    next streak milestones, and 60-day visual heatmap.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    today_str = parse_local_date(None, student.timezone)
    current_week_str = get_current_week_str()

    weekly_goal = (
        db.query(WeeklyGoalRecord)
        .filter(
            WeeklyGoalRecord.profile_id == student.id,
            WeeklyGoalRecord.week_identifier == current_week_str,
        )
        .first()
    )

    # 60-day activity heatmap
    sixty_days_ago = (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m-%d")
    recent_activities = (
        db.query(DailyActivityLog)
        .filter(
            DailyActivityLog.profile_id == student.id,
            DailyActivityLog.activity_date >= sixty_days_ago,
        )
        .all()
    )

    heatmap_data: Dict[str, int] = {}
    active_dates_set = set()
    for act in recent_activities:
        heatmap_data[act.activity_date] = heatmap_data.get(act.activity_date, 0) + 1
        active_dates_set.add(act.activity_date)

    # Missed days in the last 30 days
    missed_days = []
    now_dt = datetime.now(timezone.utc).date()
    for i in range(1, 31):
        past_d = (now_dt - timedelta(days=i)).strftime("%Y-%m-%d")
        if past_d not in active_dates_set:
            missed_days.append(past_d)

    cur_streak = student.streak_days or 1
    next_milestone = calculate_next_milestone(cur_streak)
    days_to_milestone = max(0, next_milestone - cur_streak)

    today_completed = today_str in active_dates_set

    # Previous weeks
    prev_weeks = (
        db.query(WeeklyGoalRecord)
        .filter(
            WeeklyGoalRecord.profile_id == student.id,
            WeeklyGoalRecord.week_identifier != current_week_str,
        )
        .order_by(WeeklyGoalRecord.created_at.desc())
        .limit(4)
        .all()
    )

    previous_weeks_data = [
        {
            "week": w.week_identifier,
            "target": w.goal_target,
            "achieved": w.achieved_count,
            "is_achieved": w.is_achieved,
        }
        for w in prev_weeks
    ]

    return {
        "profile_id": student.id,
        "daily_streak": cur_streak,
        "current_daily_streak": cur_streak,
        "longest_daily_streak": student.longest_streak or 1,
        "today_completed": today_completed,
        "last_active_date": student.last_active_date,
        "missed_days": missed_days[:10],
        "next_streak_milestone": next_milestone,
        "days_to_milestone": days_to_milestone,
        "weekly_streak": student.weekly_streak_count or 0,
        "current_weekly_streak": student.weekly_streak_count or 0,
        "longest_weekly_streak": student.longest_weekly_streak or 0,
        "weekly_goal": {
            "type": student.weekly_goal_type or "days_per_week",
            "target": student.weekly_goal_target or 5,
            "current_week": current_week_str,
            "achieved": weekly_goal.achieved_count if weekly_goal else 0,
            "is_achieved": weekly_goal.is_achieved if weekly_goal else False,
            "progress_pct": min(
                100,
                int(
                    (weekly_goal.achieved_count / (weekly_goal.goal_target or 1)) * 100
                )
                if weekly_goal
                else 0,
            ),
        },
        "previous_weeks": previous_weeks_data,
        "heatmap": heatmap_data,
        "total_activities_logged": len(recent_activities),
    }


@router.post("/students/{profile_id}/weekly-goal")
def update_weekly_goal(
    profile_id: int, req: WeeklyGoalUpdateRequest, db: Session = Depends(get_db)
):
    """Configure or update the student's personal weekly preparation goal."""
    student = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found.",
        )

    student.weekly_goal_type = req.goal_type
    student.weekly_goal_target = req.goal_target

    current_week_str = get_current_week_str()
    weekly_goal = (
        db.query(WeeklyGoalRecord)
        .filter(
            WeeklyGoalRecord.profile_id == student.id,
            WeeklyGoalRecord.week_identifier == current_week_str,
        )
        .first()
    )
    if weekly_goal:
        weekly_goal.goal_type = req.goal_type
        weekly_goal.goal_target = req.goal_target
    else:
        weekly_goal = WeeklyGoalRecord(
            profile_id=student.id,
            week_identifier=current_week_str,
            goal_type=req.goal_type,
            goal_target=req.goal_target,
            achieved_count=0,
            is_achieved=False,
        )
        db.add(weekly_goal)

    db.commit()
    return {
        "status": "success",
        "message": f"Weekly goal updated to {req.goal_target} {req.goal_type.replace('_', ' ')}.",
        "goal_type": req.goal_type,
        "goal_target": req.goal_target,
    }


# Backwards compatible aliases
complete_activity = log_activity_and_update_streaks
set_student_weekly_goal = update_weekly_goal
WeeklyGoalSetRequest = WeeklyGoalUpdateRequest
log_student_activity = log_student_activity_internal
