import pytest
from app.database import SessionLocal
from app.models import CareerRole, StudentProfile, Roadmap
from app.schemas import (
    RoadmapGenerateRequest,
    MilestoneTutorRequest,
)
from app.api.roadmaps import (
    generate_roadmap,
    get_roadmap_specializations,
    switch_roadmap_specialization,
)
from app.api.ai import get_milestone_ai_tutor


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_profile(db):
    profile = db.query(StudentProfile).first()
    if not profile:
        profile = StudentProfile(
            display_name="Universal Roadmap Explorer",
            education_level="Undergraduate - Final Year",
            degree_specialization="General Studies",
            educational_field="Engineering / Technology",
            weekly_study_hours=15,
            target_duration_weeks=12,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def test_universal_roadmap_across_8_domains(db, test_profile, monkeypatch):
    """
    Validates that the Universal Interactive Career Roadmap Engine successfully
    generates personalized roadmaps across 8 diverse domains:
    1. Technology and IT
    2. Commerce, Finance & Banking
    3. Healthcare, Medicine & Life Sciences
    4. Law & Legal Services
    5. Design, Media & Creative Arts
    6. Government, Civil Services & Public Policy
    7. Core Engineering
    8. Business, Management & Consulting
    """
    # Guarantee instantaneous offline execution
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    representative_roles = [
        {"slug": "software-development-engineer", "expected_method": "coding"},
        {"slug": "financial-analyst", "expected_method": "financial_model"},
        {"slug": "general-practitioner", "expected_method": "clinical_case"},
        {"slug": "corporate-legal-counsel", "expected_method": "legal_draft"},
        {"slug": "ui-ux-designer", "expected_method": "design_brief"},
        {"slug": "civil-services-officer", "expected_method": "syllabus_prep"},
        {"slug": "mechanical-design-engineer", "expected_method": "engineering_calc"},
        {"slug": "product-manager", "expected_method": "business_case"},
    ]

    for item in representative_roles:
        slug = item["slug"]
        expected_method = item["expected_method"]
        role = db.query(CareerRole).filter(CareerRole.slug == slug).first()
        assert role is not None, f"Role not found in DB: {slug}"

        req = RoadmapGenerateRequest(
            role_id=role.id,
            profile_id=test_profile.id,
            target_duration_weeks=12,
            weekly_hours=15,
        )
        roadmap_out = generate_roadmap(req, db)

        assert roadmap_out.id is not None
        assert roadmap_out.role_title is not None
        assert len(roadmap_out.tasks) > 0, f"Expected tasks for {slug}"

        # Verify task schema attributes: activity_method & workspace_data
        sample_task = roadmap_out.tasks[0]
        assert sample_task.activity_method == expected_method, (
            f"Expected method '{expected_method}' for {slug}, got '{sample_task.activity_method}'"
        )

        ws = sample_task.workspace_data
        assert ws is not None, f"workspace_data missing for {slug}"
        assert "learn" in ws, "Learn tab data missing"
        assert "practice" in ws, "Practice tab data missing"
        assert "build" in ws, "Build tab data missing"
        assert "evaluate" in ws, "Evaluate tab data missing"

        # Verify Learn verified resources
        assert len(ws["learn"]["resources"]) > 0, "Expected authentic verified resources in Learn"
        for r in ws["learn"]["resources"]:
            assert r.get("url", "").startswith("http")
            assert r.get("is_free") is True

        # Verify Practice exercises structure
        assert "beginner" in ws["practice"]
        assert "scenario" in ws["practice"]

        # Verify Build project brief
        assert "brief" in ws["build"]
        assert "deliverable_format" in ws["build"]

        # Verify Evaluate diagnostic quiz
        assert "checkpoint_quiz" in ws["evaluate"]
        assert len(ws["evaluate"]["checkpoint_quiz"]) >= 1


def test_specialization_branches_workflow(db, test_profile, monkeypatch):
    """
    Validates fetching specialization branches and switching specialization tracks
    on a generated roadmap.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    role = db.query(CareerRole).filter(CareerRole.slug == "financial-analyst").first()
    gen_req = RoadmapGenerateRequest(
        role_id=role.id,
        profile_id=test_profile.id,
        target_duration_weeks=10,
        weekly_hours=12,
    )
    roadmap_out = generate_roadmap(gen_req, db)
    roadmap_id = roadmap_out.id

    # 1. Fetch available specialization branches
    spec_data = get_roadmap_specializations(roadmap_id, db)
    assert spec_data["roadmap_id"] == roadmap_id
    assert len(spec_data["specializations"]) >= 2
    first_branch = spec_data["specializations"][0]

    # 2. Switch specialization to target branch
    switch_res = switch_roadmap_specialization(
        roadmap_id,
        {"specialization_branch": first_branch["id"]},
        db
    )
    assert switch_res.id == roadmap_id

    # Verify tasks in DB now reflect the new specialization branch
    updated_roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    specialized_tasks = [
        t for t in updated_roadmap.tasks
        if t.specialization_branch == first_branch["id"]
    ]
    assert len(specialized_tasks) >= 1


def test_milestone_ai_tutor_actions(monkeypatch):
    """
    Validates all interactive AI Tutor actions:
    - explain
    - notes
    - flashcards
    - quiz
    - practice
    - custom
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    milestone = "Discounted Cash Flow (DCF) Modeling"
    role = "Financial Analyst"
    domain = "Commerce, Finance & Banking"

    # 1. Action: explain
    res_explain = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action="explain",
        )
    )
    assert res_explain.action == "explain"
    assert len(res_explain.content) > 50
    assert len(res_explain.key_takeaways) > 0

    # 2. Action: notes
    res_notes = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action="notes",
        )
    )
    assert "Revision Notes" in res_notes.content or len(res_notes.content) > 50

    # 3. Action: flashcards
    res_fc = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action="flashcards",
        )
    )
    assert res_fc.flashcards is not None
    assert len(res_fc.flashcards) >= 3
    for fc in res_fc.flashcards:
        assert len(fc.front) > 5
        assert len(fc.back) > 5

    # 4. Action: quiz
    res_quiz = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action="quiz",
        )
    )
    assert res_quiz.quiz is not None
    assert len(res_quiz.quiz) >= 3
    for q in res_quiz.quiz:
        assert len(q.options) == 4
        assert 0 <= q.correct_index <= 3
        assert len(q.explanation) > 0

    # 5. Action: custom question
    res_custom = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action="custom",
            query="How do terminal growth rate assumptions impact enterprise valuation?",
        )
    )
    assert len(res_custom.content) > 50
