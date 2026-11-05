from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import StudentProfile, CareerRole
from app.schemas import ProfileCreate, ProfileUpdate, ProfileResponse, CareerRoleSummary

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
    """Fetch the most recently active or created student profile."""
    profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student profile found. Please create one."
        )
    return format_profile_response(profile)


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

