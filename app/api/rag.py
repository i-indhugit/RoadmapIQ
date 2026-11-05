"""
Centralized RAG Knowledge Base and Milestone Grounding Router for RoadmapIQ.
Exposes context-aware search, milestone bundles, diagnostic quizzes, and admin knowledge management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KnowledgeDocument, KnowledgeChunk, RAGInteractionLog, StudentProfile
from app.schemas import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGRetrievedSource,
    MilestoneRAGRequest,
    MilestoneRAGResponse,
    DocumentIngestRequest,
    DocumentIngestResponse,
    DocumentListItem,
    KnowledgeAdminStats,
)
from app.engine.rag_engine import (
    VectorRetriever,
    RAGGroundedGenerator,
    MilestoneRAGService,
    DocumentIngestionService,
)

router = APIRouter(prefix="/rag", tags=["Centralized RAG Knowledge Engine"])


# =============================================================================
# 1. CONTEXTUAL RAG QUERY (AI MENTOR & ASSISTANT)
# =============================================================================

@router.post("/query", response_model=RAGQueryResponse)
def query_knowledge_base(
    req: RAGQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Context-aware semantic knowledge query grounded in verified curriculum documents.
    Prevents cross-career contamination and enforces metadata-based jurisdictional relevance.
    """
    retriever = VectorRetriever(db)
    generator = RAGGroundedGenerator()

    # If student profile provided, fill context if missing
    if req.profile_id:
        student = db.query(StudentProfile).filter(StudentProfile.id == req.profile_id).first()
        if student:
            if not req.target_role and student.target_role:
                req.target_role = student.target_role.title
                if not req.domain and student.target_role.domain:
                    req.domain = student.target_role.domain

    retrieved = retriever.retrieve(
        query=req.query,
        career_domain=req.domain,
        career_role_title=req.target_role,
        category=req.category,
        country_jurisdiction=req.country_jurisdiction,
        top_k=req.top_k or 5,
        min_similarity=0.18,
    )

    answer, sources, is_grounded = generator.synthesize_answer(
        query=req.query,
        retrieved_items=retrieved,
        target_role=req.target_role,
        domain=req.domain,
    )

    # Log interaction for audit and learning analytics
    try:
        log = RAGInteractionLog(
            profile_id=req.profile_id,
            query=req.query,
            context_role=req.target_role,
            context_domain=req.domain,
            milestone_title=req.milestone_title,
            action="query",
            retrieved_chunk_ids=[ch.id for _, ch in retrieved],
            retrieved_source_urls=[s.url for s in sources],
            answer_snippet=answer[:300],
            confidence_score=retrieved[0][0] if retrieved else 0.0,
            model_used="rag_hybrid",
        )
        db.add(log)
        db.commit()
    except Exception:
        pass

    identified_skills = list({s.skill_name for s in sources if s.skill_name})

    return RAGQueryResponse(
        query=req.query,
        answer=answer,
        sources=sources,
        has_relevant_sources=len(sources) > 0,
        context_skills_identified=identified_skills,
        confidence_score=retrieved[0][0] if retrieved else 0.0,
        is_grounded_in_rag=is_grounded,
        domain_identified=req.domain or (sources[0].domain if sources else None),
    )


# =============================================================================
# 2. UNIVERSAL MILESTONE RAG BUNDLE (CHECKPOINT DRAWER & ROADMAP)
# =============================================================================

@router.post("/milestone-bundle", response_model=MilestoneRAGResponse)
def get_milestone_rag_bundle(
    req: MilestoneRAGRequest,
    db: Session = Depends(get_db),
):
    """
    Retrieves verified curriculum knowledge for a roadmap milestone.
    Generates concept explanations, study notes, examples, flashcards, diagnostic quiz,
    practice exercises, and project guidance with complete source attribution.
    """
    service = MilestoneRAGService(db)
    bundle = service.generate_milestone_bundle(
        milestone_title=req.milestone_title,
        role_title=req.role_title,
        domain=req.domain or "Technology",
        level=req.level or "intermediate",
        action=req.action or "bundle",
        custom_query=req.query,
    )

    # Log interaction
    if req.profile_id:
        try:
            log = RAGInteractionLog(
                profile_id=req.profile_id,
                query=req.query or req.milestone_title,
                context_role=req.role_title,
                context_domain=req.domain,
                milestone_title=req.milestone_title,
                action=f"milestone_{req.action}",
                retrieved_chunk_ids=[s.chunk_id for s in bundle.sources if s.chunk_id],
                retrieved_source_urls=[s.url for s in bundle.sources],
                answer_snippet=bundle.concept_explanation[:250],
                confidence_score=bundle.sources[0].relevance_score if bundle.sources else 0.0,
                model_used="rag_milestone_engine",
            )
            db.add(log)
            db.commit()
        except Exception:
            pass

    return bundle


# =============================================================================
# 3. ADMIN KNOWLEDGE MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/admin/documents", response_model=List[DocumentListItem])
def list_knowledge_documents(
    domain: Optional[str] = Query(None, description="Filter by career domain"),
    category: Optional[str] = Query(None, description="Filter by knowledge category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """List all indexed knowledge documents with chunk counts and metadata."""
    q = db.query(KnowledgeDocument)
    if domain and domain.lower() != "all":
        q = q.filter(KnowledgeDocument.career_domain == domain)
    if category and category.lower() != "all":
        q = q.filter(KnowledgeDocument.category == category)

    docs = q.order_by(KnowledgeDocument.id.desc()).offset(skip).limit(limit).all()

    return [
        DocumentListItem(
            id=d.id,
            title=d.title,
            provider=d.provider,
            source_url=d.source_url,
            career_domain=d.career_domain,
            career_role_title=d.career_role_title,
            category=d.category,
            chunk_count=d.chunk_count,
            difficulty=d.difficulty,
            country_jurisdiction=d.country_jurisdiction,
            ingestion_status=d.ingestion_status,
            created_at=d.created_at.isoformat() if d.created_at else None,
        )
        for d in docs
    ]


@router.post("/admin/documents/ingest", response_model=DocumentIngestResponse)
def ingest_knowledge_document(
    req: DocumentIngestRequest,
    db: Session = Depends(get_db),
):
    """
    Ingest a new syllabus, official documentation, or educational reference document.
    Validates, extracts, cleans, chunks, embeds, and indexes into the vector knowledge base.
    """
    service = DocumentIngestionService(db)
    try:
        doc, count, status_msg = service.ingest_document(
            title=req.title,
            content=req.content,
            source_url=req.source_url,
            provider=req.provider,
            career_domain=req.career_domain,
            career_role_title=req.career_role_title,
            category=req.category or "learning_materials",
            related_skills=req.related_skills,
            related_topics=req.related_topics,
            difficulty=req.difficulty or "intermediate",
            country_jurisdiction=req.country_jurisdiction or "Global",
            access_type=req.access_type or "free_open",
            file_type=req.file_type or "text",
        )
        return DocumentIngestResponse(
            document_id=doc.id,
            title=doc.title,
            chunk_count=count,
            status=status_msg,
            message=f"Document successfully {status_msg} with {count} chunks.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document ingestion failed: {str(e)}",
        )


@router.delete("/admin/documents/{doc_id}")
def delete_knowledge_document(
    doc_id: int,
    db: Session = Depends(get_db),
):
    """Remove a document and all its indexed chunks from the knowledge base."""
    service = DocumentIngestionService(db)
    deleted = service.delete_document(doc_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge document #{doc_id} not found.",
        )
    return {"status": "success", "message": f"Document #{doc_id} and associated chunks deleted."}


@router.get("/admin/stats", response_model=KnowledgeAdminStats)
def get_knowledge_base_stats(
    db: Session = Depends(get_db),
):
    """Retrieve global statistics on indexed documents, chunks, and domain coverage."""
    service = DocumentIngestionService(db)
    return service.get_stats()


@router.post("/admin/test-retrieval")
def test_knowledge_retrieval(
    query: str = Query(..., description="Test query string"),
    domain: Optional[str] = Query(None, description="Optional career domain filter"),
    role_title: Optional[str] = Query(None, description="Optional career role filter"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    top_k: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Admin inspection endpoint to test raw semantic retrieval rankings without LLM synthesis."""
    retriever = VectorRetriever(db)
    results = retriever.retrieve(
        query=query,
        career_domain=domain,
        career_role_title=role_title,
        category=category,
        top_k=top_k,
        min_similarity=0.10,
    )
    return {
        "query": query,
        "domain_filter": domain,
        "results_count": len(results),
        "matches": [
            {
                "score": score,
                "chunk_id": ch.id,
                "document_id": ch.document_id,
                "source_title": ch.source_title,
                "provider": ch.provider,
                "domain": ch.career_domain,
                "category": ch.category,
                "section_reference": ch.section_reference,
                "snippet": ch.content[:200] + "...",
                "url": ch.source_url,
            }
            for score, ch in results
        ],
    }

