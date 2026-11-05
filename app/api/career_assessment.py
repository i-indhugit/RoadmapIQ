from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random

from app.database import get_db
from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    StudentProfile,
    CareerAssessmentQuestion,
    CareerAssessmentAttempt,
    CareerAssessmentResult,
    CareerSkillGapReport,
    Roadmap,
)
from app.schemas import (
    CareerOverviewOut,
    CareerAssessmentQuestionStudentOut,
    StartAssessmentRequest,
    StartAssessmentResponse,
    SaveAssessmentAnswersRequest,
    SubmitAssessmentRequest,
    AssessmentResultOut,
    SkillGapReportOut,
    GenerateRoadmapFromAssessmentRequest,
    AssessmentAttemptSummaryOut,
    RoadmapOut,
)
from app.engine.career_assessment_engine import (
    evaluate_career_assessment,
    generate_personalized_roadmap_from_assessment,
)
from app.api.roadmaps import format_roadmap_out

router = APIRouter(prefix="", tags=["Career-Based Skill Assessment"])


def _resolve_career_role(identifier: str, db: Session) -> CareerRole:
    """Helper to resolve CareerRole by numeric ID or slug."""
    if identifier.isdigit():
        role = db.query(CareerRole).filter(CareerRole.id == int(identifier)).first()
    else:
        role = db.query(CareerRole).filter(CareerRole.slug == identifier).first()
        if not role and identifier == "software-engineer":
            role = db.query(CareerRole).filter(CareerRole.slug == "software-development-engineer").first()
    
    if not role:
        raise HTTPException(status_code=404, detail=f"Career '{identifier}' not found")
    return role


def _resolve_student_profile(profile_id: Optional[int], db: Session) -> StudentProfile:
    """Helper to resolve StudentProfile."""
    if profile_id:
        profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    else:
        profile = db.query(StudentProfile).order_by(StudentProfile.updated_at.desc()).first()

    if not profile:
        # Create a default guest student profile
        profile = StudentProfile(
            display_name="Engineer Candidate",
            education_level="Undergraduate - Final Year",
            educational_field="Engineering / Technology",
            degree_specialization="Computer Science",
            xp=100,
            streak_days=1
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# -------------------------------------------------------------
# Career Selection & Overview Endpoints
# -------------------------------------------------------------
@router.get("/careers", response_model=List[CareerOverviewOut])
def list_careers(db: Session = Depends(get_db)):
    """STEP 1: List all available career options with descriptions, core skills, tools, and competencies."""
    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    results = []
    for r in roles:
        skills = [
            {
                "id": req.skill.id,
                "name": req.skill.name,
                "category": req.skill.category,
                "required_proficiency": req.required_proficiency,
                "is_core": req.is_core,
            }
            for req in r.skill_requirements if req.skill
        ]
        results.append(CareerOverviewOut(
            id=r.id,
            slug=r.slug,
            title=r.title,
            category=r.category,
            description=r.description,
            short_summary=r.short_summary,
            market_demand=r.market_demand,
            average_salary_range=r.average_salary_range,
            icon=r.icon or "Briefcase",
            tools_and_technologies=r.tools_and_technologies or [],
            core_competencies=r.core_competencies or [],
            assessment_duration_mins=r.assessment_duration_mins or 30,
            assessment_question_count=r.assessment_question_count or 25,
            difficulty_distribution=r.difficulty_distribution or {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10},
            skills=skills
        ))
    return results


@router.get("/careers/{career_id_or_slug}", response_model=CareerOverviewOut)
def get_career_detail(career_id_or_slug: str, db: Session = Depends(get_db)):
    """Retrieve detailed information for a specific career track."""
    r = _resolve_career_role(career_id_or_slug, db)
    skills = [
        {
            "id": req.skill.id,
            "name": req.skill.name,
            "category": req.skill.category,
            "required_proficiency": req.required_proficiency,
            "is_core": req.is_core,
        }
        for req in r.skill_requirements if req.skill
    ]
    return CareerOverviewOut(
        id=r.id,
        slug=r.slug,
        title=r.title,
        category=r.category,
        description=r.description,
        short_summary=r.short_summary,
        market_demand=r.market_demand,
        average_salary_range=r.average_salary_range,
        icon=r.icon or "Briefcase",
        tools_and_technologies=r.tools_and_technologies or [],
        core_competencies=r.core_competencies or [],
        assessment_duration_mins=r.assessment_duration_mins or 30,
        assessment_question_count=r.assessment_question_count or 25,
        difficulty_distribution=r.difficulty_distribution or {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10},
        skills=skills
    )


@router.get("/careers/{career_id_or_slug}/overview", response_model=CareerOverviewOut)
def get_career_overview(career_id_or_slug: str, db: Session = Depends(get_db)):
    """STEP 2: Career Overview with technical requirements, tools, competencies, and assessment format."""
    return get_career_detail(career_id_or_slug, db)


@router.get("/careers/{career_id_or_slug}/skills")
def get_career_skills(career_id_or_slug: str, db: Session = Depends(get_db)):
    """Retrieve the core required skills and target competencies for a career."""
    r = _resolve_career_role(career_id_or_slug, db)
    return [
        {
            "id": req.skill.id,
            "name": req.skill.name,
            "category": req.skill.category,
            "required_proficiency": req.required_proficiency,
            "importance_weight": req.importance_weight,
            "is_core": req.is_core,
            "doc_url": req.skill.doc_url
        }
        for req in r.skill_requirements if req.skill
    ]


# -------------------------------------------------------------
# Career-Specific Assessment Testing Endpoints
# -------------------------------------------------------------
@router.post("/assessments/start", response_model=StartAssessmentResponse)
def start_career_assessment(req: StartAssessmentRequest, db: Session = Depends(get_db)):
    """
    STEP 3: Initiates a new career-specific assessment attempt.
    Returns 25-30 balanced questions specifically created for the selected career (hiding correct answers).
    """
    role = _resolve_career_role(req.career_id_or_slug, db)
    profile = _resolve_student_profile(req.profile_id, db)

    # Check for existing in-progress attempt for this career
    existing_attempt = (
        db.query(CareerAssessmentAttempt)
        .filter_by(profile_id=profile.id, role_id=role.id, status="in_progress")
        .order_by(CareerAssessmentAttempt.started_at.desc())
        .first()
    )

    if existing_attempt:
        attempt = existing_attempt
    else:
        attempt = CareerAssessmentAttempt(
            profile_id=profile.id,
            role_id=role.id,
            status="in_progress",
            answers={},
            review_flags=[],
            started_at=datetime.now(timezone.utc),
            time_spent_secs=0
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    # Fetch role questions
    questions = (
        db.query(CareerAssessmentQuestion)
        .filter_by(role_id=role.id, is_active=True)
        .all()
    )

    if len(questions) == 0:
        from app.engine.domain_question_generator import generate_questions_for_role
        questions = generate_questions_for_role(role, db)

    # Filter by difficulty if specific requested
    target_difficulty = (req.difficulty or "adaptive").lower()
    if target_difficulty in ["fundamentals", "beginner"]:
        filtered = [q for q in questions if q.difficulty in ["fundamentals", "beginner"]]
        if len(filtered) >= 5:
            questions = filtered
    elif target_difficulty in ["intermediate"]:
        filtered = [q for q in questions if q.difficulty == "intermediate"]
        if len(filtered) >= 5:
            questions = filtered
    elif target_difficulty in ["advanced"]:
        filtered = [q for q in questions if q.difficulty in ["advanced", "practical"]]
        if len(filtered) >= 5:
            questions = filtered

    target_count = req.question_count or role.assessment_question_count or 25
    if len(questions) > target_count:
        questions = questions[:target_count]

    # Transform questions for student view (strip correct answers and explanations)
    student_questions = [
        CareerAssessmentQuestionStudentOut(
            id=q.id,
            category=q.category,
            question_type=q.question_type,
            difficulty=q.difficulty,
            question=q.question,
            code_snippet=q.code_snippet,
            options=q.options,
            marks=q.marks or 1
        )
        for q in questions
    ]

    return StartAssessmentResponse(
        attempt_id=attempt.id,
        role_id=role.id,
        role_slug=role.slug,
        role_title=role.title,
        duration_mins=req.duration_mins or role.assessment_duration_mins or 30,
        total_questions=len(student_questions),
        questions=student_questions,
        saved_answers=attempt.answers or {},
        review_flags=attempt.review_flags or [],
        started_at=attempt.started_at
    )


@router.get("/assessments/{attempt_id}", response_model=StartAssessmentResponse)
def get_assessment_attempt(attempt_id: int, db: Session = Depends(get_db)):
    """Retrieve an existing assessment attempt with its current saved answers and review flags."""
    attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found")

    role = db.query(CareerRole).filter(CareerRole.id == attempt.role_id).first()
    questions = db.query(CareerAssessmentQuestion).filter_by(role_id=role.id, is_active=True).all()

    student_questions = [
        CareerAssessmentQuestionStudentOut(
            id=q.id,
            category=q.category,
            question_type=q.question_type,
            difficulty=q.difficulty,
            question=q.question,
            code_snippet=q.code_snippet,
            options=q.options,
            marks=q.marks or 1
        )
        for q in questions
    ]

    return StartAssessmentResponse(
        attempt_id=attempt.id,
        role_id=role.id,
        role_slug=role.slug,
        role_title=role.title,
        duration_mins=role.assessment_duration_mins or 30,
        total_questions=len(student_questions),
        questions=student_questions,
        saved_answers=attempt.answers or {},
        review_flags=attempt.review_flags or [],
        started_at=attempt.started_at
    )


@router.post("/assessments/{attempt_id}/answers")
def save_assessment_answers(attempt_id: int, req: SaveAssessmentAnswersRequest, db: Session = Depends(get_db)):
    """Autosave candidate answers and marked review flags during the assessment."""
    attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found")

    attempt.answers = req.answers
    attempt.review_flags = req.review_flags
    if req.time_spent_secs is not None:
        attempt.time_spent_secs = req.time_spent_secs
    db.commit()
    return {"status": "saved", "saved_count": len(req.answers)}


@router.post("/assessments/{attempt_id}/submit", response_model=AssessmentResultOut)
def submit_career_assessment(attempt_id: int, req: SubmitAssessmentRequest, db: Session = Depends(get_db)):
    """
    STEP 4 & 5: Submits the assessment attempt.
    Evaluates answers, computes category and difficulty scores, determines proficiency levels,
    generates the skill gap analysis, and records verified XP.
    """
    attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found")

    role = db.query(CareerRole).filter(CareerRole.id == attempt.role_id).first()
    result, _ = evaluate_career_assessment(
        db=db,
        attempt=attempt,
        user_answers=req.answers,
        time_spent_secs=req.time_spent_secs
    )

    # Automatic Calendar Activity Logging
    try:
        from app.api.activities import log_student_activity_internal
        dur_mins = max(5, int((req.time_spent_secs or 1800) / 60))
        log_student_activity_internal(
            db=db,
            profile_id=attempt.profile_id,
            activity_type="career_assessment",
            category="assessment",
            title=f"Assessment: {role.title}",
            career_role_id=role.id,
            career_title=role.title,
            score=result.score_percentage,
            score_total=100.0,
            hours_spent=round(dur_mins / 60.0, 2),
            duration_minutes=dur_mins,
            xp_reward=75,
            reference_type="assessment",
            reference_id=str(attempt.id),
            action_url=f"/assess?attempt_id={attempt.id}",
            idempotency_key=f"assessment_{attempt.id}_evaluated",
            extra_metadata={
                "correct_count": result.correct_count,
                "total_questions": result.total_questions,
                "proficiency_level": result.proficiency_level,
            }
        )
    except Exception:
        pass

    return AssessmentResultOut(
        attempt_id=attempt.id,
        role_id=role.id,
        role_title=role.title,
        total_questions=result.total_questions,
        answered_count=result.answered_count,
        correct_count=result.correct_count,
        incorrect_count=result.incorrect_count,
        unanswered_count=result.unanswered_count,
        total_marks_earned=result.total_marks_earned,
        total_possible_marks=result.total_possible_marks,
        score_percentage=result.score_percentage,
        proficiency_level=result.proficiency_level,
        category_scores=result.category_scores,
        difficulty_scores=result.difficulty_scores,
        question_details=result.question_details,
        evaluated_at=result.evaluated_at
    )


@router.get("/assessments/{attempt_id}/results", response_model=AssessmentResultOut)
def get_assessment_results(attempt_id: int, db: Session = Depends(get_db)):
    """Retrieve evaluated results and question explanations for a submitted assessment attempt."""
    result = db.query(CareerAssessmentResult).filter_by(attempt_id=attempt_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Assessment results not found for this attempt")

    role = db.query(CareerRole).filter(CareerRole.id == result.role_id).first()

    return AssessmentResultOut(
        attempt_id=result.attempt_id,
        role_id=role.id,
        role_title=role.title,
        total_questions=result.total_questions,
        answered_count=result.answered_count,
        correct_count=result.correct_count,
        incorrect_count=result.incorrect_count,
        unanswered_count=result.unanswered_count,
        total_marks_earned=result.total_marks_earned,
        total_possible_marks=result.total_possible_marks,
        score_percentage=result.score_percentage,
        proficiency_level=result.proficiency_level,
        category_scores=result.category_scores,
        difficulty_scores=result.difficulty_scores,
        question_details=result.question_details,
        evaluated_at=result.evaluated_at
    )


@router.get("/assessments/{attempt_id}/skill-analysis", response_model=SkillGapReportOut)
def get_assessment_skill_analysis(attempt_id: int, db: Session = Depends(get_db)):
    """STEP 7 & 8: Retrieve comprehensive Skill Gap Analysis and objective Career Readiness Score."""
    report = db.query(CareerSkillGapReport).filter_by(attempt_id=attempt_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Skill gap analysis report not found for this attempt")

    role = db.query(CareerRole).filter(CareerRole.id == report.role_id).first()

    return SkillGapReportOut(
        attempt_id=report.attempt_id,
        role_id=role.id,
        role_title=role.title,
        readiness_score=report.readiness_score,
        skills_table=report.skills_table,
        strong_skills=report.strong_skills or [],
        needs_improvement_skills=report.needs_improvement_skills or [],
        missing_skills=report.missing_skills or [],
        critical_gaps=report.critical_gaps or [],
        recommended_priorities=report.recommended_priorities or [],
        ai_gap_explanation=report.ai_gap_explanation,
        ai_learning_topics=report.ai_learning_topics or [],
        created_at=report.created_at
    )


@router.post("/roadmaps/generate-from-assessment", response_model=RoadmapOut)
def create_roadmap_from_assessment(req: GenerateRoadmapFromAssessmentRequest, db: Session = Depends(get_db)):
    """
    STEP 9: Automatically generate a personalized learning roadmap based on assessment results.
    Foundational gaps in OOP/DSA are prioritized early, while strong skills skip beginner repetition.
    """
    roadmap = generate_personalized_roadmap_from_assessment(
        db=db,
        attempt_id=req.attempt_id,
        weekly_hours=req.weekly_hours,
        target_duration_weeks=req.duration_weeks
    )

    return format_roadmap_out(roadmap, db)


@router.get("/students/{profile_id}/assessment-history", response_model=List[AssessmentAttemptSummaryOut])
def get_student_assessment_history(profile_id: int, db: Session = Depends(get_db)):
    """Retrieve history of all career skill assessment attempts for a student profile."""
    attempts = (
        db.query(CareerAssessmentAttempt)
        .filter_by(profile_id=profile_id)
        .order_by(CareerAssessmentAttempt.started_at.desc())
        .all()
    )

    results = []
    for a in attempts:
        role = db.query(CareerRole).filter(CareerRole.id == a.role_id).first()
        res = a.result
        results.append(AssessmentAttemptSummaryOut(
            id=a.id,
            role_id=a.role_id,
            role_title=role.title if role else "Career Track",
            status=a.status,
            score_percentage=res.score_percentage if res else None,
            proficiency_level=res.proficiency_level if res else None,
            started_at=a.started_at,
            completed_at=a.completed_at,
            time_spent_secs=a.time_spent_secs or 0
        ))
    return results


@router.post("/assessments/reassess", response_model=StartAssessmentResponse)
def reassess_career_role(req: StartAssessmentRequest, db: Session = Depends(get_db)):
    """
    STEP 3B: Initiates a fresh assessment attempt for a previously assessed career role,
    enabling students to measure skill growth and progress over time.
    """
    role = _resolve_career_role(req.career_id_or_slug, db)
    profile = _resolve_student_profile(req.profile_id, db)

    # Always create a new attempt
    attempt = CareerAssessmentAttempt(
        profile_id=profile.id,
        role_id=role.id,
        status="in_progress",
        answers={},
        review_flags=[],
        started_at=datetime.now(timezone.utc),
        time_spent_secs=0
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    questions = db.query(CareerAssessmentQuestion).filter_by(role_id=role.id, is_active=True).all()
    if len(questions) == 0:
        from app.engine.domain_question_generator import generate_questions_for_role
        questions = generate_questions_for_role(role, db)

    target_count = req.question_count or role.assessment_question_count or 25
    if len(questions) > target_count:
        questions = questions[:target_count]

    student_questions = [
        CareerAssessmentQuestionStudentOut(
            id=q.id,
            category=q.category,
            question_type=q.question_type,
            difficulty=q.difficulty,
            question=q.question,
            code_snippet=q.code_snippet,
            options=q.options,
            marks=q.marks or 1
        )
        for q in questions
    ]

    return StartAssessmentResponse(
        attempt_id=attempt.id,
        role_id=role.id,
        role_slug=role.slug,
        role_title=role.title,
        duration_mins=req.duration_mins or role.assessment_duration_mins or 30,
        total_questions=len(student_questions),
        questions=student_questions,
        saved_answers={},
        review_flags=[],
        started_at=attempt.started_at
    )


@router.get("/assessments/{attempt_id}/compare/{previous_attempt_id}")
def compare_assessment_attempts(attempt_id: int, previous_attempt_id: int, db: Session = Depends(get_db)):
    """
    Compare latest assessment attempt against a previous attempt side-by-side.
    Returns score delta, readiness delta, improved skills, remaining gaps, and new weaknesses.
    """
    curr_attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == attempt_id).first()
    prev_attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == previous_attempt_id).first()

    if not curr_attempt or not prev_attempt:
        raise HTTPException(status_code=404, detail="One or both assessment attempts not found.")

    curr_res = curr_attempt.result
    prev_res = prev_attempt.result
    curr_gap = curr_attempt.gap_report
    prev_gap = prev_attempt.gap_report

    if not curr_res or not prev_res:
        raise HTTPException(status_code=400, detail="Both assessment attempts must be submitted and evaluated for comparison.")

    score_delta = round(curr_res.score_percentage - prev_res.score_percentage, 1)
    readiness_delta = round((curr_gap.readiness_score if curr_gap else 0.0) - (prev_gap.readiness_score if prev_gap else 0.0), 1)

    # Compare skill category scores
    improved_skills = []
    remaining_gaps = []
    new_weaknesses = []

    curr_cats = curr_res.category_scores or {}
    prev_cats = prev_res.category_scores or {}

    for cat_name, curr_stat in curr_cats.items():
        prev_stat = prev_cats.get(cat_name, {})
        curr_pct = curr_stat.get("percentage", 0)
        prev_pct = prev_stat.get("percentage", 0)

        delta = round(curr_pct - prev_pct, 1)
        if delta > 0:
            improved_skills.append({
                "skill": cat_name,
                "previous_score": prev_pct,
                "current_score": curr_pct,
                "delta": f"+{delta}%"
            })
        elif curr_pct < 60:
            remaining_gaps.append({
                "skill": cat_name,
                "previous_score": prev_pct,
                "current_score": curr_pct,
                "delta": f"{delta}%"
            })
        elif delta < 0:
            new_weaknesses.append({
                "skill": cat_name,
                "previous_score": prev_pct,
                "current_score": curr_pct,
                "delta": f"{delta}%"
            })

    summary = (
        f"Overall assessment score shifted from {prev_res.score_percentage}% to {curr_res.score_percentage}% ({'+' if score_delta>=0 else ''}{score_delta}%). "
        f"You demonstrated measurable improvement in {len(improved_skills)} skill areas with {len(remaining_gaps)} remaining priority gaps."
    )

    return {
        "current_attempt_id": curr_attempt.id,
        "previous_attempt_id": prev_attempt.id,
        "role_id": curr_attempt.role_id,
        "role_title": curr_attempt.career_role.title if curr_attempt.career_role else "Career Track",
        "initial_score": prev_res.score_percentage,
        "latest_score": curr_res.score_percentage,
        "score_delta": score_delta,
        "initial_readiness": prev_gap.readiness_score if prev_gap else 0.0,
        "latest_readiness": curr_gap.readiness_score if curr_gap else 0.0,
        "readiness_delta": readiness_delta,
        "improved_skills": improved_skills,
        "remaining_gaps": remaining_gaps,
        "new_weaknesses": new_weaknesses,
        "summary": summary
    }


# Backwards compatible function aliases for audit & tests
get_all_careers = list_careers
save_answers = save_assessment_answers
submit_assessment = submit_career_assessment
get_skill_analysis = get_assessment_skill_analysis
compare_reassessment_attempts = compare_assessment_attempts

