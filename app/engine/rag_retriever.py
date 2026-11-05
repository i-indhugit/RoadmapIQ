import re
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import LearningResource, Skill, CareerRole
from app.schemas import RAGRetrievedSource, RAGQueryResponse


# Common stop words to exclude during tokenization
STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
    "by", "about", "like", "through", "over", "before", "between", "after",
    "since", "without", "under", "within", "along", "following", "across",
    "behind", "beyond", "plus", "except", "but", "up", "out", "around", "down",
    "off", "above", "near", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "can", "could", "should", "would",
    "may", "might", "must", "shall", "will", "i", "you", "he", "she", "it",
    "we", "they", "what", "which", "who", "when", "where", "why", "how",
    "me", "my", "myself", "learn", "study", "guide", "tutorial", "best",
    "tell", "explain", "give", "help", "need", "want"
}


def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into meaningful terms."""
    if not text:
        return []
    cleaned = re.sub(r"[^\w\s-]", " ", text.lower())
    tokens = [t.strip("-") for t in cleaned.split() if len(t.strip("-")) > 1]
    return [t for t in tokens if t not in STOP_WORDS]


def retrieve_relevant_resources(
    db: Session,
    query: str,
    target_role_title: Optional[str] = None,
    preferred_format: Optional[str] = None,
    top_k: int = 5
) -> Tuple[List[RAGRetrievedSource], List[str]]:
    """
    Retrieves the most relevant learning resources from the database based on the query.
    Returns:
        (List of RAGRetrievedSource, List of identified skill names)
    """
    query_tokens = tokenize(query)
    if not query_tokens:
        return [], []

    # Fetch all resources and associated skills
    resources = (
        db.query(LearningResource, Skill)
        .join(Skill, LearningResource.skill_id == Skill.id)
        .all()
    )

    scored_results: List[Tuple[float, LearningResource, Skill]] = []
    identified_skills_set = set()

    normalized_query = query.lower()

    for resource, skill in resources:
        score = 0.0

        skill_name_lower = skill.name.lower()
        skill_slug_lower = skill.slug.lower()
        res_title_lower = resource.title.lower()
        res_desc_lower = resource.description.lower()
        provider_lower = resource.provider.lower()
        category_lower = skill.category.lower()

        # 1. Exact phrase matches (High weight)
        if skill_name_lower in normalized_query:
            score += 15.0
            identified_skills_set.add(skill.name)

        if skill_slug_lower in normalized_query:
            score += 12.0
            identified_skills_set.add(skill.name)

        # 2. Token overlap matches
        res_tokens = set(tokenize(f"{resource.title} {resource.description} {skill.name} {skill.category} {resource.provider}"))
        
        overlap_count = 0
        for token in query_tokens:
            if token in skill_name_lower:
                score += 8.0
                identified_skills_set.add(skill.name)
                overlap_count += 1
            elif token in res_title_lower:
                score += 5.0
                overlap_count += 1
            elif token in res_desc_lower:
                score += 2.0
                overlap_count += 1
            elif token in category_lower:
                score += 3.0
                overlap_count += 1
            elif token in provider_lower:
                score += 2.5
                overlap_count += 1

        # 3. Format preference bonus
        if preferred_format and preferred_format.lower() != "mixed":
            if resource.format.lower() == preferred_format.lower():
                score += 2.0

        # 4. Rating factor
        if resource.rating:
            score += (resource.rating / 5.0) * 1.5

        # Normalize score
        if score > 0:
            scored_results.append((score, resource, skill))

    # Sort descending by relevance score
    scored_results.sort(key=lambda x: x[0], reverse=True)

    # Filter out results with very low confidence
    min_score_threshold = 3.5
    top_matches = [item for item in scored_results if item[0] >= min_score_threshold][:top_k]

    sources_out: List[RAGRetrievedSource] = []
    for score, res, sk in top_matches:
        # Scale score to 0.0 - 1.0 range
        normalized_score = round(min(1.0, score / 25.0), 2)
        sources_out.append(
            RAGRetrievedSource(
                title=res.title,
                provider=res.provider,
                url=res.url,
                format=res.format,
                relevance_score=normalized_score,
                skill_name=sk.name,
                difficulty=res.difficulty
            )
        )

    return sources_out, list(identified_skills_set)


def generate_rag_answer(
    query: str,
    sources: List[RAGRetrievedSource],
    identified_skills: List[str],
    target_role: Optional[str] = None
) -> str:
    """
    Synthesizes a helpful educational answer strictly grounded in the retrieved sources.
    Never fabricates links or citations.
    """
    if not sources:
        return (
            "I couldn't find any relevant learning resources in our technical curriculum database "
            "for your specific query. Please try searching for specific core skills, concepts, or interview topics "
            "(e.g., 'Dynamic Programming', 'FastAPI', 'React State Management', 'SQL Indexing', 'Docker containers')."
        )

    skill_str = ", ".join(identified_skills) if identified_skills else "your target domain"
    role_ctx = f" for the {target_role} path" if target_role else ""

    lines = []
    lines.append(f"### RoadmapIQ Curriculum Guidance: {skill_str.title()}{role_ctx}\n")
    lines.append(f"Based on your query **\"{query}\"**, here is a targeted learning plan and vetted references from the RoadmapIQ curriculum:\n")

    lines.append("#### Recommended Study Focus:")
    for idx, s in enumerate(sources[:3], 1):
        lines.append(f"{idx}. **{s.title}** ({s.provider}) – Focused on *{s.skill_name}* ({s.difficulty.title()} level, {s.format} format).")

    lines.append("\n#### Key Conceptual Milestones to Master:")
    if any("data structure" in s.skill_name.lower() or "algorithm" in s.skill_name.lower() for s in sources):
        lines.append("- Time and space complexity trade-offs ($O(1)$, $O(n)$, $O(n \\log n)$, $O(2^n)$).")
        lines.append("- Identifying optimal problem patterns: two pointers, sliding window, tree DFS/BFS, and memoization.")
        lines.append("- Edge-case handling (empty inputs, integer overflow, cyclic graphs).")
    elif any("react" in s.skill_name.lower() or "frontend" in s.skill_name.lower() for s in sources):
        lines.append("- Component lifecycle, rendering performance, and hook dependencies (`useEffect`, `useMemo`).")
        lines.append("- Predictable state management and unidirectional data flow.")
        lines.append("- Modern web vitals, accessibility (a11y), and responsive layout principles.")
    elif any("api" in s.skill_name.lower() or "fastapi" in s.skill_name.lower() or "backend" in s.skill_name.lower() for s in sources):
        lines.append("- REST architectural constraints, idempotency, and proper HTTP status code semantics.")
        lines.append("- Asynchronous request pipelines, dependency injection, and data validation.")
        lines.append("- Database connection pooling, indexing strategies, and transactional consistency.")
    elif any("machine learning" in s.skill_name.lower() or "genai" in s.skill_name.lower() or "deep learning" in s.skill_name.lower() for s in sources):
        lines.append("- Model evaluation metrics (Precision, Recall, F1, ROC-AUC) beyond simple accuracy.")
        lines.append("- Embeddings, vector indexing, similarity search metrics (Cosine, Dot Product).")
        lines.append("- Prompt engineering patterns, few-shot examples, and preventing context window truncation.")
    else:
        lines.append("- Foundational syntax and idioms of the ecosystem.")
        lines.append("- Writing unit tests and verifying error paths.")
        lines.append("- Practical integration into an end-to-end portfolio project.")

    lines.append("\n#### How to Study These Resources:")
    lines.append(f"- Begin with the **{sources[0].provider}** resource for systematic theoretical foundations.")
    if len(sources) > 1:
        lines.append(f"- Complement with **{sources[1].title}** to apply hands-on practice problems.")
    lines.append("- Document your code decisions in Git with clean commit messages for placement interviews.")

    return "\n".join(lines)


def process_rag_query(
    db: Session,
    query: str,
    target_role: Optional[str] = None,
    preferred_format: Optional[str] = "mixed"
) -> RAGQueryResponse:
    """End-to-end RAG retriever pipeline powered by Google Gemini synthesis."""
    sources, identified_skills = retrieve_relevant_resources(
        db=db,
        query=query,
        target_role_title=target_role,
        preferred_format=preferred_format,
        top_k=5
    )

    has_sources = len(sources) > 0

    # Delegate response synthesis to Google Gemini grounded on the retrieved sources
    try:
        from app.engine.gemini_service import generate_rag_gemini_answer
        answer = generate_rag_gemini_answer(query, sources, identified_skills, target_role)
    except Exception:
        answer = generate_rag_answer(query, sources, identified_skills, target_role)

    return RAGQueryResponse(
        query=query,
        answer=answer,
        sources=sources,
        has_relevant_sources=has_sources,
        context_skills_identified=identified_skills
    )

