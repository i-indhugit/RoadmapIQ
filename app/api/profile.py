import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import StudentProfile, CareerRole
from app.schemas import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse,
    CareerRoleSummary,
    SetTargetCareerRequest,
    SavedCareerItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["Student Profile"])


def format_profile_response(profile: StudentProfile) -> ProfileResponse:
    target_role_summary = None
    if profile.target_role:
        target_role_summary = CareerRoleSummary.model_validate(profile.target_role)

    return ProfileResponse(
        id=profile.id,
        display_name=profile.display_name,
        education_level=profile.education_level,
        educational_field=getattr(profile, "educational_field", "Engineering / Technology") or "Engineering / Technology",
        degree_specialization=profile.degree_specialization,
        current_status=getattr(profile, "current_status", "student") or "student",
        current_role=getattr(profile, "current_role", None),
        current_experience_level=profile.current_experience_level,
        target_role_id=profile.target_role_id,
        weekly_study_hours=profile.weekly_study_hours,
        target_duration_weeks=profile.target_duration_weeks,
        preferred_learning_format=profile.preferred_learning_format,
        learning_budget=getattr(profile, "learning_budget", "free_only") or "free_only",
        preferred_language=getattr(profile, "preferred_language", "en") or "en",
        placement_deadline=profile.placement_deadline,
        career_goals=getattr(profile, "career_goals", None),
        skills_assessment=profile.skills_assessment or {},
        assessed_skills=profile.assessed_skills or {},
        xp=getattr(profile, "xp", 100) or 100,
        level=getattr(profile, "level", 1) or 1,
        streak_days=getattr(profile, "streak_days", 1) or 1,
        badges=getattr(profile, "badges", []) or [],
        avatar_style=getattr(profile, "avatar_style", "cyber_nomad") or "cyber_nomad",
        avatar_checkpoint_id=getattr(profile, "avatar_checkpoint_id", None),
        journey_settings=getattr(profile, "journey_settings", {}) or {},
        ai_enabled=profile.ai_enabled,
        target_role=target_role_summary,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(profile_in: ProfileCreate, db: Session = Depends(get_db)):
    """Create a new student profile."""
    # Check if target role exists if provided
    if profile_in.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == profile_in.target_role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target role ID {profile_in.target_role_id} does not exist"
            )

    new_profile = StudentProfile(
        display_name=profile_in.display_name,
        education_level=profile_in.education_level,
        educational_field=profile_in.educational_field,
        degree_specialization=profile_in.degree_specialization,
        current_status=profile_in.current_status,
        current_role=profile_in.current_role,
        current_experience_level=profile_in.current_experience_level,
        target_role_id=profile_in.target_role_id,
        weekly_study_hours=profile_in.weekly_study_hours,
        target_duration_weeks=profile_in.target_duration_weeks,
        preferred_learning_format=profile_in.preferred_learning_format,
        learning_budget=profile_in.learning_budget,
        preferred_language=profile_in.preferred_language,
        placement_deadline=profile_in.placement_deadline,
        career_goals=profile_in.career_goals,
        skills_assessment=profile_in.skills_assessment,
        avatar_style=profile_in.avatar_style,
        avatar_checkpoint_id=profile_in.avatar_checkpoint_id,
        journey_settings=profile_in.journey_settings,
        ai_enabled=profile_in.ai_enabled
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return format_profile_response(new_profile)


@router.get("/latest", response_model=ProfileResponse)
def get_latest_profile(db: Session = Depends(get_db)):
    """Fetch the most recently active or created student profile, auto-initializing if none exists."""
    profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
    if not profile:
        first_role = db.query(CareerRole).first()
        profile = StudentProfile(
            display_name="Future Professional",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            current_status="student",
            current_experience_level="Intermediate",
            target_role_id=first_role.id if first_role else None,
            weekly_study_hours=15,
            target_duration_weeks=12,
            preferred_learning_format="mixed",
            skills_assessment={}
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return format_profile_response(profile)


@router.post("/target", response_model=ProfileResponse)
def set_target_career(req: SetTargetCareerRequest, db: Session = Depends(get_db)):
    """
    Sets the active target career for a student profile.
    - Validates that the target career exists in PostgreSQL/SQLite by role_id or slug.
    - Resolves or creates the student profile.
    - Atomically persists target_role_id, duration, hours, and goals in the database.
    - Pre-generates or restores the corresponding active career roadmap.
    - Returns the updated ProfileResponse with target_role.
    """
    role = None
    if req.role_id:
        role = db.query(CareerRole).filter(CareerRole.id == req.role_id).first()
    elif req.career_slug:
        role = db.query(CareerRole).filter(CareerRole.slug == req.career_slug).first()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target career role (ID: {req.role_id}, slug: '{req.career_slug}') not found in catalogue."
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
            educational_field=role.domain or "Engineering / Technology",
            degree_specialization="Professional Track",
            current_status="student",
            current_experience_level="Intermediate",
            target_role_id=role.id,
            weekly_study_hours=req.weekly_study_hours or 15,
            target_duration_weeks=req.target_duration_weeks or 12,
            preferred_learning_format=req.preferred_learning_format or "mixed",
            skills_assessment={}
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    profile.target_role_id = role.id
    if req.career_goals:
        profile.career_goals = req.career_goals
    if req.target_duration_weeks:
        profile.target_duration_weeks = req.target_duration_weeks
    if req.weekly_study_hours:
        profile.weekly_study_hours = req.weekly_study_hours
    if req.preferred_learning_format:
        profile.preferred_learning_format = req.preferred_learning_format
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    # Ensure roadmap entity exists or restore existing for this profile and role
    try:
        from app.api.roadmaps import switch_career_roadmap, RoadmapSwitchRequest
        switch_req = RoadmapSwitchRequest(
            role_id=role.id,
            profile_id=profile.id,
            weekly_hours=profile.weekly_study_hours,
            target_duration_weeks=profile.target_duration_weeks,
            preferred_format=profile.preferred_learning_format
        )
        switch_career_roadmap(switch_req, db=db)
    except Exception as e:
        logger.warning(f"Note on roadmap synchronization for target career: {e}")

    db.refresh(profile)
    return format_profile_response(profile)


@router.post("/{profile_id}/target", response_model=ProfileResponse)
def set_target_career_for_profile(profile_id: int, req: SetTargetCareerRequest, db: Session = Depends(get_db)):
    req.profile_id = profile_id
    return set_target_career(req, db)


@router.get("/{profile_id}/saved-careers", response_model=List[SavedCareerItem])
def get_saved_careers(profile_id: int, db: Session = Depends(get_db)):
    """Fetch all saved / bookmarked careers for a student from database."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail=f"Student profile #{profile_id} not found")

    settings_dict = profile.journey_settings or {}
    saved_items = settings_dict.get("saved_careers", [])
    return saved_items


@router.post("/{profile_id}/saved-careers", response_model=List[SavedCareerItem])
def save_favourite_career(profile_id: int, req: Dict[str, Any], db: Session = Depends(get_db)):
    """Save/bookmark a career role to the student's profile in the database."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail=f"Student profile #{profile_id} not found")

    role_id = req.get("role_id")
    if not role_id:
        raise HTTPException(status_code=400, detail="role_id is required")

    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Career role #{role_id} not found")

    settings_dict = dict(profile.journey_settings or {})
    saved_items = list(settings_dict.get("saved_careers", []))

    if not any(item.get("id") == role.id for item in saved_items):
        saved_items.append({
            "id": role.id,
            "title": role.title,
            "domain": role.domain,
            "slug": role.slug,
            "saved_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        })
        settings_dict["saved_careers"] = saved_items
        profile.journey_settings = settings_dict
        profile.updated_at = datetime.now(timezone.utc)
        db.commit()

    return saved_items


@router.delete("/{profile_id}/saved-careers/{role_id}", response_model=List[SavedCareerItem])
def remove_saved_career(profile_id: int, role_id: int, db: Session = Depends(get_db)):
    """Remove a saved / bookmarked career role from the student's profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail=f"Student profile #{profile_id} not found")

    settings_dict = dict(profile.journey_settings or {})
    saved_items = [item for item in settings_dict.get("saved_careers", []) if item.get("id") != role_id]
    settings_dict["saved_careers"] = saved_items
    profile.journey_settings = settings_dict
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()

    return saved_items


@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """Fetch a student profile by ID."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found"
        )
    return format_profile_response(profile)


@router.put("/{profile_id}", response_model=ProfileResponse)
def update_profile(profile_id: int, profile_in: ProfileUpdate, db: Session = Depends(get_db)):
    """Update an existing student profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile #{profile_id} not found"
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    if "target_role_id" in update_data and update_data["target_role_id"]:
        role = db.query(CareerRole).filter(CareerRole.id == update_data["target_role_id"]).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target role ID {update_data['target_role_id']} does not exist"
            )

    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return format_profile_response(profile)

