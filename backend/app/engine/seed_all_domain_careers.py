"""
Seed all 252 careers across all 18 domains into the database, preserving existing profiles.
"""
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import CareerRole, Skill, RoleSkillRequirement, LearningResource
from app.engine.all_domain_careers_data import ALL_DOMAIN_CAREERS
from app.engine.free_learning_resources_data import VERIFIED_FREE_RESOURCES

logger = logging.getLogger("roadmapiq.seed_all_domain")

def seed_all_domain_careers(db: Session):
    existing_roles = {r.slug: r for r in db.query(CareerRole).all()}
    if len(existing_roles) >= len(ALL_DOMAIN_CAREERS):
        return  # Already fully seeded, return immediately
    
    logger.info(f"Seeding {len(ALL_DOMAIN_CAREERS)} career roles across all 18 domains...")
    seeded_roles_count = 0
    updated_roles_count = 0
    
    for c_data in ALL_DOMAIN_CAREERS:
        existing = existing_roles.get(c_data["slug"])
        if existing:
            # Update newly added fields
            existing.domain = c_data["domain"]
            existing.subdomain = c_data["subdomain"]
            existing.required_education = c_data["required_education"]
            existing.eligibility_requirements = c_data["eligibility_requirements"]
            existing.optional_qualifications = c_data["optional_qualifications"]
            existing.tools_and_technologies = c_data["tools_and_technologies"]
            existing.core_competencies = c_data["core_competencies"]
            existing.daily_responsibilities = c_data["daily_responsibilities"]
            existing.career_progression = c_data["career_progression"]
            existing.is_regulated_profession = c_data["is_regulated_profession"]
            existing.regulatory_disclaimer = c_data["regulatory_disclaimer"]
            existing.market_demand = c_data["market_demand"]
            existing.average_salary_range = c_data["average_salary_range"]
            existing.icon = c_data["icon"]
            existing.short_summary = c_data["short_summary"]
            existing.description = c_data["description"]
            existing.assessment_duration_mins = c_data.get("assessment_duration_mins", 30)
            existing.assessment_question_count = c_data.get("assessment_question_count", 25)
            existing.difficulty_distribution = c_data.get("difficulty_distribution", {})
            updated_roles_count += 1
        else:
            new_role = CareerRole(
                slug=c_data["slug"],
                title=c_data["title"],
                category=c_data["category"],
                domain=c_data["domain"],
                subdomain=c_data["subdomain"],
                description=c_data["description"],
                short_summary=c_data["short_summary"],
                required_education=c_data["required_education"],
                eligibility_requirements=c_data["eligibility_requirements"],
                optional_qualifications=c_data["optional_qualifications"],
                tools_and_technologies=c_data["tools_and_technologies"],
                core_competencies=c_data["core_competencies"],
                daily_responsibilities=c_data["daily_responsibilities"],
                career_progression=c_data["career_progression"],
                is_regulated_profession=c_data["is_regulated_profession"],
                regulatory_disclaimer=c_data["regulatory_disclaimer"],
                market_demand=c_data["market_demand"],
                average_salary_range=c_data["average_salary_range"],
                icon=c_data["icon"],
                is_active=True,
                assessment_duration_mins=c_data.get("assessment_duration_mins", 30),
                assessment_question_count=c_data.get("assessment_question_count", 25),
                difficulty_distribution=c_data.get("difficulty_distribution", {})
            )
            db.add(new_role)
            seeded_roles_count += 1
            
    db.commit()
    logger.info(f"Career roles sync complete: {seeded_roles_count} new seeded, {updated_roles_count} updated.")

if __name__ == "__main__":
    from app.main import migrate_sqlite_columns
    migrate_sqlite_columns()
    db = SessionLocal()
    try:
        seed_all_domain_careers(db)
        print("Database sync completed successfully.")
    finally:
        db.close()
