from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import LearningResource, Skill, ResourceBookmark
from app.schemas import ResourceOut

router = APIRouter(prefix="/resources", tags=["Learning Resources"])


@router.get("", response_model=List[ResourceOut])
def get_learning_resources(
    skill_id: Optional[int] = None,
    skill_slug: Optional[str] = None,
    format: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    is_free: Optional[bool] = None,
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Search and filter verified free learning resources.
    Supports skill filtering, difficulty level, format, and text search.
    """
    query = db.query(LearningResource, Skill).join(Skill, LearningResource.skill_id == Skill.id)

    if skill_id:
        query = query.filter(LearningResource.skill_id == skill_id)
    if skill_slug:
        query = query.filter(Skill.slug == skill_slug)
    if format and format != "all":
        query = query.filter(LearningResource.format == format)
    if difficulty and difficulty != "all":
        query = query.filter(LearningResource.difficulty == difficulty)
    if is_free is not None:
        query = query.filter(LearningResource.is_free == is_free)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                LearningResource.title.ilike(search_pattern),
                LearningResource.description.ilike(search_pattern),
                LearningResource.provider.ilike(search_pattern),
                Skill.name.ilike(search_pattern)
            )
        )

    # Bookmarks for profile if provided
    bookmarked_ids = set()
    if profile_id:
        bookmarks = db.query(ResourceBookmark.resource_id).filter(
            ResourceBookmark.profile_id == profile_id
        ).all()
        bookmarked_ids = {b[0] for b in bookmarks}

    results = query.all()
    out = []
    for res, skill in results:
        out.append(
            ResourceOut(
                id=res.id,
                skill_id=res.skill_id,
                skill_slug=skill.slug,
                skill_name=skill.name,
                title=res.title,
                provider=res.provider,
                url=res.url,
                format=res.format,
                difficulty=res.difficulty,
                is_free=res.is_free,
                description=res.description,
                rating=res.rating or 4.8,
                is_bookmarked=(res.id in bookmarked_ids)
            )
        )
    return out


@router.post("/{resource_id}/bookmark")
def toggle_resource_bookmark(
    resource_id: int,
    profile_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Bookmark or unbookmark a learning resource for a student profile."""
    res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    existing = db.query(ResourceBookmark).filter(
        ResourceBookmark.resource_id == resource_id,
        ResourceBookmark.profile_id == profile_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"is_bookmarked": False, "message": "Bookmark removed"}
    else:
        new_bm = ResourceBookmark(profile_id=profile_id, resource_id=resource_id)
        db.add(new_bm)
        db.commit()
        return {"is_bookmarked": True, "message": "Resource bookmarked"}
