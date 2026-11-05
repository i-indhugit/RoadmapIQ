from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Skill, AssessmentQuiz, SkillAssessmentResult, StudentProfile
from app.schemas import (
    QuizQuestionOut,
    QuizSubmitRequest,
    QuizResultResponse,
)
from app.engine.gamification_engine import award_xp_transaction

router = APIRouter(prefix="/assessment", tags=["Skill Assessment"])


PROFICIENCY_MAP = {
    5: "Expert (Level 5)",
    4: "Advanced (Level 4)",
    3: "Intermediate (Level 3)",
    2: "Basic Working Knowledge (Level 2)",
    1: "Beginner (Level 1)",
    0: "Not Learned (Level 0)",
}


@router.get("/available-skills")
def get_assessable_skills(db: Session = Depends(get_db)):
    """Fetch all skills that currently offer interactive assessment quizzes."""
    skills = (
        db.query(Skill)
        .join(AssessmentQuiz, AssessmentQuiz.skill_id == Skill.id)
        .distinct()
        .all()
    )
    return [
        {
            "id": s.id,
            "slug": s.slug,
            "name": s.name,
            "category": s.category,
            "difficulty_level": s.difficulty_level,
            "question_count": len(s.quizzes)
        }
        for s in skills
    ]


@router.get("/quiz/{skill_id_or_slug}", response_model=List[QuizQuestionOut])
def get_skill_quiz(skill_id_or_slug: str, db: Session = Depends(get_db)):
    """
    Retrieve interactive assessment questions for a skill.
    Hides answers and explanations until submission.
    """
    if skill_id_or_slug.isdigit():
        skill = db.query(Skill).filter(Skill.id == int(skill_id_or_slug)).first()
    else:
        skill = db.query(Skill).filter(Skill.slug == skill_id_or_slug).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{skill_id_or_slug}' not found"
        )

    quizzes = db.query(AssessmentQuiz).filter(AssessmentQuiz.skill_id == skill.id).all()
    if not quizzes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No assessment quiz available for '{skill.name}' yet."
        )

    return [
        QuizQuestionOut(
            id=q.id,
            skill_id=q.skill_id,
            skill_name=skill.name,
            question=q.question,
            options=q.options,
            difficulty=q.difficulty
        )
        for q in quizzes
    ]


@router.post("/submit", response_model=QuizResultResponse)
def submit_skill_quiz(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    """
    Evaluates candidate answers, scores the quiz, updates verified proficiency level (0-5),
    and records the verified result in student profile.
    """
    skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    quizzes = db.query(AssessmentQuiz).filter(AssessmentQuiz.skill_id == skill.id).all()
    if not quizzes:
        raise HTTPException(status_code=400, detail="No quiz defined for this skill")

    total = len(quizzes)
    correct_count = 0
    explanations = []

    for q in quizzes:
        chosen_opt = req.answers.get(q.id)
        is_correct = (chosen_opt == q.correct_answer_index)
        if is_correct:
            correct_count += 1

        explanations.append({
            "question_id": q.id,
            "question": q.question,
            "user_choice": chosen_opt,
            "correct_choice": q.correct_answer_index,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    score_pct = round((correct_count / total * 100.0) if total > 0 else 0.0, 1)

    # Convert score percentage to 0-5 scale
    if score_pct >= 90:
        level = 5
    elif score_pct >= 75:
        level = 4
    elif score_pct >= 60:
        level = 3
    elif score_pct >= 40:
        level = 2
    elif score_pct >= 20:
        level = 1
    else:
        level = 0

    prof_label = PROFICIENCY_MAP.get(level, "Beginner")

    # Resolve student profile
    profile = None
    if req.profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
    if not profile:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if profile:
        # Record verified assessment result
        result_record = SkillAssessmentResult(
            profile_id=profile.id,
            skill_id=skill.id,
            score_percentage=score_pct,
            verified_proficiency=level,
            evidence_link=req.evidence_link,
            assessed_at=datetime.now(timezone.utc)
        )
        db.add(result_record)

        # Update profile's assessed_skills JSON
        assessed_dict = dict(profile.assessed_skills or {})
        assessed_dict[skill.slug] = {
            "level": level,
            "verified": True,
            "score_percentage": score_pct,
            "evidence_link": req.evidence_link,
            "assessed_at": datetime.now(timezone.utc).isoformat()
        }
        profile.assessed_skills = assessed_dict

        # Also update self-reported assessment if verified level is higher
        skills_assessment = dict(profile.skills_assessment or {})
        skills_assessment[skill.slug] = max(skills_assessment.get(skill.slug, 0), level)
        profile.skills_assessment = skills_assessment

        # Award verified XP for passing score (>= 50%)
        if score_pct >= 50:
            award_xp_transaction(
                db=db,
                profile=profile,
                amount=100,
                source_type="skill_assessment",
                source_id=skill.slug,
                description=f"Verified Competency: {skill.name} ({prof_label})"
            )

        db.commit()

    feedback = (
        f"You answered {correct_count} out of {total} questions correctly ({score_pct}%). "
        f"Your verified proficiency in {skill.name} has been updated to {prof_label}. "
        f"This verified assessment score will directly reflect in your Skill Gap Analysis and Roadmap."
    )

    return QuizResultResponse(
        skill_id=skill.id,
        skill_name=skill.name,
        total_questions=total,
        correct_count=correct_count,
        score_percentage=score_pct,
        assessed_proficiency_level=level,
        proficiency_label=prof_label,
        feedback=feedback,
        explanations=explanations
    )

