from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Skill, SkillPrerequisite
from app.schemas import SkillOut, SkillPrerequisiteOut

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=List[SkillOut])
def get_all_skills(db: Session = Depends(get_db)):
    """Fetch all skills in the system with their prerequisite relationships."""
    skills = db.query(Skill).all()
    results: List[SkillOut] = []

    for s in skills:
        prereqs = (
            db.query(Skill.name)
            .join(SkillPrerequisite, SkillPrerequisite.prerequisite_skill_id == Skill.id)
            .filter(SkillPrerequisite.skill_id == s.id)
            .all()
        )
        prereq_names = [p[0] for p in prereqs]

        results.append(
            SkillOut(
                id=s.id,
                slug=s.slug,
                name=s.name,
                category=s.category,
                description=s.description,
                doc_url=s.doc_url,
                estimated_hours_beginner=s.estimated_hours_beginner,
                estimated_hours_intermediate=s.estimated_hours_intermediate,
                estimated_hours_advanced=s.estimated_hours_advanced,
                prerequisites=prereq_names
            )
        )
    return results


@router.get("/prerequisites", response_model=List[SkillPrerequisiteOut])
def get_skill_prerequisites(db: Session = Depends(get_db)):
    """Fetch all prerequisite edges in the skill dependency graph."""
    edges = (
        db.query(SkillPrerequisite, Skill)
        .join(Skill, SkillPrerequisite.skill_id == Skill.id)
        .all()
    )
    
    results = []
    for sp, target_skill in edges:
        prereq_skill = db.query(Skill).filter(Skill.id == sp.prerequisite_skill_id).first()
        if prereq_skill:
            results.append(
                SkillPrerequisiteOut(
                    skill_slug=target_skill.slug,
                    skill_name=target_skill.name,
                    prerequisite_slug=prereq_skill.slug,
                    prerequisite_name=prereq_skill.name
                )
            )
    return results


@router.get("/{skill_id_or_slug}", response_model=SkillOut)
def get_skill_detail(skill_id_or_slug: str, db: Session = Depends(get_db)):
    """Fetch detail for a specific skill."""
    if skill_id_or_slug.isdigit():
        s = db.query(Skill).filter(Skill.id == int(skill_id_or_slug)).first()
    else:
        s = db.query(Skill).filter(Skill.slug == skill_id_or_slug).first()

    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{skill_id_or_slug}' not found"
        )

    prereqs = (
        db.query(Skill.name)
        .join(SkillPrerequisite, SkillPrerequisite.prerequisite_skill_id == Skill.id)
        .filter(SkillPrerequisite.skill_id == s.id)
        .all()
    )

    return SkillOut(
        id=s.id,
        slug=s.slug,
        name=s.name,
        category=s.category,
        description=s.description,
        doc_url=s.doc_url,
        estimated_hours_beginner=s.estimated_hours_beginner,
        estimated_hours_intermediate=s.estimated_hours_intermediate,
        estimated_hours_advanced=s.estimated_hours_advanced,
        prerequisites=[p[0] for p in prereqs]
    )

