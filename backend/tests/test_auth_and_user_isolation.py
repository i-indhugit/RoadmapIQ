import uuid
import pytest
from app.database import SessionLocal
from app.models import User, StudentProfile, CareerRole
from app.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserGuestRequest,
    SetTargetCareerRequest,
)
from app.api.auth import (
    register_user,
    login_user,
    guest_login,
    get_current_user_profile,
)
from app.api.profile import get_latest_profile, set_target_career
from app.engine.auth_service import decode_access_token, verify_password


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_auth_registration_and_login_flow(db, monkeypatch):
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    unique_email = f"student_{uuid.uuid4().hex[:8]}@roadmapiq.com"

    # 1. Register user
    reg_req = UserRegisterRequest(
        email=unique_email,
        password="secretpassword123",
        display_name="Test Student Alpha",
    )
    reg_res = register_user(reg_req, db=db)
    assert reg_res.access_token is not None
    assert reg_res.token_type == "bearer"
    assert reg_res.user.email == unique_email
    assert reg_res.user.display_name == "Test Student Alpha"

    # Token payload inspection
    payload = decode_access_token(reg_res.access_token)
    assert payload is not None
    assert payload["email"] == unique_email
    user_id = payload["sub"]

    # Profile automatically created and linked to this user
    user = db.query(User).filter(User.id == user_id).first()
    assert user is not None
    assert verify_password("secretpassword123", user.hashed_password)
    assert user.student_profile is not None
    assert user.student_profile.user_id == user.id

    # 2. Duplicate registration rejected
    with pytest.raises(Exception) as exc_info:
        register_user(reg_req, db=db)
    assert "already exists" in str(exc_info.value.detail)

    # 3. Successful login
    login_req = UserLoginRequest(
        email=unique_email,
        password="secretpassword123",
    )
    login_res = login_user(login_req, db=db)
    assert login_res.access_token is not None

    # 4. Invalid password rejected
    bad_login_req = UserLoginRequest(
        email=unique_email,
        password="wrongpassword!",
    )
    with pytest.raises(Exception) as bad_exc:
        login_user(bad_login_req, db=db)
    assert "Invalid email or password" in str(bad_exc.value.detail)

    # 5. /me inspection
    me = get_current_user_profile(user=user)
    assert me.id == user.id
    assert me.email == user.email


def test_guest_account_and_profile_isolation(db, monkeypatch):
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    # 1. Create Guest 1
    g1_req = UserGuestRequest(display_name="Guest Alpha")
    g1_res = guest_login(g1_req, db=db)
    g1_user = db.query(User).filter(User.id == g1_res.user.id).first()
    assert g1_user.is_guest is True

    # 2. Create Guest 2
    g2_req = UserGuestRequest(display_name="Guest Beta")
    g2_res = guest_login(g2_req, db=db)
    g2_user = db.query(User).filter(User.id == g2_res.user.id).first()
    assert g2_user.is_guest is True
    assert g1_user.id != g2_user.id

    # 3. Fetch latest profiles for each user - strict isolation
    prof1 = get_latest_profile(db=db, current_user=g1_user)
    prof2 = get_latest_profile(db=db, current_user=g2_user)
    assert prof1.id != prof2.id

    # 4. Guest 1 sets target career to duration 4 weeks (1 month)
    first_role = db.query(CareerRole).first()
    assert first_role is not None

    target_req_g1 = SetTargetCareerRequest(
        role_id=first_role.id,
        target_duration_weeks=4,
    )
    updated_prof1 = set_target_career(target_req_g1, db=db, current_user=g1_user)
    assert updated_prof1.id == prof1.id
    assert updated_prof1.target_duration_weeks == 4

    # 5. Guest 2's profile remains untouched
    fresh_prof2 = get_latest_profile(db=db, current_user=g2_user)
    assert fresh_prof2.id == prof2.id
    assert fresh_prof2.target_duration_weeks == 12  # unchanged default
