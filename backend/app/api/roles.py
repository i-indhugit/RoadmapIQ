from typing import List, Dict, Set
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    CareerRole,
    RoleSkillRequirement,
    Skill,
    SkillPrerequisite,
    Project,
    InterviewQuestion,
    StudentProfile,
)
from app.schemas import (
    CareerRoleSummary,
    CareerRoleDetail,
    RoleRequirementOut,
    CareerComparisonRequest,
    CareerComparisonResponse,
    CareerComparisonItem,
)
from app.engine.skill_gap_analyzer import calculate_readiness_score

router = APIRouter(prefix="/roles", tags=["Career Roles"])


@router.get("", response_model=List[CareerRoleSummary])
def get_career_roles(db: Session = Depends(get_db)):
    """Fetch all available career paths."""
    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    return roles


@router.post("/compare", response_model=CareerComparisonResponse)
def compare_career_roles(req: CareerComparisonRequest, db: Session = Depends(get_db)):
    """
    Compare 2 to 3 career paths side-by-side.
    Calculates readiness coverage, shared requirements, unique domain skills,
    transferable strengths, and estimated learning hours.
    """
    if len(req.role_ids) < 2 or len(req.role_ids) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select between 2 and 3 career paths to compare."
        )

    # Resolve user skills if not explicitly provided
    student_skills = req.skills_assessment or {}
    if not student_skills:
        latest_profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()
        if latest_profile and latest_profile.skills_assessment:
            student_skills = latest_profile.skills_assessment

    compared_items: List[CareerComparisonItem] = []
    role_skill_sets: Dict[str, Set[str]] = {}
    all_role_skills_dict: Dict[int, List[RoleSkillRequirement]] = {}

    for r_id in req.role_ids:
        role = db.query(CareerRole).filter(CareerRole.id == r_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career role #{r_id} not found"
            )

        reqs = (
            db.query(RoleSkillRequirement, Skill)
            .join(Skill, RoleSkillRequirement.skill_id == Skill.id)
            .filter(RoleSkillRequirement.role_id == role.id)
            .all()
        )

        skill_names = [skill.name for req, skill in reqs]
        role_skill_sets[role.title] = set(skill_names)

        # Calculate readiness and effort
        role_requirements_list = [req for req, skill in reqs]
        readiness = calculate_readiness_score(role_requirements_list, student_skills)

        missing_count = 0
        total_hours = 0
        for req_obj, skill in reqs:
            curr_prof = student_skills.get(skill.slug, 0)
            if curr_prof == 0:
                missing_count += 1
            if curr_prof < req_obj.required_proficiency:
                gap = req_obj.required_proficiency - curr_prof
                # Estimate hours based on gap
                if gap >= 3:
                    total_hours += skill.estimated_hours_advanced
                elif gap == 2:
                    total_hours += skill.estimated_hours_intermediate
                else:
                    total_hours += skill.estimated_hours_beginner

        # Fetch projects for this role
        projects = db.query(Project.name).filter(Project.role_id == role.id).limit(3).all()
        proj_names = [p[0] for p in projects]

        compared_items.append(
            CareerComparisonItem(
                role_id=role.id,
                role_title=role.title,
                category=role.category,
                readiness_score=readiness,
                total_required_skills=len(reqs),
                missing_skills_count=missing_count,
                estimated_learning_hours=total_hours,
                market_demand=role.market_demand,
                salary_range=role.average_salary_range,
                required_skill_names=skill_names,
                typical_projects=proj_names
            )
        )

    # 1. Shared skills (intersection across all roles)
    sets_list = list(role_skill_sets.values())
    shared_skills = sorted(list(set.intersection(*sets_list))) if sets_list else []

    # 2. Unique skills per role
    unique_skills_by_role: Dict[str, List[str]] = {}
    for title, skills in role_skill_sets.items():
        other_skills = set.union(*[s for t, s in role_skill_sets.items() if t != title])
        unique_skills_by_role[title] = sorted(list(skills - other_skills))

    # 3. Transferable skills (skills student possesses >0 that apply to at least 2 roles)
    all_required_skills = db.query(Skill).all()
    skill_slug_to_name = {s.slug: s.name for s in all_required_skills}

    transferable: List[str] = []
    for slug, prof in student_skills.items():
        if prof > 0 and slug in skill_slug_to_name:
            s_name = skill_slug_to_name[slug]
            # Check how many compared roles require this skill
            matches = sum(1 for skills in role_skill_sets.values() if s_name in skills)
            if matches >= 2:
                transferable.append(s_name)

    # 4. Recommendation summary
    best_match = max(compared_items, key=lambda x: x.readiness_score)
    recommendation_summary = (
        f"Based on your current skills assessment, **{best_match.role_title}** has your highest baseline readiness at **{best_match.readiness_score}%**. "
        f"It requires approximately **{best_match.estimated_learning_hours} hours** to bridge your remaining skill gaps. "
        f"{f'You have {len(transferable)} transferable skills ({', '.join(transferable[:3])}) that accelerate your pivot.' if transferable else ''}"
    )

    return CareerComparisonResponse(
        compared_roles=compared_items,
        shared_skills=shared_skills,
        unique_skills_by_role=unique_skills_by_role,
        transferable_skills=sorted(transferable),
        recommendation_summary=recommendation_summary
    )


@router.get("/{role_id_or_slug}", response_model=CareerRoleDetail)
def get_career_role_detail(role_id_or_slug: str, db: Session = Depends(get_db)):
    """Fetch detailed curriculum requirements for a specific career role."""
    if role_id_or_slug.isdigit():
        role = db.query(CareerRole).filter(CareerRole.id == int(role_id_or_slug)).first()
    else:
        role = db.query(CareerRole).filter(CareerRole.slug == role_id_or_slug).first()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{role_id_or_slug}' not found"
        )

    # Fetch requirements and enrich with prerequisites and doc_url
    requirements_out: List[RoleRequirementOut] = []
    recommended_out: List[RoleRequirementOut] = []

    reqs = (
        db.query(RoleSkillRequirement, Skill)
        .join(Skill, RoleSkillRequirement.skill_id == Skill.id)
        .filter(RoleSkillRequirement.role_id == role.id)
        .all()
    )

    for req, skill in reqs:
        # Fetch prerequisites for this skill
        prereqs = (
            db.query(Skill.name)
            .join(SkillPrerequisite, SkillPrerequisite.prerequisite_skill_id == Skill.id)
            .filter(SkillPrerequisite.skill_id == skill.id)
            .all()
        )
        prereq_names = [p[0] for p in prereqs]

        req_item = RoleRequirementOut(
            skill_id=skill.id,
            skill_slug=skill.slug,
            skill_name=skill.name,
            category=skill.category,
            required_proficiency=req.required_proficiency,
            importance_weight=req.importance_weight,
            is_core=req.is_core,
            doc_url=skill.doc_url,
            prerequisites=prereq_names
        )

        if req.is_core:
            requirements_out.append(req_item)
        else:
            recommended_out.append(req_item)

    # Fetch associated projects
    projects = db.query(Project).filter(Project.role_id == role.id).all()
    suggested_projects = [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "problem_statement": p.problem_statement,
            "difficulty": p.difficulty,
            "skills_covered": p.skills_covered,
            "estimated_hours": p.estimated_hours,
            "suggested_tech_stack": p.suggested_tech_stack,
            "deliverables": p.deliverables or [],
            "portfolio_presentation_tips": p.portfolio_presentation_tips
        }
        for p in projects
    ]

    # Fetch interview categories
    interview_cats = (
        db.query(InterviewQuestion.category)
        .filter((InterviewQuestion.role_id == role.id) | (InterviewQuestion.role_id == None))
        .distinct()
        .all()
    )
    interview_topics = [c[0] for c in interview_cats] or ["DSA", "Case Study", "Technical", "HR/Behavioral"]

    return CareerRoleDetail(
        id=role.id,
        slug=role.slug,
        title=role.title,
        category=role.category,
        description=role.description,
        short_summary=role.short_summary,
        market_demand=role.market_demand,
        average_salary_range=role.average_salary_range,
        icon=role.icon,
        is_active=role.is_active,
        requirements=requirements_out,
        recommended_skills=recommended_out,
        suggested_projects=suggested_projects,
        interview_topics=interview_topics
    )


# Backwards compatible alias
compare_roles = compare_career_roles

