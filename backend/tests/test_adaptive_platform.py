import pytest
from app.database import SessionLocal
from app.models import CareerRole, Skill, AssessmentQuiz, RoadmapTask
from app.schemas import (
    CareerComparisonRequest,
    QuizSubmitRequest,
    RoadmapGenerateRequest,
    RoadmapRescheduleRequest,
    TaskUpdate,
    ProfileCreate,
)
from app.api.roles import compare_career_roles, get_career_roles
from app.api.assessment import get_skill_quiz, submit_skill_quiz, get_assessable_skills
from app.api.roadmaps import generate_roadmap, reschedule_roadmap, get_roadmap_progress
from app.api.tasks import update_task
from app.api.profile import create_profile
from app.main import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_catalogue_contains_non_tech_and_tech_roles(db):
    """Verify that both technical and non-technical career paths are present in catalogue."""
    roles = get_career_roles(db)
    slugs = [r.slug for r in roles]
    assert len(roles) >= 14
    assert "business-analyst" in slugs
    assert "digital-marketing-specialist" in slugs
    assert "ui-ux-designer" in slugs
    assert "hr-specialist" in slugs
    assert "financial-analyst" in slugs
    assert "software-development-engineer" in slugs


def test_career_comparison_endpoint(db):
    """Test comparing 2 to 3 career paths side-by-side."""
    roles = db.query(CareerRole).filter(
        CareerRole.slug.in_(["business-analyst", "data-analyst", "financial-analyst"])
    ).all()
    assert len(roles) >= 3
    role_ids = [r.id for r in roles[:3]]

    req = CareerComparisonRequest(
        role_ids=role_ids,
        skills_assessment={
            "advanced-excel-spreadsheets": 4,
            "database-systems-sql": 3,
            "business-metrics-kpi-analysis": 2,
        }
    )

    comparison = compare_career_roles(req, db=db)
    assert len(comparison.compared_roles) == 3
    # Advanced Excel is required across all 3
    assert "Advanced Excel & Spreadsheets" in comparison.shared_skills or len(comparison.shared_skills) > 0
    # Transferable skills should be identified
    assert len(comparison.transferable_skills) > 0
    assert "readiness" in comparison.recommendation_summary.lower()


def test_assessment_quiz_lifecycle(db):
    """Test taking an interactive assessment quiz and earning a verified score."""
    # Find skill with quiz
    excel_skill = db.query(Skill).filter(Skill.slug == "advanced-excel-spreadsheets").first()
    assert excel_skill is not None

    questions = get_skill_quiz(str(excel_skill.id), db=db)
    assert len(questions) >= 1

    # Get actual quiz to know correct answer
    actual_q = db.query(AssessmentQuiz).filter(AssessmentQuiz.skill_id == excel_skill.id).first()
    assert actual_q is not None

    # Submit correct answer
    submit_req = QuizSubmitRequest(
        skill_id=excel_skill.id,
        answers={actual_q.id: actual_q.correct_answer_index},
        evidence_link="https://github.com/student/excel-financial-model"
    )

    result = submit_skill_quiz(submit_req, db=db)
    assert result.skill_id == excel_skill.id
    assert result.correct_count >= 1
    assert result.score_percentage > 0
    assert result.assessed_proficiency_level >= 1
    assert "verified proficiency" in result.feedback.lower()


def test_non_technical_career_roadmap_generation(db):
    """
    Verify that a non-technical student (e.g. Commerce background) selecting Business Analyst
    receives appropriate business deliverables (PRDs, Excel KPI models, STAR rubrics)
    rather than software code katas or compiler architectures.
    """
    ba_role = db.query(CareerRole).filter(CareerRole.slug == "business-analyst").first()
    assert ba_role is not None

    profile = create_profile(
        ProfileCreate(
            display_name="Sarah Commercial",
            education_level="Recent Graduate",
            educational_field="Commerce",
            degree_specialization="B.Com Accounting",
            current_status="career_switcher",
            current_experience_level="Beginner",
            target_role_id=ba_role.id,
            weekly_study_hours=15,
            target_duration_weeks=10,
            learning_budget="free_only",
            skills_assessment={"advanced-excel-spreadsheets": 2}
        ),
        db=db
    )

    roadmap = generate_roadmap(
        RoadmapGenerateRequest(
            profile_id=profile.id,
            role_id=ba_role.id,
            weekly_hours=15,
            target_duration_weeks=10,
            skills_assessment={"advanced-excel-spreadsheets": 2}
        ),
        db=db
    )

    assert roadmap.role_id == ba_role.id
    assert roadmap.tasks_count > 0
    # Check that tasks reflect business analysis
    task_titles = [t.title.lower() for t in roadmap.tasks]
    assert any("excel" in t or "requirements" in t or "kpi" in t or "stakeholder" in t or "user stories" in t for t in task_titles)


def test_roadmap_reschedule_preserves_completed_tasks(db):
    """
    Test that when an adaptive roadmap is rescheduled due to changed hours/weeks,
    historical completed tasks, logged hours, and evidence links are strictly preserved.
    """
    role = db.query(CareerRole).filter(CareerRole.slug == "digital-marketing-specialist").first()
    assert role is not None

    roadmap = generate_roadmap(
        RoadmapGenerateRequest(
            role_id=role.id,
            weekly_hours=12,
            target_duration_weeks=8,
            skills_assessment={}
        ),
        db=db
    )

    # Complete the first task
    first_task = roadmap.tasks[0]
    update_task(
        first_task.id,
        TaskUpdate(
            is_completed=True,
            status="completed",
            actual_hours_spent=5.5,
            evidence_link="https://notion.so/seo-audit-checklist"
        ),
        db=db
    )

    # Reschedule roadmap to 20 hours/week over 12 weeks
    rescheduled = reschedule_roadmap(
        roadmap.id,
        RoadmapRescheduleRequest(
            roadmap_id=roadmap.id,
            new_weekly_hours=20,
            new_duration_weeks=12
        ),
        db=db
    )

    assert rescheduled.weekly_hours == 20
    assert rescheduled.target_duration_weeks == 12

    # Verify first task is still completed with exact evidence and logged hours
    updated_first = next(t for t in rescheduled.tasks if t.id == first_task.id)
    assert updated_first.is_completed is True
    assert updated_first.actual_hours_spent == 5.5
    assert updated_first.evidence_link == "https://notion.so/seo-audit-checklist"

