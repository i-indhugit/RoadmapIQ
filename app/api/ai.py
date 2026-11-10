from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    AIStatusResponse,
    AIExplainRequest,
    AIExplainResponse,
    AIRoadmapAdviceRequest,
    AIRoadmapAdviceResponse,
    ProjectMentorRequest,
    ProjectMentorResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    WeeklyPlannerAIRequest,
    WeeklyPlannerAIResponse,
    AIProjectRecommendationRequest,
    AIProjectRecommendationResponse,
    AIInterviewGenRequest,
    AIInterviewGenResponse,
    InterviewFeedbackRequest,
    InterviewFeedbackResponse,
    GeminiTestResponse,
    MilestoneTutorRequest,
    MilestoneTutorResponse,
)
from app.engine.gemini_service import (
    check_ai_status,
    test_gemini_connection,
    generate_roadmap_advice,
    explain_skill_gap,
    generate_weekly_learning_plan,
    generate_project_recommendations,
    generate_interview_questions,
    evaluate_interview_answer,
    generate_project_mentor,
    generate_milestone_tutor,
)
from app.engine.rag_retriever import process_rag_query

router = APIRouter(prefix="/ai", tags=["Google Gemini AI & RAG"])


@router.get("/status", response_model=AIStatusResponse)
def get_ai_status():
    """Returns availability of the Google Gemini API (Cloud) integration."""
    return check_ai_status()


@router.get("/test", response_model=GeminiTestResponse)
@router.post("/test", response_model=GeminiTestResponse)
def test_gemini_api():
    """Performs a live connectivity and inference test with Google Gemini API."""
    try:
        return test_gemini_connection()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.post("/roadmap-advice", response_model=AIRoadmapAdviceResponse)
def get_roadmap_advice(req: AIRoadmapAdviceRequest):
    """Generates personalized study pacing and bottleneck strategies for a student's roadmap using Gemini."""
    return generate_roadmap_advice(req)


@router.post("/skill-gap-explanation", response_model=AIExplainResponse)
def get_skill_gap_explanation(req: AIExplainRequest):
    """Explains why a skill is vital for the target job role and gives an actionable study path using Gemini."""
    return explain_skill_gap(req)


@router.post("/weekly-plan", response_model=WeeklyPlannerAIResponse)
def get_weekly_study_plan(req: WeeklyPlannerAIRequest):
    """Generates a structured weekly study schedule allocating available hours across days using Gemini."""
    return generate_weekly_learning_plan(req)


@router.post("/learning-assistant", response_model=RAGQueryResponse)
def ask_learning_assistant(req: RAGQueryRequest, db: Session = Depends(get_db)):
    """
    RAG-powered AI learning assistant grounded in verified curriculum documents.
    Retrieves grounded knowledge chunks from the centralized knowledge base and provides cited guidance.
    """
    from app.engine.rag_engine import VectorRetriever, RAGGroundedGenerator
    from app.models import CareerRole
    retriever = VectorRetriever(db)
    generator = RAGGroundedGenerator()

    resolved_domain = req.domain
    if req.target_role and not resolved_domain:
        matched_role = db.query(CareerRole).filter(CareerRole.title == req.target_role).first()
        if matched_role and matched_role.domain:
            resolved_domain = matched_role.domain

    retrieved = retriever.retrieve(
        query=req.query,
        career_domain=resolved_domain,
        career_role_title=req.target_role,
        category=req.category,
        country_jurisdiction=req.country_jurisdiction,
        top_k=req.top_k or 5,
        min_similarity=0.15,
    )

    if retrieved:
        ans, sources, is_grounded = generator.synthesize_answer(
            query=req.query,
            retrieved_items=retrieved,
            target_role=req.target_role,
            domain=resolved_domain,
        )
        return RAGQueryResponse(
            query=req.query,
            answer=ans,
            sources=sources,
            has_relevant_sources=len(sources) > 0,
            context_skills_identified=list({s.skill_name for s in sources if s.skill_name}),
            confidence_score=retrieved[0][0] if retrieved else 0.85,
            is_grounded_in_rag=is_grounded,
            domain_identified=resolved_domain,
        )

    return process_rag_query(
        db=db,
        query=req.query,
        target_role=req.target_role,
        preferred_format=req.preferred_format
    )


@router.post("/project-recommendations", response_model=AIProjectRecommendationResponse)
def get_project_recommendations(req: AIProjectRecommendationRequest):
    """Recommends beginner, intermediate, and advanced portfolio projects using Gemini."""
    return generate_project_recommendations(req)


@router.post("/project-mentor", response_model=ProjectMentorResponse)
def get_project_milestone_mentor(req: ProjectMentorRequest):
    """Provides architectural explanation, starter code, and testing strategies for a project milestone using Gemini."""
    return generate_project_mentor(req)


@router.post("/interview-questions", response_model=AIInterviewGenResponse)
def get_interview_questions(req: AIInterviewGenRequest):
    """Generates career-specific technical and scenario interview questions with model answers using Gemini."""
    return generate_interview_questions(req)


@router.post("/interview-feedback", response_model=InterviewFeedbackResponse)
def evaluate_interview_response(req: InterviewFeedbackRequest):
    """Evaluates student's technical interview answer with constructive rubric scoring using Gemini."""
    return evaluate_interview_answer(req)


@router.post("/milestone-tutor", response_model=MilestoneTutorResponse)
def get_milestone_ai_tutor(req: MilestoneTutorRequest, db: Session = Depends(get_db)):
    """
    Universal interactive AI Tutor for any milestone in any career domain.
    Provides concept explanations, revision notes, active-recall flashcards, practice problems, and diagnostic quizzes.
    Automatically logs student learning activity if profile_id is provided.
    """
    res = generate_milestone_tutor(req)

    # Ground with Centralized RAG Knowledge Base
    try:
        from app.engine.rag_engine import VectorRetriever
        retriever = VectorRetriever(db)
        retrieved = retriever.retrieve(
            query=f"{req.milestone_title} {req.query or ''}",
            career_domain=req.domain,
            career_role_title=req.role_title,
            top_k=4,
            min_similarity=0.15,
        )
        if retrieved:
            sources_out = []
            for score, ch in retrieved:
                sources_out.append(
                    RAGRetrievedSource(
                        title=ch.source_title,
                        provider=ch.provider,
                        url=ch.source_url,
                        format="documentation",
                        relevance_score=score,
                        skill_name=(ch.related_skills[0] if ch.related_skills else None),
                        difficulty=ch.difficulty,
                        domain=ch.career_domain,
                        category=ch.category,
                        country_jurisdiction=ch.country_jurisdiction,
                        section_reference=ch.section_reference,
                        snippet=ch.content[:200] + "...",
                        chunk_id=ch.id,
                    )
                )
            res.sources = sources_out
            res.is_grounded_in_rag = True
    except Exception:
        pass

    if req.profile_id:
        try:
            from datetime import date
            from app.api.activities import log_student_activity_internal
            today_iso = date.today().isoformat()
            log_student_activity_internal(
                db=db,
                profile_id=req.profile_id,
                activity_type=f"ai_tutor_{req.action}",
                category="ai_learning",
                title=f"AI Tutor: {req.milestone_title} ({req.action.capitalize()})",
                xp_reward=25,
                hours_spent=0.25,
                duration_minutes=15,
                idempotency_key=f"ai_tutor_{req.profile_id}_{req.milestone_title}_{req.action}_{today_iso}",
                extra_metadata={"role_title": req.role_title, "action": req.action, "domain": req.domain}
            )
        except Exception:
            pass
    return res

