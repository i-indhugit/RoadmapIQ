import pytest
import time
from app.database import SessionLocal
from app.models import CareerRole, StudentProfile, Roadmap, RoadmapTask
from app.schemas import ProfileCreate, RoadmapSwitchRequest, TaskUpdate
from app.api.profile import create_profile
from app.api.roadmaps import switch_career_roadmap, get_roadmap_by_role
from app.api.tasks import update_task

def test_full_career_switching_scenarios():
    db = SessionLocal()
    try:
        # Scenario 0: Create profile
        profile_in = ProfileCreate(
            display_name="Multi-Career Learner",
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
            skills_assessment={}
        )
        profile = create_profile(profile_in, db)
        assert profile.id is not None

        # Scenario 1: Select AI/ML Engineer and verify AI skills and theme attributes
        ml_role = db.query(CareerRole).filter(CareerRole.slug == "machine-learning-engineer").first()
        assert ml_role is not None

        ml_switch = RoadmapSwitchRequest(profile_id=profile.id, role_id=ml_role.id)
        ml_roadmap = switch_career_roadmap(ml_switch, db)
        assert ml_roadmap.role_id == ml_role.id
        assert ml_roadmap.role_title == "Machine Learning Engineer"
        ml_skill_titles = [t.title for t in ml_roadmap.tasks]
        assert len(ml_skill_titles) > 0

        # Scenario 2: Switch to Business Analyst and verify business skills are completely different
        ba_role = db.query(CareerRole).filter(CareerRole.slug == "business-analyst").first()
        assert ba_role is not None

        ba_switch = RoadmapSwitchRequest(profile_id=profile.id, role_id=ba_role.id)
        ba_roadmap = switch_career_roadmap(ba_switch, db)
        assert ba_roadmap.role_id == ba_role.id
        assert ba_roadmap.role_title == "Business Analyst"
        ba_skill_titles = [t.title for t in ba_roadmap.tasks]
        assert ba_skill_titles != ml_skill_titles
        assert ba_roadmap.id != ml_roadmap.id

        # Scenario 3: Switch to Software Developer and verify coding skills
        sde_role = db.query(CareerRole).filter(CareerRole.slug == "software-development-engineer").first()
        assert sde_role is not None

        sde_switch = RoadmapSwitchRequest(profile_id=profile.id, role_id=sde_role.id)
        sde_roadmap = switch_career_roadmap(sde_switch, db)
        assert sde_roadmap.role_id == sde_role.id
        assert sde_roadmap.role_title in ["Software Development Engineer", "Software Engineer"]
        sde_skill_titles = [t.title for t in sde_roadmap.tasks]
        assert sde_skill_titles != ml_skill_titles
        assert sde_skill_titles != ba_skill_titles
        assert sde_roadmap.id != ml_roadmap.id
        assert sde_roadmap.id != ba_roadmap.id

        # Scenario 4: Complete a skill on Software Developer, then switch back to ML, then back to SDE
        sde_task_0 = sde_roadmap.tasks[0]
        update_task(sde_task_0.id, TaskUpdate(is_completed=True), db=db)

        # Switch to ML Engineer
        ml_again = switch_career_roadmap(RoadmapSwitchRequest(profile_id=profile.id, role_id=ml_role.id), db)
        assert ml_again.id == ml_roadmap.id

        # Switch back to SDE
        sde_again = switch_career_roadmap(RoadmapSwitchRequest(profile_id=profile.id, role_id=sde_role.id), db)
        assert sde_again.id == sde_roadmap.id
        # Verify completed skill progress is preserved!
        restored_sde_task = next(t for t in sde_again.tasks if t.id == sde_task_0.id)
        assert restored_sde_task.is_completed is True
        assert sde_again.completed_tasks_count >= 1

        # Scenario 5: Persistence - Query by role returns the exact saved roadmap
        persisted = get_roadmap_by_role(role_id=sde_role.id, profile_id=profile.id, db=db)
        assert persisted.id == sde_roadmap.id
        assert persisted.role_id == sde_role.id

        # Scenario 6: Active position advances when skill is completed
        # Before completion of task 1, first incomplete task was task 1
        sde_task_1 = sde_again.tasks[1]
        assert sde_task_1.is_completed is False
        update_task(sde_task_1.id, TaskUpdate(is_completed=True), db=db)
        sde_refreshed = switch_career_roadmap(RoadmapSwitchRequest(profile_id=profile.id, role_id=sde_role.id), db)
        assert sde_refreshed.tasks[1].is_completed is True
        # Avatar now targets task 2
        next_pending = next(t for t in sde_refreshed.tasks if not t.is_completed)
        assert next_pending.id != sde_task_0.id
        assert next_pending.id != sde_task_1.id

        # Scenario 7: Rapid switching handles multiple calls cleanly
        roles_to_cycle = [ml_role.id, ba_role.id, sde_role.id, ml_role.id]
        for rid in roles_to_cycle:
            res = switch_career_roadmap(RoadmapSwitchRequest(profile_id=profile.id, role_id=rid), db)
            assert res.role_id == rid

    finally:
        db.close()

