import pytest
from app.database import SessionLocal
from app.models import CareerRole, StudentProfile
from app.schemas import ProfileCreate, RoadmapGenerateRequest
from app.api.profile import create_profile
from app.api.roadmaps import generate_roadmap

def test_all_eight_careers_generate_roadmaps_and_match_themes():
    db = SessionLocal()
    try:
        # Expected 8 career slugs
        expected_slugs = [
            "machine-learning-engineer",
            "business-analyst",
            "software-development-engineer",
            "digital-marketing-specialist",
            "cybersecurity-analyst",
            "financial-analyst",
            "ui-ux-designer",
            "hr-specialist"
        ]

        roles = db.query(CareerRole).filter(CareerRole.slug.in_(expected_slugs)).all()
        found_slugs = [r.slug for r in roles]
        assert len(found_slugs) == 8, f"Missing some expected career roles: {set(expected_slugs) - set(found_slugs)}"

        for role in roles:
            prof_payload = ProfileCreate(
                display_name=f"Tester for {role.title}",
                education_level="Undergraduate - Final Year",
                educational_field="Engineering / Technology",
                degree_specialization="B.Tech Computer Science",
                current_status="student",
                current_experience_level="Beginner",
                target_role_id=role.id,
                weekly_study_hours=15,
                target_duration_weeks=10,
                preferred_learning_format="mixed",
                learning_budget="free_only",
                preferred_language="en",
                skills_assessment={},
                avatar_style="ai_robot" if "machine" in role.slug else "code_knight"
            )
            prof_out = create_profile(prof_payload, db)
            assert prof_out.id is not None
            assert prof_out.target_role_id == role.id

            # Generate roadmap via direct endpoint function
            gen_payload = RoadmapGenerateRequest(
                profile_id=prof_out.id,
                role_id=role.id,
                weekly_hours=15,
                target_duration_weeks=10,
                preferred_format="mixed",
                skills_assessment={}
            )
            roadmap_out = generate_roadmap(gen_payload, db)

            assert roadmap_out.role_id == role.id
            assert roadmap_out.role_title == role.title
            assert len(roadmap_out.tasks) > 0, f"Expected tasks for {role.title}"
            assert roadmap_out.target_duration_weeks == 10

            # Verify task milestones have required attributes
            for task in roadmap_out.tasks:
                assert task.title is not None
                assert task.week_number >= 1
                assert task.estimated_hours > 0
                assert task.phase_number in [1, 2, 3, 4, 5]

    finally:
        db.close()
