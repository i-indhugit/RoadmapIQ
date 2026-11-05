from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, CareerRole
from app.schemas import ProjectOut

router = APIRouter(prefix="/projects", tags=["Project Recommendations"])


@router.get("", response_model=List[ProjectOut])
def get_projects(
    role_id: Optional[int] = None,
    role_slug: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch curated portfolio project recommendations.
    Filters by career role or difficulty level.
    """
    query = db.query(Project)

    if role_id:
        query = query.filter(Project.role_id == role_id)
    elif role_slug:
        role = db.query(CareerRole).filter(CareerRole.slug == role_slug).first()
        if role:
            query = query.filter(Project.role_id == role.id)

    if difficulty and difficulty != "all":
        query = query.filter(Project.difficulty == difficulty)

    projects = query.all()
    # If no role-specific project found, return general project recommendations
    if not projects and (role_id or role_slug):
        projects = db.query(Project).all()

    return projects


@router.get("/{project_id_or_slug}", response_model=ProjectOut)
def get_project_detail(project_id_or_slug: str, db: Session = Depends(get_db)):
    """Fetch details and evaluation checklist for a specific portfolio project."""
    if project_id_or_slug.isdigit():
        p = db.query(Project).filter(Project.id == int(project_id_or_slug)).first()
    else:
        p = db.query(Project).filter(Project.slug == project_id_or_slug).first()

    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    return p
