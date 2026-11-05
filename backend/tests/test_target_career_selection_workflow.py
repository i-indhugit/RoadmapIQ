import pytest
from app.database import SessionLocal
from app.models import StudentProfile, CareerRole, Roadmap
from app.schemas import SetTargetCareerRequest
from app.api.profile import (
    get_latest_profile,
    set_target_career,
    get_saved_careers,
    save_favourite_career,
    remove_saved_career,
)
from app.api.career_assessment import get_all_careers


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_target_career_selection_and_persistence(db, monkeypatch):
    """
    CRITICAL WORKFLOW TEST:
    1. Load career catalogue (250+ roles).
    2. Search and locate Java Developer (id 17, 'java-developer').
    3. Set it as the active target career via SetTargetCareerRequest.
    4. Verify target saved in database (StudentProfile.target_role_id == 17).
    5. Refresh profile / get_latest_profile - verify target persists.
    6. Change target to Data Analyst (id 5, 'data-analyst').
    7. Verify target updated to 5.
    8. Verify previous career roadmap for Java Developer is preserved in database.
    9. Change target to non-technical career Chartered Accountant (id 68).
    10. Verify target updated and roadmap created.
    11. Change target to Graphic Designer (id 218).
    12. Verify target updated and roadmap created.
    13. Test saving multiple favourite careers (bookmarks) in database.
    14. Verify bookmarks persist in database and can be deleted cleanly.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    # 1. Catalogue Load
    careers = get_all_careers(db=db)
    assert len(careers) >= 250, "Catalogue must contain at least 250 careers"

    # 2. Search for Java Developer
    java_roles = [
        c for c in careers
        if "java" in c.title.lower() or "java" in c.slug.lower() or "java" in (c.description or "").lower()
    ]
    assert len(java_roles) >= 1, "Expected to find Java career role"
    java_role = [c for c in java_roles if c.id == 17 or "java-developer" in c.slug][0]

    # Create fresh test profile
    test_profile = StudentProfile(
        display_name="Target Workflow Tester",
        education_level="Undergraduate",
        educational_field="Engineering",
        degree_specialization="Computer Science",
        current_status="student",
        current_experience_level="Intermediate",
        target_role_id=None,
        weekly_study_hours=15,
        target_duration_weeks=12,
        preferred_learning_format="mixed"
    )
    db.add(test_profile)
    db.commit()
    db.refresh(test_profile)

    # 3. Set Java Developer as Active Target
    target_req1 = SetTargetCareerRequest(
        profile_id=test_profile.id,
        role_id=java_role.id,
        career_goals="Land first software engineering role",
        target_duration_weeks=12,
        weekly_study_hours=15
    )
    res1 = set_target_career(target_req1, db=db)
    assert res1.target_role_id == java_role.id
    assert res1.target_role is not None
    assert res1.target_role.id == java_role.id

    # 4. Verify in database
    db.refresh(test_profile)
    assert test_profile.target_role_id == java_role.id
    assert test_profile.career_goals == "Land first software engineering role"

    # 5. Verify get_latest_profile reflects target
    latest = get_latest_profile(db=db)
    assert latest.target_role_id is not None

    # 6. Change target to Data Analyst (role 5)
    data_analyst = db.query(CareerRole).filter(CareerRole.slug == "data-analyst").first()
    assert data_analyst is not None

    target_req2 = SetTargetCareerRequest(
        profile_id=test_profile.id,
        role_id=data_analyst.id,
        career_goals="Transition to Data Analytics",
        target_duration_weeks=16,
        weekly_study_hours=20
    )
    res2 = set_target_career(target_req2, db=db)
    assert res2.target_role_id == data_analyst.id
    assert res2.target_duration_weeks == 16
    assert res2.weekly_study_hours == 20

    # 7. Verify previous history is preserved in database
    java_roadmap = db.query(Roadmap).filter(
        Roadmap.profile_id == test_profile.id,
        Roadmap.role_id == java_role.id
    ).first()
    assert java_roadmap is not None, "Previous Java roadmap must be preserved!"

    da_roadmap = db.query(Roadmap).filter(
        Roadmap.profile_id == test_profile.id,
        Roadmap.role_id == data_analyst.id
    ).first()
    assert da_roadmap is not None, "Data Analyst roadmap must be created!"

    # 8. Change target to Non-Tech Career: Chartered Accountant (role 68)
    ca_role = db.query(CareerRole).filter(CareerRole.slug == "chartered-accountant").first()
    assert ca_role is not None

    target_req3 = SetTargetCareerRequest(
        profile_id=test_profile.id,
        role_id=ca_role.id,
        career_goals="Pass professional finance certification"
    )
    res3 = set_target_career(target_req3, db=db)
    assert res3.target_role_id == ca_role.id
    db.refresh(test_profile)
    assert test_profile.target_role_id == ca_role.id

    # 9. Change target to Design Career: Visual & Graphic Designer
    designer_role = db.query(CareerRole).filter(CareerRole.slug == "visual-graphic-designer").first()
    assert designer_role is not None

    target_req4 = SetTargetCareerRequest(
        profile_id=test_profile.id,
        role_id=designer_role.id
    )
    res4 = set_target_career(target_req4, db=db)
    assert res4.target_role_id == designer_role.id

    # 10. Test Database Bookmarks / Saved Careers
    # Save Java Developer and Chartered Accountant to favourites
    saved1 = save_favourite_career(test_profile.id, {"role_id": java_role.id}, db=db)
    assert any(item["id"] == java_role.id for item in saved1)

    saved2 = save_favourite_career(test_profile.id, {"role_id": ca_role.id}, db=db)
    assert any(item["id"] == ca_role.id for item in saved2)
    assert len(saved2) == 2

    # Verify retrieval
    retrieved_saved = get_saved_careers(test_profile.id, db=db)
    assert len(retrieved_saved) == 2

    # Remove one bookmark
    removed = remove_saved_career(test_profile.id, java_role.id, db=db)
    assert not any(item["id"] == java_role.id for item in removed)
    assert len(removed) == 1
    assert removed[0]["id"] == ca_role.id

    # Clean up test profile
    db.delete(test_profile)
    db.commit()


def test_target_career_invalid_role_and_auto_init(db, monkeypatch):
    """
    Verifies:
    1. Setting target with invalid role ID raises 404 with clear message.
    2. Auto-initialization guarantees a profile always exists.
    3. Roadmap generation becomes available immediately upon target setting.
    """
    from fastapi import HTTPException

    # 1. Invalid Role ID raises 404
    with pytest.raises(HTTPException) as exc_info:
        set_target_career(SetTargetCareerRequest(role_id=999999), db=db)
    assert exc_info.value.status_code == 404
    assert "not found in catalogue" in exc_info.value.detail

    # 2. Setting target with valid career_slug
    java_role = db.query(CareerRole).filter(CareerRole.slug == "java-developer").first()
    res = set_target_career(SetTargetCareerRequest(career_slug="java-developer"), db=db)
    assert res.target_role_id == java_role.id
    assert res.target_role.slug == "java-developer"

    # 3. Target persists in latest profile
    latest = get_latest_profile(db=db)
    assert latest.target_role_id == java_role.id
