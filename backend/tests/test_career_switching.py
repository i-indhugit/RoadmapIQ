import pytest
from app.database import SessionLocal
from app.models import CareerRole, StudentProfile, Roadmap, RoadmapTask
from app.schemas import ProfileCreate, RoadmapSwitchRequest, TaskUpdate
from app.api.profile import create_profile
from app.api.roadmaps import switch_career_roadmap
from app.api.tasks import update_task

def test_career_switching_preserves_independent_progress():
    db = SessionLocal()
    try:
        # 1. Create a student profile
        prof_payload = ProfileCreate(
            display_name="Adaptive Student",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            current_status="student",
            current_experience_level="Beginner",
            target_role_id=7,  # Machine Learning Engineer
            weekly_study_hours=15,
            target_duration_weeks=10,
            preferred_learning_format="mixed",
            learning_budget="free_only",
            preferred_language="en",
            skills_assessment={},
            avatar_style="ai_robot"
        )
        profile_out = create_profile(prof_payload, db)
        assert profile_out.id is not None

        # 2. Switch to Machine Learning Engineer (Role 7)
        ml_switch = RoadmapSwitchRequest(
            profile_id=profile_out.id,
            role_id=7,
            weekly_hours=15,
            target_duration_weeks=10
        )
        ml_roadmap = switch_career_roadmap(ml_switch, db)
        assert ml_roadmap.role_id == 7
        assert ml_roadmap.role_title == "Machine Learning Engineer"
        assert len(ml_roadmap.tasks) > 0
        initial_ml_task_id = ml_roadmap.tasks[0].id

        # 3. Complete a skill milestone in Machine Learning Engineer
        task_updated = update_task(initial_ml_task_id, TaskUpdate(is_completed=True), db=db)
        assert task_updated.is_completed is True

        # 4. Switch to Business Analyst (Role 9)
        ba_switch = RoadmapSwitchRequest(
            profile_id=profile_out.id,
            role_id=9,
            weekly_hours=15,
            target_duration_weeks=10
        )
        ba_roadmap = switch_career_roadmap(ba_switch, db)
        assert ba_roadmap.role_id == 9
        assert ba_roadmap.role_title == "Business Analyst"
        assert ba_roadmap.id != ml_roadmap.id
        # Business analyst tasks must be different from ML tasks
        ba_titles = [t.title for t in ba_roadmap.tasks]
        ml_titles = [t.title for t in ml_roadmap.tasks]
        assert ba_titles != ml_titles

        # 5. Switch to Software Development Engineer (Role 1)
        sde_switch = RoadmapSwitchRequest(
            profile_id=profile_out.id,
            role_id=1,
            weekly_hours=15,
            target_duration_weeks=10
        )
        sde_roadmap = switch_career_roadmap(sde_switch, db)
        assert sde_roadmap.role_id == 1
        assert sde_roadmap.role_title in ["Software Development Engineer", "Software Engineer"]
        assert sde_roadmap.id != ml_roadmap.id
        assert sde_roadmap.id != ba_roadmap.id

        # 6. Switch back to Machine Learning Engineer (Role 7)
        ml_restore_switch = RoadmapSwitchRequest(
            profile_id=profile_out.id,
            role_id=7,
            weekly_hours=15,
            target_duration_weeks=10
        )
        ml_restored = switch_career_roadmap(ml_restore_switch, db)
        assert ml_restored.id == ml_roadmap.id
        assert ml_restored.role_id == 7
        # Verify the previously completed task is still completed!
        restored_task = next(t for t in ml_restored.tasks if t.id == initial_ml_task_id)
        assert restored_task.is_completed is True
        assert ml_restored.completed_tasks_count >= 1

    finally:
        db.close()
