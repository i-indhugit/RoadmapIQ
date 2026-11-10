"""
Comprehensive Test Suite for RoadmapIQ Centralized RAG Knowledge Engine.
Verifies:
1. Multi-domain semantic retrieval (Tech, Commerce, Law, Healthcare, Govt).
2. Metadata pre-filtering and cross-career contamination prevention.
3. Document ingestion, deduplication, and chunking.
4. Grounded answer synthesis with source attribution.
5. Honest fallback when curriculum context is missing.
6. Universal roadmap milestone RAG bundle generation.
7. Admin knowledge management endpoints.
"""

import pytest
from app.database import SessionLocal
from app.models import KnowledgeDocument, KnowledgeChunk
from app.engine.rag_engine import (
    VectorRetriever,
    RAGGroundedGenerator,
    MilestoneRAGService,
    DocumentIngestionService,
    cosine_similarity,
    clean_text,
    compute_sha256,
)
from app.engine.seed_rag_knowledge import seed_rag_knowledge


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    # Ensure seed documents are populated
    seed_rag_knowledge(session)
    yield session
    session.close()


def test_seed_knowledge_populated(db):
    """Verify seed knowledge base contains documents across multiple domains."""
    doc_count = db.query(KnowledgeDocument).count()
    chunk_count = db.query(KnowledgeChunk).count()
    assert doc_count >= 8, f"Expected at least 8 documents, got {doc_count}"
    assert chunk_count >= 8, f"Expected at least 8 chunks, got {chunk_count}"

    # Verify key domains present
    domains = {d[0] for d in db.query(KnowledgeDocument.career_domain).distinct().all()}
    assert "Technology and IT" in domains
    assert "Commerce, Finance & Banking" in domains
    assert "Law & Legal Services" in domains
    assert "Healthcare, Medicine & Life Sciences" in domains
    assert "Government, Civil Services & Public Policy" in domains


def test_cross_career_contamination_prevention(db):
    """
    Verify that a technical query filtered to 'Technology and IT' NEVER
    retrieves accounting or legal chunks, and vice versa.
    """
    retriever = VectorRetriever(db)

    # 1. Tech query in Tech domain
    tech_results = retriever.retrieve(
        query="Spring Boot Dependency Injection and JVM GC tuning",
        career_domain="Technology and IT",
        top_k=5,
    )
    assert len(tech_results) >= 1
    for score, chunk in tech_results:
        assert chunk.career_domain == "Technology and IT"
        assert "Commerce" not in chunk.career_domain
        assert "Law" not in chunk.career_domain

    # 2. Commerce query in Commerce domain
    finance_results = retriever.retrieve(
        query="Ind AS 115 revenue recognition and balance sheet equation",
        career_domain="Commerce, Finance & Banking",
        top_k=5,
    )
    assert len(finance_results) >= 1
    for score, chunk in finance_results:
        assert chunk.career_domain == "Commerce, Finance & Banking"
        assert "Technology" not in chunk.career_domain


def test_jurisdiction_filtering_for_indian_law_and_upsc(db):
    """Verify jurisdiction filtering prioritizes Indian sources for UPSC and Law."""
    retriever = VectorRetriever(db)

    upsc_results = retriever.retrieve(
        query="Indian Polity Federalism 73rd constitutional amendment",
        career_domain="Government, Civil Services & Public Policy",
        country_jurisdiction="India",
        top_k=3,
    )
    assert len(upsc_results) >= 1
    for _, chunk in upsc_results:
        assert chunk.country_jurisdiction in ("India", "Global")
        assert "UPSC" in chunk.source_title or "Civil Services" in chunk.source_title


def test_grounded_synthesis_with_source_citations(db):
    """Verify that synthesized answers cite sources with [Source N: Title]."""
    retriever = VectorRetriever(db)
    generator = RAGGroundedGenerator()

    results = retriever.retrieve(
        query="Java memory management and Garbage Collection",
        career_domain="Technology and IT",
        top_k=2,
    )
    assert len(results) >= 1

    ans, sources, is_grounded = generator.synthesize_answer(
        query="Java memory management and Garbage Collection",
        retrieved_items=results,
        target_role="Java Backend Developer",
        domain="Technology and IT",
    )

    assert is_grounded is True
    assert len(sources) >= 1
    assert "Java Platform" in sources[0].title
    assert "Oracle" in sources[0].provider
    assert "[Source 1" in ans or "Java Platform" in ans or "Java SE 21" in ans


def test_honest_fallback_on_unrelated_query(db):
    """Verify that queries with zero matching verified curriculum return an honest disclaimer."""
    generator = RAGGroundedGenerator()

    # Empty retrieved items
    ans, sources, is_grounded = generator.synthesize_answer(
        query="Random nonexistent alien language grammar",
        retrieved_items=[],
        target_role="Astronaut",
        domain="Aerospace",
    )

    assert is_grounded is False
    assert len(sources) == 0
    assert "Verified Curriculum Notice" in ans
    assert "could not locate verified reference materials" in ans


def test_document_ingestion_and_deduplication(db):
    """Verify document ingestion, text cleaning, chunking, and idempotent deduplication."""
    service = DocumentIngestionService(db)
    test_title = "PyTest Test Ingestion Syllabus Document"
    test_content = (
        "# Unit Testing Principles & Mocking Frameworks\n\n"
        "Unit testing isolates small testable units of code. "
        "Test fixtures setup reproducible prerequisites. "
        "Assertions verify state invariants and exception propagation."
    )

    # 1st Ingestion
    doc1, count1, status1 = service.ingest_document(
        title=test_title,
        content=test_content,
        source_url="https://pytest.org/test-doc",
        provider="PyTest Org",
        career_domain="Technology and IT",
        category="official_documentation",
    )
    assert doc1 is not None
    assert count1 >= 1
    assert status1 in ("indexed_successfully", "already_indexed")

    # 2nd Ingestion with same hash -> Must report already_indexed
    doc2, count2, status2 = service.ingest_document(
        title=test_title,
        content=test_content,
        source_url="https://pytest.org/test-doc",
        provider="PyTest Org",
        career_domain="Technology and IT",
        category="official_documentation",
    )
    assert doc2.id == doc1.id
    assert status2 == "already_indexed"

    # Clean up test document
    service.delete_document(doc1.id)


def test_milestone_rag_bundle_generation(db):
    """Verify that roadmap milestones receive full grounded RAG bundles across domains."""
    service = MilestoneRAGService(db)

    # Test Tech Milestone
    tech_bundle = service.generate_milestone_bundle(
        milestone_title="Spring Boot Microservices and Dependency Injection",
        role_title="Java Backend Developer",
        domain="Technology and IT",
    )
    assert tech_bundle.is_grounded is True
    assert len(tech_bundle.sources) >= 1
    assert len(tech_bundle.study_notes) >= 1
    assert len(tech_bundle.flashcards) >= 3
    assert len(tech_bundle.quiz) >= 2
    assert len(tech_bundle.practice_exercises) >= 1
    assert len(tech_bundle.project_guidance) >= 1

    # Test Healthcare Disclaimer
    health_bundle = service.generate_milestone_bundle(
        milestone_title="Clinical Trial Protocols & Ethics",
        role_title="Clinical Research Associate",
        domain="Healthcare, Medicine & Life Sciences",
    )
    assert health_bundle.disclaimer is not None
    assert "does not substitute for regulated professional qualifications" in health_bundle.disclaimer


def test_admin_stats(db):
    """Verify admin stats endpoint returns correct counts and domain breakdowns."""
    service = DocumentIngestionService(db)
    stats = service.get_stats()
    assert stats["total_documents"] >= 8
    assert stats["total_chunks"] >= 8
    assert stats["domains_covered"] >= 5
    assert "Technology and IT" in stats["domain_distribution"]

