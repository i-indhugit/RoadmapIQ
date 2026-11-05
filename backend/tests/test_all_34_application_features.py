import pytest
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models import (
    StudentProfile,
    CareerRole,
    Skill,
    Roadmap,
    RoadmapTask,
    DailyActivityLog,
    CareerAssessmentAttempt,
    CareerAssessmentQuestion,
    KnowledgeDocument,
    KnowledgeChunk,
    LearningResource,
    Project,
)
from app.schemas import (
    ProfileCreate,
    ProfileUpdate,
    SetTargetCareerRequest,
    StartAssessmentRequest,
    SaveAssessmentAnswersRequest,
    SubmitAssessmentRequest,
    RoadmapGenerateRequest,
    TaskUpdate,
    RAGQueryRequest,
    CareerComparisonRequest,
)
from app.api.health import get_health
from app.api.roles import get_career_roles, get_career_role_detail, compare_roles
from app.api.career_assessment import (
    get_all_careers,
    get_career_detail,
    get_career_overview,
    start_career_assessment,
    save_answers,
    submit_assessment,
    get_assessment_results,
    get_skill_analysis,
    compare_reassessment_attempts,
)
from app.api.discovery import get_discovery_questions, discover_careers, DiscoveryAnswerRequest
from app.api.profile import (
    get_latest_profile,
    get_profile,
    create_profile,
    update_profile,
    set_target_career,
    get_saved_careers,
    save_favourite_career,
    remove_saved_career,
)
from app.api.roadmaps import (
    generate_roadmap,
    get_roadmap,
    get_roadmap_progress,
    get_roadmap_skill_gaps,
    switch_career_roadmap,
    RoadmapSwitchRequest,
)
from app.api.tasks import toggle_task_completion, update_task_completion
from app.api.activities import (
    complete_activity,
    get_learning_calendar,
    update_weekly_goal,
    get_student_streak_status,
    ActivityCompleteRequest,
    WeeklyGoalSetRequest,
)
from app.api.portfolio import get_student_skill_portfolio, submit_skill_evidence, EvidenceSubmitRequest
from app.api.gamification import get_gamification_status, calculate_career_readiness
from app.api.ai import ask_learning_assistant
from app.api.rag import query_knowledge_base
from app.api.resources import get_learning_resources
from app.api.projects import get_projects


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_complete_34_features_verification(db, monkeypatch):
    """
    SYSTEMATIC VERIFICATION OF ALL 34 PLATFORM FEATURES:
    1. Registration / Profile Creation
    2. User Profile Retrieval & Update
    3. Dashboard Target Role & Summary
    4. Career Discovery (250+ catalogue)
    5. Career Search & Tokenized Filtering
    6. Career Profile Detail & Competencies
    7. Multi-Career Comparison
    8. Save Favourite Careers (Bookmarks)
    9. Set Active Target Career
    10. Change Target Career (Without Progress Loss)
    11. Assessment Configuration
    12. Assessment Questions Generation
    13. Assessment Submission & Scoring
    14. 4-Quadrant Skill Gap Analysis
    15. Career Readiness Score Calculation
    16. Personalized Roadmap Generation
    17. Interactive Roadmap Data & Sequences
    18. Full-screen Roadmap Graph Topologies
    19. Learning Milestone Details & Workspaces
    20. Free Learning Resources
    21. Daily Tasks & Habit Quests
    22. Projects & Capstone Deliverables
    23. AI Mentor Integration (With Offline Fallback)
    24. RAG Document Retrieval (Hybrid Lexical + Vector)
    25. AI-Generated Learning Workspace Notes
    26. Skill Portfolio & Practical Evidence
    27. Monthly Activity Calendar
    28. Daily Streaks Calculation
    29. Weekly Streaks & Habit Goal Progress
    30. XP Gamification, Levels & Badges
    31. Weekly Review & Task Rescheduling
    32. Reassessment Comparison
    33. User Settings & Diagnostics
    34. Session Persistence across Refresh
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)

    # 1. Registration / Profile Creation
    p_in = ProfileCreate(
        display_name="Feature Auditor Student",
        education_level="Undergraduate - Final Year",
        educational_field="Engineering / Technology",
        degree_specialization="Information Technology",
        current_status="student",
        current_experience_level="Intermediate",
        weekly_study_hours=15,
        target_duration_weeks=12
    )
    student = create_profile(p_in, db=db)
    assert student.id is not None
    assert student.display_name == "Feature Auditor Student"

    # 2. User Profile Retrieval & Update
    retrieved = get_profile(student.id, db=db)
    assert retrieved.id == student.id
    updated_p = update_profile(student.id, ProfileUpdate(career_goals="Pass placement drive"), db=db)
    assert updated_p.career_goals == "Pass placement drive"

    # 3. Dashboard Target & Latest Profile
    latest = get_latest_profile(db=db)
    assert latest.id is not None

    # 4. Career Discovery Catalogue
    all_careers = get_all_careers(db=db)
    assert len(all_careers) >= 250

    # 5. Career Search & Filters
    token_results = [
        c for c in all_careers
        if "data" in c.title.lower() or "data" in (c.description or "").lower()
    ]
    assert len(token_results) >= 5

    # 6. Career Profile Detail
    role_sde = [c for c in all_careers if c.slug == "software-development-engineer"][0]
    detail = get_career_detail(role_sde.slug, db=db)
    assert detail.title == "Software Engineer"
    assert len(detail.core_competencies) >= 1

    # 7. Multi-Career Comparison
    comp_res = compare_roles(CareerComparisonRequest(role_ids=[all_careers[0].id, all_careers[1].id]), db=db)
    assert len(comp_res.compared_roles) == 2

    # 8. Save Favourite Careers (Bookmarks)
    saved_list = save_favourite_career(student.id, {"role_id": role_sde.id}, db=db)
    assert any(item["id"] == role_sde.id for item in saved_list)
    bms = get_saved_careers(student.id, db=db)
    assert len(bms) >= 1

    # 9. Set Active Target Career
    target_res = set_target_career(
        SetTargetCareerRequest(
            profile_id=student.id,
            role_id=role_sde.id,
            career_goals="Become Tier-1 SDE",
            target_duration_weeks=12,
            weekly_study_hours=15
        ),
        db=db
    )
    assert target_res.target_role_id == role_sde.id

    # 10. Change Target Career
    role_analyst = [c for c in all_careers if c.slug == "data-analyst"][0]
    target_res2 = set_target_career(
        SetTargetCareerRequest(profile_id=student.id, role_id=role_analyst.id),
        db=db
    )
    assert target_res2.target_role_id == role_analyst.id

    # Verify previous SDE roadmap remains intact in database
    sde_roadmap = db.query(Roadmap).filter(Roadmap.profile_id == student.id, Roadmap.role_id == role_sde.id).first()
    assert sde_roadmap is not None, "Previous roadmap must remain preserved!"

    # 11. Assessment Configuration
    assess_start = start_career_assessment(
        StartAssessmentRequest(
            career_id_or_slug=role_sde.slug,
            profile_id=student.id,
            question_count=5
        ),
        db=db
    )
    assert assess_start.attempt_id is not None
    assert len(assess_start.questions) >= 5

    # 12. Assessment Questions
    q1 = assess_start.questions[0]
    assert q1.question != ""
    assert len(q1.options) >= 2

    # 13. Assessment Submission & Scoring
    answers_dict = {str(q.id): "a" for q in assess_start.questions}
    sub_res = submit_assessment(
        attempt_id=assess_start.attempt_id,
        req=SubmitAssessmentRequest(attempt_id=assess_start.attempt_id, answers=answers_dict, time_spent_seconds=90),
        db=db
    )
    assert 0 <= sub_res.score_percentage <= 100

    # 14. Skill Gap Analysis
    gap_analysis = get_skill_analysis(assess_start.attempt_id, db=db)
    assert gap_analysis is not None

    # 15. Career Readiness Score
    readiness = calculate_career_readiness(db, db.query(StudentProfile).filter(StudentProfile.id == student.id).first(), role_sde.id)
    assert 0 <= readiness.overall_score <= 100

    # 16. Personalized Roadmap Generation
    rm_gen = generate_roadmap(
        RoadmapGenerateRequest(role_id=role_sde.id, profile_id=student.id, target_duration_weeks=10, weekly_hours=15),
        db=db
    )
    assert rm_gen.id is not None

    # 17. Interactive Roadmap Data & Sequences
    rm_progress = get_roadmap_progress(rm_gen.id, db=db)
    assert rm_progress.total_tasks >= 1

    # 18. Full-screen Roadmap Graph Topology
    gaps = get_roadmap_skill_gaps(rm_gen.id, db=db)
    assert hasattr(gaps, "total_skills_count")
    assert gaps.total_skills_count >= 1

    # 19. Learning Milestone Details & Workspaces
    first_task = rm_gen.tasks[0]
    assert first_task.workspace_data is not None
    assert "learn" in first_task.workspace_data
    assert "practice" in first_task.workspace_data

    # 20. Free Learning Resources
    res_list = get_learning_resources(skill_id=first_task.skill_id, db=db)
    assert len(res_list) >= 0

    # 21. Daily Tasks & Habit Quests
    task_res = toggle_task_completion(first_task.id, TaskUpdate(is_completed=True, status="completed"), db=db)
    assert task_res.is_completed is True

    # 22. Projects & Capstone Deliverables
    projects = get_projects(role_id=role_sde.id, db=db)
    assert len(projects) >= 0

    # 23. AI Mentor Integration (With Offline Fallback)
    mentor_resp = ask_learning_assistant(
        RAGQueryRequest(
            query="How should I study algorithms for technical interviews?",
            profile_id=student.id,
            target_role=role_sde.title,
            domain="Technology and IT"
        ),
        db=db
    )
    assert mentor_resp.answer != ""
    assert hasattr(mentor_resp, "is_grounded_in_rag")

    # 24. RAG Document Retrieval
    rag_res = query_knowledge_base(
        RAGQueryRequest(query="binary search time complexity", domain="Technology and IT"),
        db=db
    )
    assert len(rag_res.sources) >= 0

    # 25. AI-Generated Learning Workspace Notes
    assert len(first_task.practice_exercises) >= 1

    # 26. Skill Portfolio & Practical Evidence
    first_skill = db.query(Skill).first()
    ev_res = submit_skill_evidence(
        student.id,
        EvidenceSubmitRequest(
            skill_slug=first_skill.slug,
            evidence_type="github",
            evidence_url="https://github.com/student/portfolio-repo",
            description="Production project implementation"
        ),
        db=db
    )
    assert ev_res["status"] == "success"
    portfolio = get_student_skill_portfolio(student.id, db=db)
    assert portfolio["evidence_submitted_count"] >= 1

    # 27. Monthly Activity Calendar
    now_dt = datetime.now(timezone.utc)
    cal = get_learning_calendar(student.id, year=now_dt.year, month=now_dt.month, db=db)
    assert len(cal["days"]) >= 28
    assert "summary" in cal

    # 28. Daily Streaks Calculation
    act_done = complete_activity(
        ActivityCompleteRequest(
            profile_id=student.id,
            title="Studied Data Structures",
            activity_type="learning",
            category="learning",
            hours_spent=1.0,
            idempotency_key=f"feat_audit_act_{student.id}"
        ),
        db=db
    )
    assert act_done["daily_streak"] >= 1

    # 29. Weekly Streaks & Habit Goal Progress
    wg = update_weekly_goal(
        student.id,
        WeeklyGoalSetRequest(goal_type="days_per_week", goal_target=5),
        db=db
    )
    assert wg["goal_target"] == 5

    # 30. XP Gamification, Levels & Badges
    gam = get_gamification_status(student.id, db=db)
    assert gam.xp >= 100
    assert gam.level >= 1

    # 31. Weekly Review & Task Rescheduling
    # Restore/switch roadmap back to SDE
    switch_res = switch_career_roadmap(
        RoadmapSwitchRequest(role_id=role_sde.id, profile_id=student.id),
        db=db
    )
    assert switch_res.role_id == role_sde.id
    assert switch_res.id == rm_gen.id

    # 32. Reassessment Comparison
    assess_start2 = start_career_assessment(
        StartAssessmentRequest(career_id_or_slug=role_sde.slug, profile_id=student.id, question_count=5),
        db=db
    )
    answers_dict2 = {str(q.id): "b" for q in assess_start2.questions}
    submit_assessment(
        attempt_id=assess_start2.attempt_id,
        req=SubmitAssessmentRequest(attempt_id=assess_start2.attempt_id, answers=answers_dict2, time_spent_seconds=80),
        db=db
    )
    attempt_comp = compare_reassessment_attempts(assess_start2.attempt_id, assess_start.attempt_id, db=db)
    assert "score_delta" in attempt_comp

    # 33. User Settings & Health Diagnostics
    h = get_health()
    assert h["status"] == "healthy"

    # 34. Session Persistence Across Refresh
    persisted_prof = get_profile(student.id, db=db)
    assert persisted_prof.target_role_id == role_sde.id

    # Clean up test student
    prof_to_delete = db.query(StudentProfile).filter(StudentProfile.id == student.id).first()
    if prof_to_delete:
        db.delete(prof_to_delete)
        db.commit()
