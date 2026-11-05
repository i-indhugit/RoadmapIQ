"""
Career Discovery Router for RoadmapIQ.
Enables students to discover their ideal career path across all 18 domains
via a structured, psychometric and aptitude-based questionnaire.
"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import StudentProfile, CareerRole, CareerDiscoveryResponse
from app.engine.career_discovery_engine import DISCOVERY_QUESTIONS, evaluate_career_discovery

router = APIRouter(prefix="/careers", tags=["Career Discovery"])

class DiscoverySubmitRequest(BaseModel):
    profile_id: Optional[int] = None
    answers: Dict[str, str]

class CareerRecommendationItem(BaseModel):
    slug: str
    title: str
    domain: str
    subdomain: Optional[str] = None
    match_percentage: float
    match_reason: str
    educational_alignment: str
    key_competencies: List[str]
    tools: List[str]
    average_salary_range: str
    market_demand: str
    icon: str
    is_regulated_profession: bool
    regulatory_disclaimer: Optional[str] = None
    role_id: Optional[int] = None

class DiscoveryResponseOut(BaseModel):
    recommended_careers: List[CareerRecommendationItem]
    top_domain: str
    summary: str

@router.get("/discovery-questions")
@router.get("/questions")
def get_discovery_questions():
    """Fetch the structured career discovery questionnaire."""
    return {"questions": DISCOVERY_QUESTIONS}

@router.post("/discover", response_model=DiscoveryResponseOut)
@router.post("/recommend", response_model=DiscoveryResponseOut)
def discover_career_paths(req: DiscoverySubmitRequest, db: Session = Depends(get_db)):
    """
    Evaluate student answers and return personalized career recommendations
    across all 18 academic and professional domains.
    """
    if not req.answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questionnaire answers must not be empty."
        )

    scored_recommendations = evaluate_career_discovery(req.answers)
    
    # Enrich with database role IDs
    for item in scored_recommendations:
        db_role = db.query(CareerRole).filter(CareerRole.slug == item["slug"]).first()
        if db_role:
            item["role_id"] = db_role.id

    top_domain = scored_recommendations[0]["domain"] if scored_recommendations else "Technology and IT"
    summary = (
        f"Based on your profile evaluation, your highest affinity is in **{top_domain}**, "
        f"led by **{scored_recommendations[0]['title']}** with a **{scored_recommendations[0]['match_percentage']}%** match."
    )

    # Persist discovery response if profile_id provided
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
        if profile:
            discovery_record = CareerDiscoveryResponse(
                profile_id=profile.id,
                answers=req.answers,
                recommended_careers=scored_recommendations
            )
            db.add(discovery_record)
            db.commit()

    return DiscoveryResponseOut(
        recommended_careers=[CareerRecommendationItem(**r) for r in scored_recommendations],
        top_domain=top_domain,
        summary=summary
    )


# Backwards compatible alias
discover_careers = discover_career_paths
DiscoveryAnswerRequest = DiscoverySubmitRequest


