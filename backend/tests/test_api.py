import pytest
from app.database import SessionLocal
from app.schemas import (
    ProfileCreate,
    ProfileUpdate,
    RoadmapGenerateRequest,
    TaskUpdate,
    RAGQueryRequest,
    AIRoadmapAdviceRequest,
    AIExplainRequest,
    ProjectMentorRequest,
    InterviewFeedbackRequest
)
from app.api.health import get_health
from app.api.roles import get_career_roles, get_career_role_detail
from app.api.skills import get_all_skills
from app.api.profile import create_profile, update_profile
from app.api.roadmaps import generate_roadmap, get_roadmap, get_roadmap_progress, get_roadmap_skill_gaps
from app.api.tasks import update_task_completion
from app.api.resources import get_learning_resources
from app.api.projects import get_projects
from app.api.interview import get_interview_questions, get_mock_interview_feedback
from app.api.ai import (
    get_ai_status,
    get_roadmap_advice,
    get_skill_gap_explanation,
    ask_learning_assistant,
    get_project_milestone_mentor
)


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


def test_health_endpoint():
    res = get_health()
    assert res["status"] == "healthy"
    assert res["app"] == "RoadmapIQ"


def test_career_roles_endpoints(db):
    roles = get_career_roles(db)
    assert len(roles) >= 10
    slugs = [r.slug for r in roles]
    assert "software-development-engineer" in slugs
    assert "full-stack-developer" in slugs
    assert "generative-ai-developer" in slugs

    # Detail
    sde_detail = get_career_role_detail("software-development-engineer", db)
    assert sde_detail.title in ["Software Development Engineer", "Software Engineer"]
    assert len(sde_detail.requirements) > 0


def test_skills_endpoint(db):
    skills = get_all_skills(db)
    assert len(skills) >= 15
    skill_slugs = [s.slug for s in skills]
    assert "python-programming" in skill_slugs
    assert "data-structures-algorithms" in skill_slugs


def test_profile_lifecycle(db):
    create_req = ProfileCreate(
        display_name="Jordan Reed",
        education_level="Undergraduate - Final Year",
        degree_specialization="B.Tech Computer Science",
        current_experience_level="Intermediate",
        weekly_study_hours=18,
        target_duration_weeks=12,
        preferred_learning_format="mixed",
        skills_assessment={"python-programming": 2, "database-systems-sql": 1}
    )
    profile = create_profile(create_req, db)
    assert profile.id is not None
    assert profile.display_name == "Jordan Reed"

    # Update
    up_req = ProfileUpdate(weekly_study_hours=22)
    updated = update_profile(profile.id, up_req, db)
    assert updated.weekly_study_hours == 22


def test_roadmap_lifecycle_and_tasks(db):
    roles = get_career_roles(db)
    sde_role = next(r for r in roles if r.slug == "software-development-engineer")

    req = RoadmapGenerateRequest(
        role_id=sde_role.id,
        weekly_hours=15,
        target_duration_weeks=10,
        preferred_format="mixed",
        skills_assessment={"python-programming": 1}
    )
    roadmap = generate_roadmap(req, db)
    assert roadmap.id is not None
    assert roadmap.role_id == sde_role.id
    assert len(roadmap.tasks) > 0

    first_task = roadmap.tasks[0]
    assert first_task.is_completed is False

    # Mark complete
    updated_task = update_task_completion(first_task.id, TaskUpdate(is_completed=True), db)
    assert updated_task.is_completed is True

    # Progress
    progress = get_roadmap_progress(roadmap.id, db)
    assert progress.completed_tasks >= 1
    assert progress.completion_percentage > 0

    # Skill gaps
    gaps = get_roadmap_skill_gaps(roadmap.id, db)
    assert gaps.role_id == sde_role.id
    assert len(gaps.gaps) > 0


def test_resources_and_projects_endpoints(db):
    resources = get_learning_resources(format=None, difficulty=None, search="python", db=db)
    assert len(resources) > 0
    assert "python" in resources[0].url.lower() or "python" in resources[0].title.lower()

    projects = get_projects(db=db)
    assert len(projects) > 0


def test_interview_and_feedback(db):
    questions = get_interview_questions(db=db)
    assert len(questions) > 0

    feedback_req = InterviewFeedbackRequest(
        question_title="Two Sum Problem",
        question_text="Explain two sum optimal approach",
        student_answer="I use a hash map storing value to index so I can look up the complement in O(1) time and O(n) space."
    )
    fb = get_mock_interview_feedback(feedback_req)
    assert fb.score >= 5
    assert len(fb.strengths) > 0
    assert len(fb.areas_for_improvement) > 0


def test_ai_endpoints(db):
    status = get_ai_status()
    assert status.enabled is True

    # Advice
    advice = get_roadmap_advice(
        AIRoadmapAdviceRequest(
            role_title="Software Development Engineer",
            readiness_score=50.0,
            target_duration_weeks=12,
            weekly_hours=15,
            top_gaps=["Data Structures & Algorithms", "System Design"]
        )
    )
    assert len(advice.weekly_pacing_strategy) > 0

    # Explanation
    explanation = get_skill_gap_explanation(
        AIExplainRequest(
            topic="Data Structures & Algorithms",
            target_role="Software Development Engineer"
        )
    )
    assert "Data Structures" in explanation.topic

    # Project mentor
    mentor = get_project_milestone_mentor(
        ProjectMentorRequest(
            project_name="Distributed KV Store",
            milestone_text="Implement Raft leader election"
        )
    )
    assert len(mentor.implementation_steps) > 0

    # RAG Assistant
    rag = ask_learning_assistant(
        RAGQueryRequest(query="Where can I practice dynamic programming algorithms?"),
        db=db
    )
    assert rag.has_relevant_sources is True
    assert len(rag.sources) > 0
