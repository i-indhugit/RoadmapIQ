import logging
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, StudentProfile, CareerRole
from app.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserGuestRequest,
    UserResponse,
    AuthTokenResponse,
    MessageResponse,
)
from app.engine.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication & User Accounts"])


def _ensure_profile_for_user(db: Session, user: User) -> StudentProfile:
    """Ensures an active StudentProfile is linked to this user account."""
    if user.student_profile:
        return user.student_profile

    # Look for an existing profile with matching user_id
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if profile:
        return profile

    # Create a fresh dedicated profile for this user
    first_role = db.query(CareerRole).first()
    profile = StudentProfile(
        user_id=user.id,
        display_name=user.display_name or "Future Professional",
        education_level="Undergraduate - Final Year",
        educational_field="Engineering / Technology",
        degree_specialization="Computer Science",
        current_status="student",
        current_experience_level="Intermediate",
        target_role_id=first_role.id if first_role else None,
        weekly_study_hours=15,
        target_duration_weeks=12,
        preferred_learning_format="mixed",
        skills_assessment={},
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new student account."""
    clean_email = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=clean_email,
        hashed_password=hash_password(req.password),
        display_name=(req.display_name or clean_email.split("@")[0]).strip(),
        is_active=True,
        is_guest=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _ensure_profile_for_user(db, user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthTokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Log in an existing student."""
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled.",
        )

    _ensure_profile_for_user(db, user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/guest", response_model=AuthTokenResponse)
def guest_login(req: UserGuestRequest = None, db: Session = Depends(get_db)):
    """Create a guest session allowing immediate exploration with isolated persistence."""
    random_suffix = secrets.token_hex(4)
    guest_email = f"guest_{random_suffix}@guest.roadmapiq.local"
    guest_password = secrets.token_urlsafe(16)
    display_name = (req.display_name if req and req.display_name else "Student Explorer").strip()

    user = User(
        email=guest_email,
        hashed_password=hash_password(guest_password),
        display_name=display_name,
        is_active=True,
        is_guest=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _ensure_profile_for_user(db, user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Get the currently authenticated user's account information."""
    return UserResponse.model_validate(user)


@router.post("/logout", response_model=MessageResponse)
def logout_user():
    """Client logs out by discarding the bearer token."""
    return MessageResponse(message="Successfully logged out.")

