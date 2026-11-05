from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewQuestion
from app.schemas import (
    InterviewQuestionOut,
    InterviewFeedbackRequest,
    InterviewFeedbackResponse
)
from app.engine.ai_service import evaluate_interview_answer

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])


class QuestionToggleUpdate(BaseModel):
    is_completed: Optional[bool] = None
    is_bookmarked: Optional[bool] = None


@router.get("/questions", response_model=List[InterviewQuestionOut])
def get_interview_questions(
    category: Optional[str] = None,
    role_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch placement interview questions across categories:
    DSA, Core CS, Technical, Aptitude, HR/Behavioral.
    """
    query = db.query(InterviewQuestion)

    if category and category != "all":
        query = query.filter(InterviewQuestion.category == category)
    if role_id:
        query = query.filter((InterviewQuestion.role_id == role_id) | (InterviewQuestion.role_id == None))
    if difficulty and difficulty != "all":
        query = query.filter(InterviewQuestion.difficulty == difficulty)

    return query.all()


@router.patch("/questions/{question_id}", response_model=InterviewQuestionOut)
def update_question_status(
    question_id: int,
    update_in: QuestionToggleUpdate,
    db: Session = Depends(get_db)
):
    """Toggle completed or bookmarked status for an interview question."""
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Interview question not found")

    if update_in.is_completed is not None:
        q.is_completed = update_in.is_completed
    if update_in.is_bookmarked is not None:
        q.is_bookmarked = update_in.is_bookmarked

    db.commit()
    db.refresh(q)
    return q


@router.post("/feedback", response_model=InterviewFeedbackResponse)
def get_mock_interview_feedback(
    req: InterviewFeedbackRequest
):
    """
    Evaluates student's technical or HR interview response.
    Returns rubric score, strengths, areas of improvement, and follow-up questions.
    """
    return evaluate_interview_answer(req)
