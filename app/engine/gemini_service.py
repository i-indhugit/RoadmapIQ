import os
import json
import time
import logging
from typing import Dict, List, Optional, Any
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.config import settings
from app.schemas import (
    AIStatusResponse,
    AIExplainRequest,
    AIExplainResponse,
    AIRoadmapAdviceRequest,
    AIRoadmapAdviceResponse,
    ProjectMentorRequest,
    ProjectMentorResponse,
    InterviewFeedbackRequest,
    InterviewFeedbackResponse,
    RAGRetrievedSource,
    RAGQueryResponse,
    WeeklyPlannerAIRequest,
    WeeklyPlannerAIResponse,
    WeeklyDayPlan,
    AIProjectRecommendationRequest,
    AIProjectRecommendationResponse,
    AIProjectItem,
    AIInterviewGenRequest,
    AIInterviewGenResponse,
    AIInterviewQuestionItem,
    GeminiTestResponse,
    MilestoneTutorRequest,
    MilestoneTutorResponse,
    FlashcardItem,
    QuizItem,
)

logger = logging.getLogger(__name__)


def get_gemini_api_key() -> Optional[str]:
    """Retrieves the Gemini API key from settings or OS environment."""
    key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if not key or key.strip() in ("", "your_gemini_api_key_here", "None"):
        return None
    return key.strip()


def get_gemini_client() -> Optional[genai.Client]:
    """
    Initializes and returns the official Google Gemini client.
    Never exposes API key in logs or exceptions.
    """
    key = get_gemini_api_key()
    if not key:
        return None
    try:
        timeout_ms = int(getattr(settings, "GEMINI_TIMEOUT_SECONDS", 5.0) * 1000)
        return genai.Client(
            api_key=key,
            http_options=types.HttpOptions(timeout=timeout_ms)
        )
    except Exception as e:
        logger.error(f"Failed to initialize Google Gemini client: {e}")
        return None


def check_ai_status() -> AIStatusResponse:
    """Verifies connection status to Google Gemini API (Cloud)."""
    client = get_gemini_client()
    if client:
        return AIStatusResponse(
            enabled=True,
            available=True,
            provider="Google Gemini API (Cloud)",
            model=settings.GEMINI_MODEL,
            message=f"Google Gemini API active via cloud SDK (model: {settings.GEMINI_MODEL})."
        )
    return AIStatusResponse(
        enabled=settings.DEFAULT_AI_ENABLED,
        available=False,
        provider="Google Gemini API (Cloud)",
        model=settings.GEMINI_MODEL,
        message="Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env to activate live Google Gemini generation."
    )


def test_gemini_connection() -> GeminiTestResponse:
    """Tests live connection to Google Gemini API."""
    client = get_gemini_client()
    if not client:
        return GeminiTestResponse(
            status="missing_key",
            model=settings.GEMINI_MODEL,
            message="GEMINI_API_KEY is not configured in backend/.env. Please add your Gemini API key to activate live cloud generation.",
            api_key_configured=False,
            response_text=None,
            latency_ms=None,
        )

    start_time = time.time()
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents="Hello! Confirm in one short sentence that the RoadmapIQ Google Gemini cloud connection is healthy.",
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=100
            )
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        resp_text = response.text.strip() if response.text else "Connection successful."
        return GeminiTestResponse(
            status="ok",
            model=settings.GEMINI_MODEL,
            message="Google Gemini API cloud connection verified and operational.",
            api_key_configured=True,
            response_snippet=resp_text[:120],
            response_text=resp_text,
            latency_ms=latency_ms
        )
    except APIError as e:
        logger.error(f"Gemini API test error: {e.message}")
        return GeminiTestResponse(
            status="error",
            model=settings.GEMINI_MODEL,
            message=f"Google Gemini API error: {e.message}",
            api_key_configured=True,
            latency_ms=round((time.time() - start_time) * 1000, 2)
        )
    except Exception as e:
        logger.error(f"Gemini test connection failed: {e}")
        return GeminiTestResponse(
            status="error",
            model=settings.GEMINI_MODEL,
            message=f"Could not connect to Google Gemini API: {str(e)[:150]}",
            api_key_configured=True,
            latency_ms=round((time.time() - start_time) * 1000, 2)
        )


def call_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    json_mode: bool = False,
    temperature: float = 0.3
) -> Optional[str]:
    """
    Internal helper to invoke Google Gemini API with timeout and error handling.
    Returns response text or None if offline/failed.
    """
    client = get_gemini_client()
    if not client:
        return None

    try:
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS,
            system_instruction=system_instruction,
            response_mime_type="application/json" if json_mode else "text/plain"
        )
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config
        )
        if response and response.text:
            return response.text.strip()
    except APIError as e:
        logger.warning(f"Google Gemini API error ({e.code}): {e.message}")
    except Exception as e:
        logger.warning(f"Google Gemini call exception: {str(e)[:150]}")

    return None


def call_gemini_text(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
) -> Optional[str]:
    """Convenience plain-text wrapper around call_gemini used by RAG synthesis."""
    return call_gemini(
        prompt=prompt,
        system_instruction=system_instruction,
        json_mode=False,
        temperature=temperature,
    )


# -------------------------------------------------------------
# Feature A & B: Skill Gap Explanation & Roadmap Advice
# -------------------------------------------------------------
def generate_roadmap_advice(req: AIRoadmapAdviceRequest) -> AIRoadmapAdviceResponse:
    """Produces personalized AI strategy and pacing advice for a generated roadmap."""
    role = req.role_title
    readiness = req.readiness_score
    weeks = req.target_duration_weeks
    hours = req.weekly_hours
    gaps = req.top_gaps or []

    prompt = (
        f"You are a senior tech lead and engineering hiring manager for the '{role}' track.\n"
        f"Analyze this student's learning profile:\n"
        f"- Target Role: {role}\n"
        f"- Current Baseline Readiness Score: {readiness}%\n"
        f"- Target Preparation Window: {weeks} weeks\n"
        f"- Weekly Available Study Hours: {hours} hours/week\n"
        f"- Primary Skill Gaps: {', '.join(gaps) if gaps else 'Core foundations'}\n\n"
        f"Respond in valid JSON with these exact keys:\n"
        f'{{\n'
        f'  "executive_summary": "2-3 paragraphs of realistic, encouraging strategic advice.",\n'
        f'  "weekly_pacing_strategy": "Concrete weekly breakdown of study, practical labs, and interview prep hours.",\n'
        f'  "high_priority_focus_areas": ["Top 4 skills or concepts to prioritize first"],\n'
        f'  "potential_bottlenecks": ["3 common pitfalls or traps to avoid in this career"],\n'
        f'  "placement_tips": ["3 pragmatic tips for placement interviews and portfolio building"]\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are an expert career mentor and technical curriculum architect. Output strictly valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            return AIRoadmapAdviceResponse(
                role_title=role,
                readiness_score=readiness,
                executive_summary=parsed.get("executive_summary", ""),
                weekly_pacing_strategy=parsed.get("weekly_pacing_strategy", ""),
                high_priority_focus_areas=parsed.get("high_priority_focus_areas", gaps[:4]),
                potential_bottlenecks=parsed.get("potential_bottlenecks", []),
                placement_tips=parsed.get("placement_tips", []),
                is_ai_generated=True
            )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for roadmap advice: {err}")

    # Deterministic curriculum reasoning fallback
    if readiness >= 70:
        summary = (
            f"You have a solid foundation for the {role} track at {readiness}% readiness. "
            f"Your primary mission over these {weeks} weeks is fine-tuning production practices, "
            f"building an impressive capstone portfolio project, and mastering interview-level problem solving."
        )
    elif readiness >= 40:
        summary = (
            f"You are in a healthy transitional position with {readiness}% readiness for {role}. "
            f"With {hours} hours/week across {weeks} weeks, focusing on the core prerequisite skills first "
            f"will yield the steepest acceleration in your technical depth."
        )
    else:
        summary = (
            f"You are initiating a comprehensive reskilling journey for {role} ({readiness}% baseline). "
            f"Maintaining consistency across your {hours} weekly hours will be critical. Dedicate "
            f"the initial weeks strictly to foundational syntax and data structures before attempting system architectures."
        )

    pacing_strategy = (
        f"Dedicate {max(2, int(hours * 0.35))} hours to conceptual deep dives and documentation, "
        f"{max(3, int(hours * 0.45))} hours to hands-on coding and lab exercises, "
        f"and {max(1, int(hours * 0.20))} hours to placement interview question reviews every single week."
    )

    focus_areas = gaps[:4] if gaps else [
        "Data Structures & Algorithmic Problem Solving",
        f"Core {role} Architecture Patterns",
        "Clean Code & Unit Testing Best Practices",
        "System Scalability & Database Optimization"
    ]

    bottlenecks = [
        "Skipping fundamentals: jumping to advanced frameworks before mastering prerequisite syntax.",
        "Passive learning trap: watching tutorials without independently writing and debugging code.",
        "Neglecting Git hygiene: pushing monolithic commits instead of atomic, documented feature branches."
    ]

    placement_tips = [
        f"Build one end-to-end deployed portfolio application specifically demonstrating {role} capabilities.",
        "Prepare 3 concrete STAR-format stories highlighting technical trade-offs and difficult debugging sessions.",
        "Practice explaining time/space complexities out loud as you write code."
    ]

    return AIRoadmapAdviceResponse(
        role_title=role,
        readiness_score=readiness,
        executive_summary=summary,
        weekly_pacing_strategy=pacing_strategy,
        high_priority_focus_areas=focus_areas,
        potential_bottlenecks=bottlenecks,
        placement_tips=placement_tips,
        is_ai_generated=False
    )


def explain_skill_gap(req: AIExplainRequest) -> AIExplainResponse:
    """Generates an in-depth breakdown of a skill, why it matters, and an actionable learning path."""
    topic = req.topic
    role = req.target_role or "Software Engineering"

    prompt = (
        f"Explain the technical skill '{topic}' for a student aspiring to become a {role}.\n"
        f"Format your response as valid JSON with these exact keys:\n"
        f'{{\n'
        f'  "explanation": "Clear 2-paragraph explanation of the core concept and what it involves.",\n'
        f'  "why_important": "Why interviewers and engineering teams test this specific skill.",\n'
        f'  "study_strategy": "Actionable 3-week study roadmap to master it.",\n'
        f'  "interview_tip": "One high-impact technical interview tip when questioned about this skill."\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are a senior staff engineer explaining a technical competency to an ambitious learner. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            return AIExplainResponse(
                topic=topic,
                explanation=parsed.get("explanation", ""),
                why_important=parsed.get("why_important", ""),
                study_strategy=parsed.get("study_strategy", ""),
                interview_tip=parsed.get("interview_tip", ""),
                is_ai_generated=True
            )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for skill gap: {err}")

    # Deterministic fallback
    explanation = (
        f"{topic} is an essential competency in modern {role} environments. It encompasses "
        f"core structural patterns, idiomatic usage, and foundational paradigms necessary to build scalable, "
        f"maintainable systems."
    )
    why_important = (
        f"In campus and off-campus placements for {role}, technical interviewers test {topic} "
        f"to determine whether a candidate has genuine hands-on problem-solving fluency rather than superficial familiarity."
    )
    study_strategy = (
        f"Week 1: Read the official documentation and build small isolated code modules.\n"
        f"Week 2: Solve 10 medium-level coding challenges or build a functional micro-feature.\n"
        f"Week 3: Integrate {topic} with unit tests and measure execution performance."
    )
    interview_tip = (
        f"When asked about {topic} in an interview, don't just quote syntax. Explain the real-world trade-offs, "
        f"failure modes, and how you verified its behavior with logging and tests."
    )

    return AIExplainResponse(
        topic=topic,
        explanation=explanation,
        why_important=why_important,
        study_strategy=study_strategy,
        interview_tip=interview_tip,
        is_ai_generated=False
    )


# -------------------------------------------------------------
# Feature C: Weekly Learning Planner
# -------------------------------------------------------------
def generate_weekly_learning_plan(req: WeeklyPlannerAIRequest) -> WeeklyPlannerAIResponse:
    """Generates an actionable weekly schedule allocating available study hours across the week."""
    role = req.role_title
    hours = req.weekly_hours
    week = req.current_week
    tasks_summary = ""
    if req.tasks:
        tasks_summary = ", ".join([t.get("title", "") for t in req.tasks[:6]])

    prompt = (
        f"Create a practical weekly study schedule for Week {week} for a student studying {role}.\n"
        f"Total available study time this week: {hours} hours.\n"
        f"Target skills/milestones: {tasks_summary or 'Foundational technical skills and coding practice'}.\n\n"
        f"Distribute the {hours} hours across Monday through Sunday with realistic daily allocations.\n"
        f"Return strictly valid JSON with this schema:\n"
        f'{{\n'
        f'  "daily_schedule": [\n'
        f'    {{"day": "Monday", "focus_topic": "Topic Name", "hours_allocated": 2.0, "recommended_activity": "Detailed activity"}},\n'
        f'    {{"day": "Tuesday", "focus_topic": "Topic Name", "hours_allocated": 2.5, "recommended_activity": "Detailed activity"}}\n'
        f'  ],\n'
        f'  "pacing_advice": "Brief summary of how to stay on track this week."\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are an expert academic learning planner. Create balanced, achievable study plans. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            days = []
            for d in parsed.get("daily_schedule", []):
                days.append(WeeklyDayPlan(
                    day=d.get("day", "Day"),
                    focus_topic=d.get("focus_topic", "Core Practice"),
                    hours_allocated=float(d.get("hours_allocated", 2.0)),
                    recommended_activity=d.get("recommended_activity", "Study and practical exercises")
                ))
            if days:
                return WeeklyPlannerAIResponse(
                    role_title=role,
                    weekly_hours=hours,
                    daily_schedule=days,
                    pacing_advice=parsed.get("pacing_advice", "Maintain steady progress and build hands-on deliverables."),
                    is_ai_generated=True
                )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for weekly planner: {err}")

    # Deterministic schedule fallback
    daily_hrs = round(hours / 5, 1)
    days_data = [
        WeeklyDayPlan(day="Monday", focus_topic="Concept Theory & Syntax", hours_allocated=daily_hrs, recommended_activity="Review documentation and grasp core patterns."),
        WeeklyDayPlan(day="Tuesday", focus_topic="Hands-on Code Labs", hours_allocated=daily_hrs, recommended_activity="Build small coding exercises and solve 3 problem statements."),
        WeeklyDayPlan(day="Wednesday", focus_topic="Deep Dive & Debugging", hours_allocated=daily_hrs, recommended_activity="Implement component integration and write unit tests."),
        WeeklyDayPlan(day="Thursday", focus_topic="Deliverable Building", hours_allocated=daily_hrs, recommended_activity="Work on the milestone project module and push to Git."),
        WeeklyDayPlan(day="Friday", focus_topic="Review & Interview Prep", hours_allocated=daily_hrs, recommended_activity="Practice explaining design trade-offs and solve mock MCQs."),
        WeeklyDayPlan(day="Saturday", focus_topic="Consolidation & Mini-Project", hours_allocated=round(hours * 0.2, 1), recommended_activity="Code review and end-to-end test verification."),
        WeeklyDayPlan(day="Sunday", focus_topic="Rest & Reflection", hours_allocated=0.0, recommended_activity="Rest and prepare mental strategy for the upcoming week.")
    ]

    return WeeklyPlannerAIResponse(
        role_title=role,
        weekly_hours=hours,
        daily_schedule=days_data,
        pacing_advice=f"Pacing target: {hours} hours distributed across weekdays to maintain consistent technical momentum.",
        is_ai_generated=False
    )


# -------------------------------------------------------------
# Feature D: Learning Assistant (RAG Grounded + Gemini Synthesis)
# -------------------------------------------------------------
def generate_rag_gemini_answer(
    query: str,
    sources: List[RAGRetrievedSource],
    identified_skills: List[str],
    target_role: Optional[str] = None
) -> str:
    """
    Synthesizes a helpful educational answer using Google Gemini,
    grounded strictly in the retrieved learning resources from SQLite.
    Never fabricates unverified URLs.
    """
    if not sources:
        prompt = (
            f"A student studying for {target_role or 'tech career'} asked: '{query}'.\n"
            f"Provide a structured, helpful explanation of the concept, how it applies to their career, "
            f"and 3 concrete practical recommendations for mastering it."
        )
        gemini_answer = call_gemini(
            prompt=prompt,
            system_instruction="You are the RoadmapIQ AI Learning Assistant. Provide friendly, clear, technically rigorous guidance."
        )
        if gemini_answer:
            return gemini_answer

        return (
            "I couldn't find any direct match in our vetted curriculum database. "
            "Please try asking about specific core skills, concepts, or interview topics "
            "(e.g., 'Dynamic Programming', 'FastAPI', 'React State Management', 'SQL Indexing', 'Docker containers')."
        )

    sources_summary = "\n".join([
        f"- {s.title} (Provider: {s.provider}, Difficulty: {s.difficulty}, Format: {s.format}, Skill: {s.skill_name})"
        for s in sources[:4]
    ])

    skills_str = ", ".join(identified_skills) if identified_skills else "target domain"

    prompt = (
        f"You are the RoadmapIQ AI Career Assistant for a student preparing for '{target_role or 'a career in tech'}'.\n"
        f"Student Query: '{query}'\n"
        f"Identified Core Skills: {skills_str}\n\n"
        f"Vetted Curriculum Sources retrieved from database:\n{sources_summary}\n\n"
        f"Instructions:\n"
        f"1. Explain the answer to the student's question clearly, in depth, and with technical precision.\n"
        f"2. Explicitly cite the provided curriculum sources by title and provider.\n"
        f"3. Include a practical coding or design example illustrating the solution.\n"
        f"4. Provide 3 action steps for studying the recommended resources.\n"
        f"5. Do NOT invent URLs or fabricate non-existent providers."
    )

    gemini_res = call_gemini(
        prompt=prompt,
        system_instruction="You are the RoadmapIQ AI Learning Mentor. You provide deep, structured, encouraging technical explanations grounded in vetted curriculum sources."
    )

    if gemini_res:
        return gemini_res

    # Deterministic synthesis fallback
    lines = []
    lines.append(f"### RoadmapIQ Curriculum Guidance: {skills_str.title()}\n")
    lines.append(f"Based on your query **\"{query}\"**, here is targeted guidance and vetted references from the RoadmapIQ curriculum:\n")
    lines.append("#### Recommended Study Focus:")
    for idx, s in enumerate(sources[:3], 1):
        lines.append(f"{idx}. **{s.title}** ({s.provider}) – Focused on *{s.skill_name}* ({s.difficulty.title()} level, {s.format} format).")
    lines.append("\n#### How to Study These Resources:")
    lines.append(f"- Begin with **{sources[0].provider}** for systematic theoretical foundations.")
    if len(sources) > 1:
        lines.append(f"- Complement with **{sources[1].title}** to apply hands-on practice problems.")
    lines.append("- Document your code decisions in Git with clean commit messages for placement interviews.")

    return "\n".join(lines)


# -------------------------------------------------------------
# Feature E: Project Recommendations
# -------------------------------------------------------------
def generate_project_recommendations(req: AIProjectRecommendationRequest) -> AIProjectRecommendationResponse:
    """Recommends beginner, intermediate, and advanced projects using Gemini."""
    role = req.role_title
    exp = req.experience_level or "Beginner"
    skills_ctx = ", ".join(req.skills) if req.skills else "Core industry tools"

    prompt = (
        f"Recommend 3 standout portfolio projects (one Beginner, one Intermediate, one Advanced) "
        f"for an aspiring '{role}' ({exp} level, focusing on {skills_ctx}).\n\n"
        f"Return valid JSON with this schema:\n"
        f'{{\n'
        f'  "projects": [\n'
        f'    {{\n'
        f'      "title": "Project Title",\n'
        f'      "difficulty": "Beginner",\n'
        f'      "description": "2-3 sentences explaining the project goal and architecture.",\n'
        f'      "tech_stack": ["React", "FastAPI", "SQLite"],\n'
        f'      "deliverable": "Working full-stack repo with README, tests and demo.",\n'
        f'      "learning_outcomes": ["Learned Outcome 1", "Learned Outcome 2"]\n'
        f'    }}\n'
        f'  ]\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are an engineering career mentor designing high-impact portfolio projects for hiring managers. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            projects = []
            for p in parsed.get("projects", []):
                projects.append(AIProjectItem(
                    title=p.get("title", f"{role} Portfolio Project"),
                    difficulty=p.get("difficulty", "Intermediate"),
                    description=p.get("description", "End-to-end practical application."),
                    tech_stack=p.get("tech_stack", ["Python", "JavaScript"]),
                    deliverable=p.get("deliverable", "Deployed demo and Git repository"),
                    learning_outcomes=p.get("learning_outcomes", ["Clean architecture", "Production deployment"])
                ))
            if projects:
                return AIProjectRecommendationResponse(
                    role_title=role,
                    projects=projects,
                    is_ai_generated=True
                )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for projects: {err}")

    # Fallback portfolio projects
    fallback_projects = [
        AIProjectItem(
            title=f"{role} Fundamentals Toolkit",
            difficulty="Beginner",
            description=f"A clean command-line and web dashboard demonstrating core {role} methods and data validation.",
            tech_stack=["Python", "FastAPI", "SQLite"],
            deliverable="CLI application and unit test suite with 90%+ code coverage.",
            learning_outcomes=["Modular code architecture", "Unit testing", "Input validation"]
        ),
        AIProjectItem(
            title=f"Full-Stack {role} Workflow Platform",
            difficulty="Intermediate",
            description=f"A comprehensive interactive application with RESTful APIs, relational persistence, and modern responsive UI.",
            tech_stack=["React", "FastAPI", "Tailwind CSS", "SQLite"],
            deliverable="Complete deployed web application with live demo and API documentation.",
            learning_outcomes=["State management", "RESTful contracts", "Database schema design"]
        ),
        AIProjectItem(
            title=f"Enterprise {role} Distributed Production System",
            difficulty="Advanced",
            description=f"A high-throughput, resilient microservice pipeline with background processing, caching, and CI/CD automation.",
            tech_stack=["Python", "Docker", "Redis", "FastAPI", "PostgreSQL"],
            deliverable="Containerized multi-service architecture with automated CI/CD pipeline.",
            learning_outcomes=["System scalability", "Containerization", "Performance optimization"]
        )
    ]

    return AIProjectRecommendationResponse(
        role_title=role,
        projects=fallback_projects,
        is_ai_generated=False
    )


# -------------------------------------------------------------
# Feature F: Interview Preparation & Answer Evaluation
# -------------------------------------------------------------
def generate_interview_questions(req: AIInterviewGenRequest) -> AIInterviewGenResponse:
    """Generates career-specific technical and scenario interview questions with model answers."""
    role = req.role_title
    category = req.category or "technical"
    difficulty = req.difficulty or "intermediate"

    prompt = (
        f"Generate 3 realistic {difficulty}-level placement interview questions for an aspiring '{role}'.\n"
        f"Question focus: {category}.\n\n"
        f"Return strictly valid JSON with this schema:\n"
        f'{{\n'
        f'  "questions": [\n'
        f'    {{\n'
        f'      "question": "The interview question text.",\n'
        f'      "category": "{category.capitalize()}",\n'
        f'      "difficulty": "{difficulty.capitalize()}",\n'
        f'      "model_answer": "Comprehensive high-scoring model answer with key nuances.",\n'
        f'      "key_concepts": ["Concept 1", "Concept 2", "Trade-off consideration"]\n'
        f'    }}\n'
        f'  ]\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are a senior tech lead conducting placement interviews. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            questions = []
            for q in parsed.get("questions", []):
                questions.append(AIInterviewQuestionItem(
                    question=q.get("question", "Interview Question"),
                    category=q.get("category", category.capitalize()),
                    difficulty=q.get("difficulty", difficulty.capitalize()),
                    model_answer=q.get("model_answer", "Model answer explanation."),
                    key_concepts=q.get("key_concepts", ["Core principle", "Trade-offs"])
                ))
            if questions:
                return AIInterviewGenResponse(
                    role_title=role,
                    questions=questions,
                    is_ai_generated=True
                )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for interview questions: {err}")

    # Fallback interview questions
    fallback_q = [
        AIInterviewQuestionItem(
            question=f"Explain how you design and structure a clean production module for {role}.",
            category="Technical",
            difficulty="Intermediate",
            model_answer=f"In {role}, separation of concerns is vital. Decouple input validation, business logic, and persistence. Emphasize testing and error recovery.",
            key_concepts=["Separation of Concerns", "Error Handling", "Unit Testing"]
        ),
        AIInterviewQuestionItem(
            question=f"How do you debug performance bottlenecks when latency spikes under high load?",
            category="Scenario",
            difficulty="Advanced",
            model_answer="Identify the bottleneck using profiling and APM tools (e.g. slow database queries, N+1 query problems, blocking I/O). Introduce indexing, connection pooling, and caching.",
            key_concepts=["Profiling", "Database Indexing", "Caching Strategies"]
        )
    ]

    return AIInterviewGenResponse(
        role_title=role,
        questions=fallback_q,
        is_ai_generated=False
    )


def evaluate_interview_answer(req: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    """Evaluates student's technical interview answer with constructive rubric scoring using Gemini."""
    ans = req.student_answer.strip()
    q_title = req.question_title
    q_text = req.question_text
    role = req.target_role or "Software Developer"

    prompt = (
        f"You are a technical interviewer evaluating a student's answer for '{role}'.\n"
        f"Question Title: {q_title}\n"
        f"Question: {q_text}\n"
        f"Student's Answer: '{ans}'\n\n"
        f"Evaluate the answer objectively on a scale of 1 to 10.\n"
        f"Return strictly valid JSON with this schema:\n"
        f'{{\n'
        f'  "score": 8,\n'
        f'  "strengths": ["Clear strength 1", "Strength 2"],\n'
        f'  "areas_for_improvement": ["Improvement suggestion 1", "Suggestion 2"],\n'
        f'  "model_answer_comparison": "Comparison between student answer and an ideal senior response.",\n'
        f'  "follow_up_questions": ["Follow-up question 1", "Follow-up question 2"]\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are a senior hiring manager. Provide constructive, fair, rigorous feedback. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            return InterviewFeedbackResponse(
                score=int(parsed.get("score", 7)),
                strengths=parsed.get("strengths", ["Addressed core concept"]),
                areas_for_improvement=parsed.get("areas_for_improvement", ["Add more depth on edge cases"]),
                model_answer_comparison=parsed.get("model_answer_comparison", ""),
                follow_up_questions=parsed.get("follow_up_questions", []),
                is_ai_generated=True
            )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for interview evaluation: {err}")

    # Fallback evaluation based on answer length and depth
    ans_len = len(ans.split())
    if ans_len < 15:
        score = 4
        strengths = ["Identified the core topic keyword."]
        improvements = [
            "Answer is too brief. Technical interviewers look for technical depth, mechanism explanation, and edge-cases.",
            "Include an architectural example or real-world use case.",
            "Mention time/space complexity or performance implications."
        ]
    elif ans_len < 40:
        score = 6
        strengths = [
            "Good concise introduction to the concept.",
            "Demonstrates basic familiarity with the fundamental mechanism."
        ]
        improvements = [
            "Expand on trade-offs: why choose this approach over alternatives?",
            "Discuss failure modes and error recovery.",
            "Structure your answer using the STAR method if discussing past project experience."
        ]
    else:
        score = 8
        strengths = [
            "Comprehensive technical detail and structured reasoning.",
            "Clear explanation of underlying principles and practical usage.",
            "Strong vocabulary appropriate for a technical interview."
        ]
        improvements = [
            "Ensure you explicitly address edge cases (e.g. concurrency, memory limits, network timeouts).",
            "Conclude with a punchy 1-sentence summary of the architectural trade-off."
        ]

    comparison = (
        f"A top-tier answer for '{q_title}' directly states the definition, "
        f"explains internal workings (under the hood), highlights performance complexities, "
        f"and cites a practical production trade-off."
    )

    follow_ups = [
        f"How would you scale this approach if input volume grew by 100x?",
        f"What happens if a network partition or database deadlock occurs during this operation?"
    ]

    return InterviewFeedbackResponse(
        score=score,
        strengths=strengths,
        areas_for_improvement=improvements,
        model_answer_comparison=comparison,
        follow_up_questions=follow_ups,
        is_ai_generated=False
    )


def generate_project_mentor(req: ProjectMentorRequest) -> ProjectMentorResponse:
    """Provides architecture insights, code snippets, and testing strategies for a project milestone."""
    proj = req.project_name
    milestone = req.milestone_text
    role = req.target_role or "Full-Stack Developer"
    stack = ", ".join(req.tech_stack) if req.tech_stack else "Python, React, SQLite"

    prompt = (
        f"Provide architecture guidance and code starter patterns for a student milestone:\n"
        f"- Project: {proj}\n"
        f"- Target Role: {role}\n"
        f"- Tech Stack: {stack}\n"
        f"- Current Milestone: '{milestone}'\n\n"
        f"Return strictly valid JSON with this schema:\n"
        f'{{\n'
        f'  "architecture_overview": "High-level design and data flow.",\n'
        f'  "implementation_steps": ["Step 1", "Step 2", "Step 3", "Step 4"],\n'
        f'  "code_starter_snippet": "# Python/JavaScript code snippet illustrating the pattern",\n'
        f'  "key_tradeoffs": "Key architectural trade-offs to keep in mind.",\n'
        f'  "testing_strategy": "How to verify and test this milestone."\n'
        f'}}'
    )

    gemini_raw = call_gemini(
        prompt=prompt,
        system_instruction="You are a principal software architect mentoring junior developers. Output valid JSON.",
        json_mode=True
    )

    if gemini_raw:
        try:
            parsed = json.loads(gemini_raw)
            return ProjectMentorResponse(
                project_name=proj,
                milestone=milestone,
                architecture_overview=parsed.get("architecture_overview", ""),
                implementation_steps=parsed.get("implementation_steps", []),
                code_starter_snippet=parsed.get("code_starter_snippet", None),
                key_tradeoffs=parsed.get("key_tradeoffs", ""),
                testing_strategy=parsed.get("testing_strategy", ""),
                is_ai_generated=True
            )
        except Exception as err:
            logger.debug(f"JSON parsing fallback for project mentor: {err}")

    # Fallback architecture guidance
    overview = (
        f"For milestone '{milestone}' in {proj}, maintain clear separation of concerns. "
        f"Use an interface-driven approach using {stack} so that data persistence, business logic, "
        f"and user presentation remain loosely coupled."
    )

    steps = [
        "Define your data schemas and interface contracts before writing implementation code.",
        "Implement the core handler or service logic, isolating any external IO operations.",
        "Add explicit input validation and structured error responses.",
        "Write automated integration tests covering both happy path and failure edge-cases.",
        "Commit your progress to Git with a descriptive message referencing this milestone."
    ]

    starter_code = (
        "# Example architectural pattern for this milestone\n"
        "from typing import Optional, Dict, Any\n"
        "import logging\n\n"
        "logger = logging.getLogger(__name__)\n\n"
        "class ServiceHandler:\n"
        "    def __init__(self, db_session):\n"
        "        self.db = db_session\n\n"
        "    async def execute_milestone_operation(self, payload: Dict[str, Any]) -> Dict[str, Any]:\n"
        "        if not payload:\n"
        "            raise ValueError('Invalid request payload')\n"
        "        logger.info('Processing operation with verified dependencies')\n"
        "        return {'status': 'success', 'data': payload}\n"
    )

    tradeoffs = (
        "Opting for synchronous simplicity versus asynchronous concurrency: start synchronous if load is modest, "
        "but ensure DB operations are non-blocking when handling multiple concurrent user requests."
    )

    testing_strategy = (
        "Write PyTest / Vitest unit tests mocking external I/O, then verify end-to-end integration with a temporary test DB."
    )

    return ProjectMentorResponse(
        project_name=proj,
        milestone=milestone,
        architecture_overview=overview,
        implementation_steps=steps,
        code_starter_snippet=starter_code,
        key_tradeoffs=tradeoffs,
        testing_strategy=testing_strategy,
        is_ai_generated=False
    )


def generate_milestone_tutor(req: MilestoneTutorRequest) -> MilestoneTutorResponse:
    """
    Interactive AI Tutor for a specific roadmap milestone.
    Supports Explain, Revision Notes, Flashcards, Practice, Quiz, and Custom Queries.
    Uses Google Gemini with deterministic domain-tailored fallbacks.
    """
    domain = req.domain or "Technology"
    role = req.role_title or "Professional"
    milestone = req.milestone_title
    action = (req.action or "explain").lower()
    user_query = req.query or ""

    client = get_gemini_client()
    if client:
        try:
            if action == "flashcards":
                prompt = (
                    f"You are an expert mentor for a student targeting the role '{role}' in the '{domain}' domain.\n"
                    f"Create 4 high-yield active recall flashcards for the milestone: '{milestone}'.\n"
                    "Output JSON with a 'flashcards' list containing objects with 'front' (question/prompt) and 'back' (concise clear answer).\n"
                    "Also include a 'summary' string summarizing the topic."
                )
                raw = call_gemini(prompt, json_mode=True, temperature=0.3)
                if raw:
                    data = json.loads(raw)
                    f_cards = [
                        FlashcardItem(front=item.get("front", ""), back=item.get("back", ""))
                        for item in data.get("flashcards", [])
                        if item.get("front") and item.get("back")
                    ]
                    if f_cards:
                        return MilestoneTutorResponse(
                            milestone_title=milestone,
                            role_title=role,
                            domain=domain,
                            action=action,
                            content=data.get("summary", f"Key recall flashcards for {milestone}"),
                            flashcards=f_cards,
                            key_takeaways=[fc.front for fc in f_cards[:3]],
                            is_ai_generated=True,
                        )
            elif action == "quiz":
                prompt = (
                    f"You are a senior assessment architect for '{role}' in '{domain}'.\n"
                    f"Generate a 3-question diagnostic MCQ quiz for the milestone: '{milestone}'.\n"
                    "Return a JSON object with a 'quiz' key containing 3 items, each with:\n"
                    "- 'question': string\n"
                    "- 'options': list of exactly 4 string options\n"
                    "- 'correct_index': integer (0 to 3)\n"
                    "- 'explanation': string explaining why the answer is correct\n"
                )
                raw = call_gemini(prompt, json_mode=True, temperature=0.3)
                if raw:
                    data = json.loads(raw)
                    q_items = [
                        QuizItem(
                            question=q.get("question", ""),
                            options=q.get("options", []),
                            correct_index=int(q.get("correct_index", 0)),
                            explanation=q.get("explanation", ""),
                        )
                        for q in data.get("quiz", [])
                        if q.get("question") and len(q.get("options", [])) == 4
                    ]
                    if q_items:
                        return MilestoneTutorResponse(
                            milestone_title=milestone,
                            role_title=role,
                            domain=domain,
                            action=action,
                            content=f"Diagnostic check questions for '{milestone}'.",
                            quiz=q_items,
                            key_takeaways=[q.question for q in q_items],
                            is_ai_generated=True,
                        )
            elif action in ("notes", "explain", "practice", "custom"):
                action_instructions = {
                    "explain": f"Explain the core concepts of '{milestone}' clearly for an aspiring {role}. Include real-world domain context, intuition/analogy, key principles, and common pitfalls.",
                    "notes": f"Create high-yield bulleted revision notes and a cheat sheet for '{milestone}' as required for a {role}. Use bolding, key formulas/rules, and structured hierarchy.",
                    "practice": f"Provide an authentic, domain-tailored practical exercise for '{milestone}' suitable for a {role} in {domain}. Include the problem statement, required inputs/constraints, a hint, and the recommended solution approach.",
                    "custom": f"The student asks: '{user_query}'. Answer thoroughly in the context of preparing for '{milestone}' as a {role}."
                }
                instruction = action_instructions.get(action, action_instructions["explain"])
                prompt = (
                    f"Domain: {domain}\n"
                    f"Target Career: {role}\n"
                    f"Milestone: {milestone}\n"
                    f"Task: {instruction}\n\n"
                    "Format your answer using clean, professional Markdown with clear headings and bullet points."
                )
                raw = call_gemini(prompt, temperature=0.3)
                if raw and len(raw.strip()) > 50:
                    takeaways = [
                        line.lstrip("-*# ").strip()
                        for line in raw.split("\n")
                        if line.strip().startswith(("-", "*", "1.", "2.", "3."))
                    ][:4]
                    return MilestoneTutorResponse(
                        milestone_title=milestone,
                        role_title=role,
                        domain=domain,
                        action=action,
                        content=raw.strip(),
                        key_takeaways=takeaways if takeaways else [f"Master core principles of {milestone}", f"Apply to real-world {role} workflows", "Avoid critical edge case mistakes"],
                        is_ai_generated=True,
                    )
        except Exception as e:
            logger.warning(f"Gemini milestone tutor call failed: {e}. Falling back to deterministic curriculum tutor.")

    return _build_fallback_milestone_tutor(milestone, role, domain, action, user_query)


def _build_fallback_milestone_tutor(
    milestone: str, role: str, domain: str, action: str, user_query: str
) -> MilestoneTutorResponse:
    """Deterministic, domain-grounded tutor fallback when offline or without API key."""
    if action == "flashcards":
        cards = [
            FlashcardItem(
                front=f"What is the foundational objective of '{milestone}' in {role} workflows?",
                back=f"To establish rigorous competency in {milestone}, adhering to industry-standard {domain} protocols, avoiding regressions, and producing verifiable deliverables."
            ),
            FlashcardItem(
                front=f"Which primary methodology or tool standard governs '{milestone}'?",
                back=f"Domain-standard frameworks applicable to {domain}, emphasizing precision, auditability, and benchmark compliance."
            ),
            FlashcardItem(
                front=f"What is the most frequent pitfall when executing '{milestone}'?",
                back=f"Rushing implementation without validating prerequisites, neglecting edge cases, or failing to document assumptions."
            ),
            FlashcardItem(
                front=f"How does mastery of '{milestone}' directly impact hiring or career progression?",
                back=f"It validates autonomous execution capability in {role} responsibilities and demonstrates readiness for senior technical or analytical reviews."
            ),
        ]
        return MilestoneTutorResponse(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action=action,
            content=f"4 active-recall flashcards for {milestone} ({role}).",
            flashcards=cards,
            key_takeaways=[c.front for c in cards[:3]],
            is_ai_generated=False,
        )

    if action == "quiz":
        quiz_items = [
            QuizItem(
                question=f"When initiating work on '{milestone}', which step must be performed first?",
                options=[
                    "Validate inputs, requirements, and prerequisite dependencies",
                    "Proceed immediately to deployment or final submission",
                    "Bypass validation to test in production",
                    "Delegate requirements gathering to external parties"
                ],
                correct_index=0,
                explanation="Always establish prerequisite conditions and input contracts before beginning domain-specific execution."
            ),
            QuizItem(
                question=f"In professional {domain} practice, how is success measured for '{milestone}'?",
                options=[
                    "By qualitative self-assessment only",
                    "By verifiable adherence to standards, rubrics, and accurate deliverables",
                    "By the speed of completion regardless of errors",
                    "By subjective preference"
                ],
                correct_index=1,
                explanation=f"Professional roles in {domain} demand objective compliance with established rubrics and benchmark standards."
            ),
            QuizItem(
                question=f"What is the primary risk mitigation strategy when handling complex '{milestone}' tasks?",
                options=[
                    "Assume default configurations are always optimal",
                    "Conduct iterative checkpoints and structured peer/rubric evaluations",
                    "Postpone testing until project termination",
                    "Omit error logging and recovery steps"
                ],
                correct_index=1,
                explanation="Iterative checkpoints with structured rubric evaluations surface defects early and guarantee career-grade outcomes."
            ),
        ]
        return MilestoneTutorResponse(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action=action,
            content=f"Diagnostic 3-question evaluation for '{milestone}'.",
            quiz=quiz_items,
            key_takeaways=[q.question for q in quiz_items],
            is_ai_generated=False,
        )

    if action == "notes":
        content = f"""# High-Yield Revision Notes: {milestone}

**Target Role:** {role} | **Domain:** {domain}

---

### 1. Executive Summary & Core Definitions
- **Milestone Focus:** `{milestone}` represents a critical competency node required for the `{role}` career track.
- **Industry Purpose:** Ensures standards-compliant execution, minimized defect rates, and reproducible results in professional `{domain}` environments.

### 2. Key Principles & Standards
- **Baseline Standards:** Adhere to verified domain frameworks (e.g., standard operating procedures, RFCs, statutory codes, or design specifications).
- **Quality Gates:** Every output must satisfy acceptance criteria prior to downstream handoff.
- **Traceability:** Maintain version control, clear change logs, and auditable working records.

### 3. Practical Workflow Checklist
1. **Scope & Discovery:** Review all constraints, input schemas, and expected outputs.
2. **Drafting / Prototyping:** Execute core calculations, designs, or code blocks in a sandbox environment.
3. **Verification:** Validate against edge cases, boundary parameters, and compliance checklists.
4. **Final Packaging:** Format the deliverable according to `{domain}` professional standards.

### 4. Top Pitfalls & Memory Aids
- ⚠️ *Do not skip prerequisite validation.*
- 💡 *Rule of Thumb:* If an assumption is undocumented, treat it as a potential point of failure during professional review.
- 🎯 *Interview / Exam Tip:* Be prepared to explain both the happy path and how you recover when inputs are malformed or non-compliant.
"""
        return MilestoneTutorResponse(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action=action,
            content=content,
            key_takeaways=[
                f"Adhere to {domain} industry quality gates",
                f"Validate all inputs before commencing {milestone} deliverables",
                "Ensure auditable documentation and edge-case handling"
            ],
            is_ai_generated=False,
        )

    if action == "practice":
        content = f"""# Practical Scenario Exercise: {milestone}

**Target Career:** {role} ({domain})

---

### Challenge Scenario
You are assigned as a junior-to-mid {role} at a fast-growing organization. A critical client or project requires immediate implementation of `{milestone}` under standard professional constraints.

### Task Objectives
1. Identify the 3 primary variables or factors that govern `{milestone}` in this context.
2. Draft a complete execution plan incorporating error handling, compliance checks, and deliverable handoff.
3. Formulate 2 unit or verification checks that prove your output meets industry expectations.

### Recommended Approach
- Begin with a requirements matrix detailing input specifications.
- Implement the baseline solution first, then optimize for speed, memory, or regulatory clarity.
- Document any trade-offs made during execution.
"""
        return MilestoneTutorResponse(
            milestone_title=milestone,
            role_title=role,
            domain=domain,
            action=action,
            content=content,
            key_takeaways=[
                "Define requirements matrix before executing",
                "Execute baseline solution before optimizing",
                "Validate against two independent verification checks"
            ],
            is_ai_generated=False,
        )

    # Default action: "explain" or "custom"
    title_suffix = f"Query: {user_query}" if user_query else f"Deep Dive: {milestone}"
    content = f"""# {title_suffix}

**Role:** {role} | **Domain:** {domain}

---

### What is {milestone}?
In the context of **{role}**, `{milestone}` represents a crucial technical and procedural milestone. Mastery of this concept separates entry-level candidates from job-ready practitioners by providing the foundation for reliable, scalable, and compliant deliverables.

### Why It Matters in {domain}
In the **{domain}** sector, professionals frequently face complex scenarios where deep understanding of `{milestone}` is needed to:
- Formulate defensible solutions backed by industry methodologies.
- Collaborate cross-functionally with senior reviewers, clients, and technical leads.
- Prevent costly rework, compliance violations, or production incidents.

### Core Mechanics & Workflow
1. **Input Contract:** Clarify the exact parameters, data structures, or legal/regulatory mandates.
2. **Execution Strategy:** Leverage domain-specific tools, algorithms, or frameworks.
3. **Quality Assurance:** Verify outputs with automated tests, peer reviews, or simulation runs.

### Pro-Tips for Job Interviews & Real Work
- Always articulate *why* you chose a specific tool or approach over plausible alternatives.
- Highlight your awareness of edge cases and performance or security trade-offs.
"""
    return MilestoneTutorResponse(
        milestone_title=milestone,
        role_title=role,
        domain=domain,
        action=action,
        content=content,
        key_takeaways=[
            f"Foundational role of {milestone} in {role} workflows",
            f"Adherence to {domain} industry standards",
            "Balancing execution speed with verification and quality"
        ],
        is_ai_generated=False,
    )

