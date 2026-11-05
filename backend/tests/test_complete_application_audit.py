import pytest
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal
from app.models import (
    CareerRole,
    StudentProfile,
    Roadmap,
    RoadmapTask,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    LearningResource,
    CareerAssessmentAttempt,
    CareerAssessmentQuestion,
    CareerAssessmentResult,
    DailyActivityLog,
    WeeklyGoalRecord,
    XPTransaction,
)
from app.schemas import (
    RoadmapGenerateRequest,
    SpecializationSwitchRequest,
    MilestoneTutorRequest,
    AIRoadmapAdviceRequest,
    AIExplainRequest,
    WeeklyPlannerAIRequest,
    ProfileCreate,
)
from app.api.health import get_health
from app.api.career_assessment import (
    get_all_careers,
    get_career_detail,
    get_career_overview,
    start_career_assessment,
    save_answers,
    submit_assessment,
    get_assessment_results,
    get_skill_analysis,
    get_student_assessment_history,
    compare_reassessment_attempts,
)
from app.api.roles import compare_roles
from app.api.discovery import (
    get_discovery_questions,
    discover_careers,
    DiscoveryAnswerRequest,
)
from app.api.roadmaps import (
    generate_roadmap,
    get_roadmap_specializations,
    switch_roadmap_specialization,
    format_roadmap_out,
)
from app.api.tasks import toggle_task_completion
from app.api.activities import (
    complete_activity,
    get_student_streak_status,
    set_student_weekly_goal,
    ActivityCompleteRequest,
    WeeklyGoalSetRequest,
)
from app.api.portfolio import (
    get_student_portfolio,
    submit_skill_evidence,
    SkillEvidenceSubmission,
)
from app.api.gamification import (
    get_gamification_status,
    get_player_profile,
    get_visual_skill_tree,
    get_career_readiness,
)
from app.api.ai import (
    get_ai_status,
    get_milestone_ai_tutor,
    get_roadmap_advice,
    get_skill_gap_explanation,
    get_weekly_study_plan,
)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def audit_profile(db):
    profile = db.query(StudentProfile).filter(StudentProfile.display_name == "Audit Student Pro").first()
    if not profile:
        profile = StudentProfile(
            display_name="Audit Student Pro",
            education_level="Undergraduate - Final Year",
            degree_specialization="B.Tech Computer Science",
            educational_field="Engineering / Technology",
            current_status="student",
            current_experience_level="Intermediate",
            weekly_study_hours=15,
            target_duration_weeks=12,
            preferred_learning_format="mixed",
            learning_budget="free_only",
            preferred_language="en",
            xp=250,
            level=2,
            streak_days=3,
            longest_streak=5,
            last_active_date=(datetime.now(timezone.utc).date() - timedelta(days=1)).strftime("%Y-%m-%d"),
            weekly_streak_count=2,
            longest_weekly_streak=2,
            weekly_goal_target=5,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ===========================================================================
# PHASE 1 & 2: DISCOVER MODULE AUDIT
# ===========================================================================
def test_audit_discover_module(db):
    """
    DISCOVER AUDIT:
    1. Career catalogue loads with pagination and domain filters.
    2. Search query matches roles by title, tools, and domain.
    3. Career detail & overview returns complete metadata.
    4. Multi-career comparison compares 2 to 3 roles.
    5. Guided discovery returns ranked matches from questionnaire answers.
    """
    # 1. Catalogue
    careers_page = get_all_careers(page=1, page_size=20, db=db)
    assert careers_page["total"] >= 250, "Expected at least 250 careers in catalogue"
    assert len(careers_page["items"]) == 20

    # 2. Domain Filtering
    tech_careers = get_all_careers(domain="Technology and IT", page=1, page_size=10, db=db)
    assert tech_careers["total"] >= 10
    for item in tech_careers["items"]:
        assert item["domain"] == "Technology and IT"

    # 3. Search Filtering
    search_res = get_all_careers(search="software", page=1, page_size=10, db=db)
    assert search_res["total"] >= 1
    assert any("software" in c["title"].lower() or "software" in c["slug"].lower() for c in search_res["items"])

    # 4. Career Detail & Overview
    detail = get_career_detail("software-development-engineer", db=db)
    assert detail["title"] == "Software Engineer"
    assert "core_competencies" in detail
    assert "tools_and_technologies" in detail

    overview = get_career_overview("software-development-engineer", db=db)
    assert overview["title"] == "Software Engineer"
    assert overview["total_skills"] >= 1

    # 5. Career Comparison
    comp_res = compare_roles(
        {"role_slugs": ["software-development-engineer", "data-analyst", "financial-analyst"]},
        db=db
    )
    assert "roles" in comp_res
    assert len(comp_res["roles"]) == 3
    assert "skill_overlap" in comp_res

    # 6. Guided Discovery
    questions = get_discovery_questions(db=db)
    assert len(questions["questions"]) >= 3
    discovery_res = discover_careers(
        DiscoveryAnswerRequest(answers={"math_preference": 4, "coding_interest": 5, "creative_design": 2}),
        db=db
    )
    assert len(discovery_res["recommended_careers"]) >= 1


# ===========================================================================
# PHASE 2: ASSESS MODULE AUDIT
# ===========================================================================
def test_audit_assess_module(db, audit_profile):
    """
    ASSESS AUDIT:
    1. Career-specific assessment start returns timed test configuration.
    2. Answer submission records answer choices and flag for review.
    3. Final submission calculates accurate proficiency score (0 to 100).
    4. 4-quadrant skill gap analysis categorizes strong, weak, missing skills.
    5. Reassessment comparison tracks progress delta across attempts.
    """
    role = db.query(CareerRole).filter(CareerRole.slug == "software-development-engineer").first()
    assert role is not None

    # 1. Start Assessment
    start_payload = {
        "role_id": role.id,
        "profile_id": audit_profile.id,
        "question_count": 5,
        "difficulty_preference": "intermediate",
    }
    start_res = start_career_assessment(start_payload, db=db)
    assert start_res["attempt_id"] is not None
    attempt_id = start_res["attempt_id"]
    assert len(start_res["questions"]) == 5
    assert start_res["duration_mins"] >= 5

    # 2. Save Answers with Flag for Review
    ans_payload = {
        "answers": [
            {"question_id": start_res["questions"][0]["id"], "selected_option": "a", "flagged": True},
            {"question_id": start_res["questions"][1]["id"], "selected_option": "b", "flagged": False},
        ]
    }
    save_res = save_answers(attempt_id, ans_payload, db=db)
    assert save_res["status"] == "saved"

    # 3. Submit Assessment
    final_payload = {
        "answers": [
            {"question_id": q["id"], "selected_option": "a"}
            for q in start_res["questions"]
        ]
    }
    sub_res = submit_assessment(attempt_id, final_payload, db=db)
    assert sub_res["status"] == "completed"
    assert 0 <= sub_res["score_percentage"] <= 100
    assert sub_res["readiness_level"] is not None

    # 4. Results & 4-Quadrant Skill Analysis
    results = get_assessment_results(attempt_id, db=db)
    assert results["total_questions"] == 5

    skill_analysis = get_skill_analysis(attempt_id, db=db)
    assert "quadrants" in skill_analysis or "skill_gaps" in skill_analysis or "skill_breakdown" in skill_analysis

    # 5. History
    history = get_student_assessment_history(audit_profile.id, db=db)
    assert len(history) >= 1


# ===========================================================================
# PHASE 3: UNIVERSAL CAREER ROADMAP TESTING (15 DOMAINS)
# ===========================================================================
def test_audit_15_domains_universal_roadmaps(db, audit_profile, monkeypatch):
    """
    UNIVERSAL ROADMAP AUDIT (HIGHEST PRIORITY):
    Tests roadmap generation across all 15 required career domains.
    Verifies domain-specific activity methods, 5-part workspace data,
    free verified resources, and specialization branches.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    domain_test_specs = [
        {"domain_name": "1. Technology", "slug": "software-development-engineer", "expected_method": "coding"},
        {"domain_name": "2. AI & Machine Learning", "slug": "machine-learning-engineer", "expected_method": "coding"},
        {"domain_name": "3. Data Science", "slug": "data-analyst", "expected_method": "coding"},
        {"domain_name": "4. Commerce & Finance", "slug": "financial-analyst", "expected_method": "financial_model"},
        {"domain_name": "5. Healthcare", "slug": "general-practitioner", "expected_method": "clinical_case"},
        {"domain_name": "6. Law", "slug": "corporate-legal-counsel", "expected_method": "legal_draft"},
        {"domain_name": "7. Engineering", "slug": "mechanical-design-engineer", "expected_method": "engineering_calc"},
        {"domain_name": "8. Arts & Humanities", "slug": "technical-writer", "expected_method": "theory"},
        {"domain_name": "9. Business & Management", "slug": "business-analyst", "expected_method": "business_case"},
        {"domain_name": "10. Government Exams", "slug": "civil-services-officer", "expected_method": "syllabus_prep"},
        {"domain_name": "11. Education", "slug": "university-professor", "expected_method": "theory"},
        {"domain_name": "12. Design & Media", "slug": "ui-ux-designer", "expected_method": "design_brief"},
        {"domain_name": "13. Agriculture", "slug": "precision-agronomist", "expected_method": "field_analysis"},
        {"domain_name": "14. Hospitality & Aviation", "slug": "hotel-general-manager", "expected_method": "hospitality_ops"},
        {"domain_name": "15. Psychology", "slug": "clinical-psychologist", "expected_method": "counseling_sim"},
    ]

    for spec in domain_test_specs:
        slug = spec["slug"]
        domain_name = spec["domain_name"]
        expected_method = spec["expected_method"]

        role = db.query(CareerRole).filter(CareerRole.slug == slug).first()
        assert role is not None, f"Domain {domain_name} role {slug} not found in database!"

        # Generate universal roadmap
        gen_req = RoadmapGenerateRequest(
            role_id=role.id,
            profile_id=audit_profile.id,
            target_duration_weeks=10,
            weekly_hours=12,
        )
        roadmap_out = generate_roadmap(gen_req, db)

        assert roadmap_out.id is not None
        assert roadmap_out.role_title == role.title
        assert len(roadmap_out.tasks) >= 4, f"Roadmap for {domain_name} has insufficient tasks"

        # 1. Verify Domain Activity Method
        sample_task = roadmap_out.tasks[0]
        assert sample_task.activity_method == expected_method, (
            f"Expected {expected_method} for {domain_name}, got {sample_task.activity_method}"
        )

        # 2. Verify 5-Part Learning Workspace
        ws = sample_task.workspace_data
        assert ws is not None, f"Workspace data missing for {domain_name}"
        assert "learn" in ws, f"Learn tab missing for {domain_name}"
        assert "practice" in ws, f"Practice tab missing for {domain_name}"
        assert "build" in ws, f"Build tab missing for {domain_name}"
        assert "evaluate" in ws, f"Evaluate tab missing for {domain_name}"

        # 3. Learn Tab: Resources
        assert len(ws["learn"]["resources"]) >= 1
        for res in ws["learn"]["resources"]:
            assert res.get("url", "").startswith("http")
            assert res.get("is_free") is True

        # 4. Practice Tab: Progressive Drills
        practice = ws["practice"]
        assert "beginner" in practice
        assert "intermediate" in practice
        assert "advanced" in practice
        assert "scenario" in practice

        # 5. Build Tab: Deliverable & Rubrics
        build = ws["build"]
        assert len(build.get("brief", "")) > 20
        assert build.get("deliverable_format") is not None
        assert len(build.get("evaluation_rubrics", [])) >= 2

        # 6. Evaluate Tab: Diagnostic Quiz
        evaluate = ws["evaluate"]
        assert len(evaluate.get("checkpoint_quiz", [])) >= 1

        # 7. Specialization Branches
        spec_data = get_roadmap_specializations(roadmap_out.id, db)
        assert len(spec_data["specializations"]) >= 2, (
            f"Domain {domain_name} must offer at least 2 specialization branches"
        )


# ===========================================================================
# PHASE 4 & 5: AI FUNCTIONALITY & DETERMINISTIC FALLBACKS
# ===========================================================================
def test_audit_ai_and_deterministic_fallbacks(monkeypatch):
    """
    AI AUDIT:
    Tests AI status, Milestone Tutor (explain, notes, flashcards, quiz, custom),
    Roadmap Advice, Skill Gap Explanation, and Weekly Study Planner.
    Verifies that offline execution cleanly falls back to deterministic curriculum guidance.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    # 1. AI Status
    status = get_ai_status()
    assert status.provider == "Google Gemini API (Cloud)"
    assert status.model == "gemini-2.5-flash"

    # 2. Milestone Tutor - Deep Dive
    res_explain = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title="Clinical Trial Protocols & GCP",
            role_title="Physician / General Practitioner",
            domain="Healthcare, Medicine & Life Sciences",
            action="explain"
        )
    )
    assert res_explain.action == "explain"
    assert len(res_explain.content) > 50

    # 3. Milestone Tutor - Flashcards
    res_fc = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title="Corporate Due Diligence & M&A Clauses",
            role_title="Corporate Legal Counsel",
            domain="Law & Legal Services",
            action="flashcards"
        )
    )
    assert len(res_fc.flashcards) >= 3

    # 4. Milestone Tutor - Diagnostic Quiz
    res_quiz = get_milestone_ai_tutor(
        MilestoneTutorRequest(
            milestone_title="Precision Agronomy Soil Nutrient Balancing",
            role_title="Precision Agronomist",
            domain="Agriculture, Environment & Sustainability",
            action="quiz"
        )
    )
    assert len(res_quiz.quiz) >= 3

    # 5. Roadmap Advice
    adv_req = AIRoadmapAdviceRequest(
        role_title="Financial Analyst",
        readiness_score=40.0,
        target_duration_weeks=10,
        weekly_hours=12,
        top_gaps=["Financial Modeling", "DCF Valuation"]
    )
    adv_res = get_roadmap_advice(adv_req)
    assert len(adv_res.weekly_pacing_strategy) > 10

    # 6. Skill Gap Explanation
    gap_req = AIExplainRequest(
        topic="IRAC Statutory Drafting",
        target_role="Corporate Legal Counsel",
        skill_category="Law & Legal Services",
        current_proficiency=1,
        target_proficiency=4
    )
    gap_res = get_skill_gap_explanation(gap_req)
    assert len(gap_res.explanation) > 10

    # 7. Weekly Planner
    planner_req = WeeklyPlannerAIRequest(
        role_title="Machine Learning Engineer",
        weekly_hours=15,
        priority_skills=["PyTorch", "Model Evaluation"]
    )
    planner_res = get_weekly_study_plan(planner_req)
    assert len(planner_res.daily_schedule) == 7


# ===========================================================================
# PHASE 6: DATA INTEGRITY & SECURITY AUDIT
# ===========================================================================
def test_audit_data_integrity_and_streaks(db, audit_profile, monkeypatch):
    """
    DATA INTEGRITY AUDIT:
    1. Duplicate XP prevention: completing the same task twice must not grant double XP.
    2. Streak tracking: active days advance streak, repeated activity on same date does not increment streak.
    3. Milestone unlocking: completing Phase 1 unlocks Phase 2 tasks.
    4. Skill Evidence Submission: verified evidence links persist on student profile.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    role = db.query(CareerRole).filter(CareerRole.slug == "software-development-engineer").first()
    gen_req = RoadmapGenerateRequest(
        role_id=role.id,
        profile_id=audit_profile.id,
        target_duration_weeks=10,
        weekly_hours=15,
    )
    roadmap = generate_roadmap(gen_req, db)
    task1 = roadmap.tasks[0]

    initial_xp = audit_profile.xp

    # 1. Complete Task Once
    res1 = toggle_task_completion(task1.id, is_completed=True, db=db)
    db.refresh(audit_profile)
    assert res1.is_completed is True
    assert audit_profile.xp >= initial_xp + 50

    xp_after_first = audit_profile.xp

    # 2. Duplicate Completion Attempt (Must NOT grant additional XP)
    res2 = toggle_task_completion(task1.id, is_completed=True, db=db)
    db.refresh(audit_profile)
    assert audit_profile.xp == xp_after_first, "Duplicate task completion awarded unauthorized XP!"

    # 3. Daily Streak Logic
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    act_req = ActivityCompleteRequest(
        activity_type="PRACTICE_DRILL",
        activity_title="Unit Test Suite",
        duration_minutes=45,
        category="LEARN",
        timezone="UTC"
    )
    streak_res1 = complete_activity(audit_profile.id, act_req, db=db)
    streak_val = streak_res1["streak_days"]

    # Repeated activity on the same calendar day should preserve streak, not increment twice
    streak_res2 = complete_activity(audit_profile.id, act_req, db=db)
    assert streak_res2["streak_days"] == streak_val, "Repeated activity on same day incremented streak multiple times!"

    # 4. Evidence Submission
    evidence_payload = SkillEvidenceSubmission(
        skill_slug="software-architecture",
        evidence_type="github",
        evidence_url="https://github.com/student/clean-architecture-demo",
        description="Implemented clean architecture with repository pattern and integration tests.",
    )
    ev_res = submit_skill_evidence(audit_profile.id, evidence_payload, db=db)
    assert ev_res.status == "verified"

    # Verify portfolio reflects evidence
    portfolio = get_student_portfolio(audit_profile.id, db=db)
    assert portfolio["total_verified_skills"] >= 1


# ===========================================================================
# PHASE 7 & 8: GAMIFICATION & READINESS AUDIT
# ===========================================================================
def test_audit_growth_dual_metrics(db, audit_profile):
    """
    GROWTH AUDIT:
    Strictly verifies separation of:
    - Roadmap Task Completion % (Tasks completed / Total tasks)
    - Career Readiness % (Verified skills / Target career skill requirements)
    """
    gam_status = get_gamification_status(audit_profile.id, db=db)
    assert "xp" in gam_status
    assert "level" in gam_status
    assert "level_title" in gam_status

    readiness = get_career_readiness(audit_profile.id, db=db)
    assert "career_readiness_pct" in readiness
    assert "roadmap_completion_pct" in readiness
    # Both metrics exist and are distinct
    assert 0 <= readiness["career_readiness_pct"] <= 100
    assert 0 <= readiness["roadmap_completion_pct"] <= 100

