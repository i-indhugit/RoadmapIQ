from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Base & Generic
# -------------------------------------------------------------
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


# -------------------------------------------------------------
# Skills & Prerequisites
# -------------------------------------------------------------
class SkillBase(BaseModel):
    slug: str
    name: str
    category: str
    description: str
    doc_url: str
    difficulty_level: str = "intermediate"
    assessment_method: str = "quiz"
    cost_type: str = "free"
    estimated_hours_beginner: int = 15
    estimated_hours_intermediate: int = 25
    estimated_hours_advanced: int = 35


class SkillOut(SkillBase):
    id: int
    prerequisites: List[str] = []
    model_config = ConfigDict(from_attributes=True)


class SkillPrerequisiteOut(BaseModel):
    skill_slug: str
    skill_name: str
    prerequisite_slug: str
    prerequisite_name: str
    is_strict: bool = True


# -------------------------------------------------------------
# Career Roles & Requirements
# -------------------------------------------------------------
class RoleRequirementOut(BaseModel):
    skill_id: int
    skill_slug: str
    skill_name: str
    category: str
    required_proficiency: int  # 0 to 5
    importance_weight: int     # 1 to 5
    is_core: bool
    doc_url: str
    prerequisites: List[str] = []


class CareerRoleSummary(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    domain: Optional[str] = "Technology and IT"
    subdomain: Optional[str] = None
    short_summary: str
    market_demand: str
    average_salary_range: str
    icon: str
    is_active: bool
    required_education: Optional[List[str]] = []
    eligibility_requirements: Optional[str] = None
    tools_and_technologies: Optional[List[str]] = []
    core_competencies: Optional[List[str]] = []
    is_regulated_profession: Optional[bool] = False
    regulatory_disclaimer: Optional[str] = None
    daily_responsibilities: Optional[List[str]] = []
    career_progression: Optional[List[str]] = []
    model_config = ConfigDict(from_attributes=True)


class CareerRoleDetail(CareerRoleSummary):
    description: str
    requirements: List[RoleRequirementOut] = []
    recommended_skills: List[RoleRequirementOut] = []
    suggested_projects: List[Any] = []
    interview_topics: List[str] = []


# -------------------------------------------------------------
# Student Profile
# -------------------------------------------------------------
class ProfileBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    education_level: str = Field(..., max_length=100)
    educational_field: str = Field("Engineering / Technology", max_length=100)
    degree_specialization: str = Field(..., max_length=150)
    current_status: str = Field("student", max_length=50)  # student, fresher, employed, unemployed, career_switcher
    current_role: Optional[str] = Field(None, max_length=100)
    current_experience_level: str = Field("Beginner", max_length=50)
    target_role_id: Optional[int] = None
    weekly_study_hours: int = Field(15, ge=3, le=60)
    target_duration_weeks: int = Field(12, ge=2, le=52)
    preferred_learning_format: str = Field("mixed", max_length=50)
    learning_budget: str = Field("free_only", max_length=50)
    preferred_language: str = Field("en", max_length=20)
    placement_deadline: Optional[str] = None
    skills_assessment: Dict[str, int] = Field(default_factory=dict)  # {"slug": 0-5}
    assessed_skills: Dict[str, Any] = Field(default_factory=dict)
    xp: int = 100
    level: int = 1
    streak_days: int = 1
    badges: List[Dict[str, Any]] = Field(default_factory=list)
    avatar_style: str = "cyber_nomad"
    avatar_checkpoint_id: Optional[str] = None
    journey_settings: Dict[str, Any] = Field(default_factory=dict)
    ai_enabled: bool = True


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    education_level: Optional[str] = None
    educational_field: Optional[str] = None
    degree_specialization: Optional[str] = None
    current_status: Optional[str] = None
    current_role: Optional[str] = None
    current_experience_level: Optional[str] = None
    target_role_id: Optional[int] = None
    weekly_study_hours: Optional[int] = Field(None, ge=3, le=60)
    target_duration_weeks: Optional[int] = Field(None, ge=2, le=52)
    preferred_learning_format: Optional[str] = None
    learning_budget: Optional[str] = None
    preferred_language: Optional[str] = None
    placement_deadline: Optional[str] = None
    skills_assessment: Optional[Dict[str, int]] = None
    assessed_skills: Optional[Dict[str, Any]] = None
    avatar_style: Optional[str] = None
    avatar_checkpoint_id: Optional[str] = None
    journey_settings: Optional[Dict[str, Any]] = None
    ai_enabled: Optional[bool] = None


class ProfileResponse(ProfileBase):
    id: int
    target_role: Optional[CareerRoleSummary] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SetTargetCareerRequest(BaseModel):
    profile_id: Optional[int] = None
    role_id: Optional[int] = None
    career_slug: Optional[str] = None
    career_goals: Optional[str] = None
    target_duration_weeks: Optional[int] = 12
    weekly_study_hours: Optional[int] = 15
    preferred_learning_format: Optional[str] = "mixed"


class SavedCareerItem(BaseModel):
    id: int
    title: str
    domain: Optional[str] = None
    slug: Optional[str] = None
    saved_at: Optional[str] = None


# -------------------------------------------------------------
# Skill Gap Analysis
# -------------------------------------------------------------
class SkillGapItem(BaseModel):
    skill_id: int
    skill_slug: str
    skill_name: str
    category: str
    category_type: str = "technical"  # "technical" or "non_technical"
    current_proficiency: int  # 0 to 5
    required_proficiency: int  # 1 to 5
    importance_weight: int     # 1 to 5
    is_core: bool
    status: str  # "met", "needs_improvement", "missing", "blocked"
    is_transferable: bool = False
    is_verified_assessment: bool = False
    recommendation_reason: str = ""
    unmet_prerequisites: List[str] = []
    doc_url: str
    estimated_hours_to_bridge: int


class SkillGapAnalysisResponse(BaseModel):
    role_id: int
    role_title: str
    readiness_score: float
    readiness_formula: str = "100 * sum(weights * min(curr_prof / req_prof, 1.0)) / sum(weights)"
    total_skills_count: int
    met_count: int
    needs_improvement_count: int
    missing_count: int
    blocked_count: int
    technical_gaps: List[SkillGapItem] = []
    non_technical_gaps: List[SkillGapItem] = []
    transferable_strengths: List[SkillGapItem] = []
    high_priority_gaps: List[SkillGapItem] = []
    skills_requiring_assessment: List[SkillGapItem] = []
    gaps: List[SkillGapItem] = []
    total_estimated_effort_hours: int = 0
    disclaimer: str = (
        "RoadmapIQ readiness scores represent an estimated baseline based on your self-reported skills, "
        "assessment results, and standard job requirements. They are not a guarantee of employment or placement."
    )


# -------------------------------------------------------------
# Learning Resources
# -------------------------------------------------------------
class ResourceOut(BaseModel):
    id: int
    skill_id: int
    skill_slug: Optional[str] = None
    skill_name: Optional[str] = None
    title: str
    provider: str
    url: str
    format: str
    difficulty: str
    is_free: bool
    cost_info: Optional[str] = "100% Free Access"
    description: str
    rating: float
    is_bookmarked: bool = False
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Roadmap & Tasks
# -------------------------------------------------------------
class TaskResourceOut(BaseModel):
    id: int
    title: str
    url: str
    provider: str
    format: str
    model_config = ConfigDict(from_attributes=True)


class TaskOut(BaseModel):
    id: int
    roadmap_id: int
    skill_id: Optional[int] = None
    phase_number: int = 1
    phase_name: str = "Phase 1: Foundations"
    week_number: int
    order_in_week: int
    day_of_week: Optional[str] = "Monday"
    day_number: Optional[int] = 1
    activity_category: Optional[str] = "LEARN"
    practice_exercises: Optional[List[str]] = []
    quiz_data: Optional[List[Dict[str, Any]]] = []
    coding_challenge: Optional[Dict[str, Any]] = None
    title: str
    skill_category: str
    task_type: str
    description: str
    estimated_hours: int
    actual_hours_spent: float = 0.0
    priority: str
    status: str = "not_started"
    is_completed: bool
    completed_at: Optional[datetime] = None
    completion_criteria: str
    deliverable: Optional[str] = None
    evidence_link: Optional[str] = None
    prerequisite_skill_ids: List[int] = Field(default_factory=list)
    prerequisite_titles: List[str] = Field(default_factory=list)
    xp_reward: int = 50
    mission_title: Optional[str] = None
    activity_method: Optional[str] = "theory"
    specialization_branch: Optional[str] = None
    workspace_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    resources: List[TaskResourceOut] = []
    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    is_completed: Optional[bool] = None
    status: Optional[str] = None  # "not_started", "in_progress", "completed"
    actual_hours_spent: Optional[float] = None
    evidence_link: Optional[str] = None


class RoadmapGenerateRequest(BaseModel):
    profile_id: Optional[int] = None
    role_id: int
    weekly_hours: int = Field(15, ge=3, le=60)
    target_duration_weeks: int = Field(12, ge=2, le=52)
    preferred_format: str = "mixed"
    skills_assessment: Dict[str, int] = Field(default_factory=dict)
    ai_enabled: Optional[bool] = True


class RoadmapSwitchRequest(BaseModel):
    role_id: int
    profile_id: Optional[int] = None
    weekly_hours: Optional[int] = Field(15, ge=3, le=60)
    target_duration_weeks: Optional[int] = Field(12, ge=2, le=52)
    preferred_format: Optional[str] = "mixed"
    skills_assessment: Optional[Dict[str, int]] = Field(default_factory=dict)
    force_regenerate: Optional[bool] = False


class RoadmapRescheduleRequest(BaseModel):
    roadmap_id: int
    new_weekly_hours: Optional[int] = Field(None, ge=3, le=60)
    new_duration_weeks: Optional[int] = Field(None, ge=2, le=52)


class SpecializationSwitchRequest(BaseModel):
    specialization_branch: str
    specialization_id: Optional[str] = None


class RoadmapOut(BaseModel):
    id: int
    profile_id: int
    role_id: int
    role_title: Optional[str] = None
    target_duration_weeks: int
    weekly_hours: int
    readiness_score: float
    total_estimated_hours: int
    is_over_capacity: bool
    capacity_warning: Optional[str] = None
    summary: Optional[str] = None
    ai_advice: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tasks_count: int = 0
    completed_tasks_count: int = 0
    tasks: Optional[List[TaskOut]] = None
    model_config = ConfigDict(from_attributes=True)


class RoadmapProgressOut(BaseModel):
    roadmap_id: int
    readiness_score: float
    completion_percentage: float
    completed_tasks: int
    total_tasks: int
    completed_hours: float
    total_hours: float
    skills_mastered_count: int
    streak_days: int
    weekly_progress: List[Dict[str, Any]] = []


# -------------------------------------------------------------
# Projects & Interview Preparation
# -------------------------------------------------------------
class ProjectOut(BaseModel):
    id: int
    role_id: Optional[int] = None
    name: str
    slug: str
    problem_statement: str
    skills_covered: List[str]
    difficulty: str
    estimated_hours: int
    suggested_tech_stack: List[str]
    milestones: List[str]
    evaluation_criteria: List[str]
    deliverables: List[str] = []
    portfolio_presentation_tips: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class InterviewQuestionOut(BaseModel):
    id: int
    role_id: Optional[int] = None
    category: str
    title: str
    question: str
    sample_answer: str
    difficulty: str
    key_points: List[str] = []
    is_completed: bool
    is_bookmarked: bool
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Assessment Quiz
# -------------------------------------------------------------
class QuizQuestionOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    question: str
    options: List[str]
    difficulty: str


class QuizSubmitRequest(BaseModel):
    skill_id: int
    profile_id: Optional[int] = None
    answers: Dict[int, int]  # question_id -> chosen option index
    evidence_link: Optional[str] = None


class QuizResultResponse(BaseModel):
    skill_id: int
    skill_name: str
    total_questions: int
    correct_count: int
    score_percentage: float
    assessed_proficiency_level: int  # 0 to 5
    proficiency_label: str
    feedback: str
    explanations: List[Dict[str, Any]] = []


# -------------------------------------------------------------
# Career Comparison
# -------------------------------------------------------------
class CareerComparisonRequest(BaseModel):
    role_ids: List[int] = Field(..., min_length=2, max_length=3)
    skills_assessment: Optional[Dict[str, int]] = None


class CareerComparisonItem(BaseModel):
    role_id: int
    role_title: str
    category: str
    readiness_score: float
    total_required_skills: int
    missing_skills_count: int
    estimated_learning_hours: int
    market_demand: str
    salary_range: str
    required_skill_names: List[str]
    typical_projects: List[str]


class CareerComparisonResponse(BaseModel):
    compared_roles: List[CareerComparisonItem]
    shared_skills: List[str]
    unique_skills_by_role: Dict[str, List[str]]
    transferable_skills: List[str]
    recommendation_summary: str


# -------------------------------------------------------------
# AI & RAG Schemas
# -------------------------------------------------------------
class AIStatusResponse(BaseModel):
    enabled: bool
    available: bool
    provider: str
    model: str
    message: str


class AIExplainRequest(BaseModel):
    topic: str
    context: Optional[str] = None
    target_role: Optional[str] = None
    learning_format: Optional[str] = "mixed"


class AIExplainResponse(BaseModel):
    topic: str
    explanation: str
    why_important: str
    study_strategy: str
    interview_tip: str
    is_ai_generated: bool = True


class AIRoadmapAdviceRequest(BaseModel):
    roadmap_id: Optional[int] = None
    role_title: str
    readiness_score: float
    target_duration_weeks: int
    weekly_hours: int
    top_gaps: Optional[List[str]] = None


class AIRoadmapAdviceResponse(BaseModel):
    role_title: str
    readiness_score: float
    executive_summary: str
    weekly_pacing_strategy: str
    high_priority_focus_areas: List[str]
    potential_bottlenecks: List[str]
    placement_tips: List[str]
    is_ai_generated: bool = True


class RAGQueryRequest(BaseModel):
    query: str
    target_role: Optional[str] = None
    domain: Optional[str] = None
    milestone_title: Optional[str] = None
    category: Optional[str] = None
    country_jurisdiction: Optional[str] = None
    profile_id: Optional[int] = None
    current_skills: Optional[List[str]] = None
    preferred_format: Optional[str] = "mixed"
    budget: Optional[str] = "free_only"
    top_k: Optional[int] = 5


class RAGRetrievedSource(BaseModel):
    title: str
    provider: str
    url: str
    format: str = "documentation"
    relevance_score: float
    skill_name: Optional[str] = None
    difficulty: Optional[str] = None
    is_free: bool = True
    cost_info: Optional[str] = "Free"
    domain: Optional[str] = None
    category: Optional[str] = None
    country_jurisdiction: Optional[str] = None
    section_reference: Optional[str] = None
    page_number: Optional[int] = None
    snippet: Optional[str] = None
    chunk_id: Optional[int] = None


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[RAGRetrievedSource] = []
    has_relevant_sources: bool = True
    context_skills_identified: List[str] = []
    confidence_score: Optional[float] = 0.85
    is_grounded_in_rag: bool = True
    domain_identified: Optional[str] = None


class DocumentIngestRequest(BaseModel):
    title: str
    provider: str = "Official Curriculum"
    source_url: str
    content: str
    file_type: Optional[str] = "text"  # "text", "markdown", "html", "pdf", "docx"
    career_domain: str
    career_role_title: Optional[str] = None
    category: Optional[str] = "learning_materials"
    related_skills: Optional[List[str]] = []
    related_topics: Optional[List[str]] = []
    difficulty: Optional[str] = "intermediate"
    country_jurisdiction: Optional[str] = "Global"
    access_type: Optional[str] = "free_open"


class DocumentIngestResponse(BaseModel):
    document_id: int
    title: str
    chunk_count: int
    status: str
    message: str


class DocumentListItem(BaseModel):
    id: int
    title: str
    provider: str
    source_url: str
    career_domain: str
    career_role_title: Optional[str] = None
    category: str
    chunk_count: int
    difficulty: str
    country_jurisdiction: Optional[str] = "Global"
    ingestion_status: str
    created_at: Optional[str] = None


class KnowledgeAdminStats(BaseModel):
    total_documents: int
    total_chunks: int
    domains_covered: int
    categories_breakdown: Dict[str, int]
    domain_distribution: Dict[str, int]


class MilestoneRAGRequest(BaseModel):
    milestone_title: str
    role_title: str
    domain: Optional[str] = "Technology"
    action: Optional[str] = "bundle"  # "bundle", "explain", "notes", "quiz", "flashcards", "practice", "projects"
    level: Optional[str] = "intermediate"
    query: Optional[str] = None
    profile_id: Optional[int] = None


class RAGQuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    source_citation: Optional[str] = None


class RAGFlashcard(BaseModel):
    front: str
    back: str
    topic: str
    source_title: Optional[str] = None


class MilestoneRAGResponse(BaseModel):
    milestone_title: str
    role_title: str
    domain: str
    action: str
    concept_explanation: str
    study_notes: List[str]
    practical_examples: List[str]
    flashcards: List[RAGFlashcard] = []
    quiz: List[RAGQuizQuestion] = []
    practice_exercises: List[str] = []
    project_guidance: List[str] = []
    sources: List[RAGRetrievedSource] = []
    is_grounded: bool = True
    disclaimer: Optional[str] = None


class ProjectMentorRequest(BaseModel):
    project_id: Optional[int] = None
    project_name: str
    target_role: Optional[str] = None
    milestone_index: Optional[int] = None
    milestone_text: str
    tech_stack: Optional[List[str]] = None


class ProjectMentorResponse(BaseModel):
    project_name: str
    milestone: str
    architecture_overview: str
    implementation_steps: List[str]
    code_starter_snippet: Optional[str] = None
    key_tradeoffs: str
    testing_strategy: str
    is_ai_generated: bool = True


class InterviewFeedbackRequest(BaseModel):
    question_id: Optional[int] = None
    question_title: Optional[str] = "Interview Question"
    question_text: str
    student_answer: str
    target_role: Optional[str] = None


class InterviewFeedbackResponse(BaseModel):
    score: int
    strengths: List[str]
    areas_for_improvement: List[str]
    model_answer_comparison: str
    follow_up_questions: List[str]
    is_ai_generated: bool = True


class WeeklyPlannerAIRequest(BaseModel):
    role_title: str
    weekly_hours: int = 15
    target_duration_weeks: int = 12
    current_week: int = 1
    tasks: Optional[List[Dict[str, Any]]] = None


class WeeklyDayPlan(BaseModel):
    day: str
    focus_topic: str
    hours_allocated: float
    recommended_activity: str


class WeeklyPlannerAIResponse(BaseModel):
    role_title: str
    weekly_hours: int
    daily_schedule: List[WeeklyDayPlan]
    pacing_advice: str
    is_ai_generated: bool = True


class AIProjectItem(BaseModel):
    title: str
    difficulty: str  # Beginner, Intermediate, Advanced
    description: str
    tech_stack: List[str]
    deliverable: str
    learning_outcomes: List[str]


class AIProjectRecommendationRequest(BaseModel):
    role_title: str
    experience_level: Optional[str] = "Beginner"
    skills: Optional[List[str]] = None


class AIProjectRecommendationResponse(BaseModel):
    role_title: str
    projects: List[AIProjectItem]
    is_ai_generated: bool = True


class AIInterviewQuestionItem(BaseModel):
    question: str
    category: str  # Technical, Scenario, Behavioral, System Design
    difficulty: str  # Beginner, Intermediate, Advanced
    model_answer: str
    key_concepts: List[str]


class AIInterviewGenRequest(BaseModel):
    role_title: str
    category: Optional[str] = "technical"
    difficulty: Optional[str] = "intermediate"


class AIInterviewGenResponse(BaseModel):
    role_title: str
    questions: List[AIInterviewQuestionItem]
    is_ai_generated: bool = True


class GeminiTestResponse(BaseModel):
    status: str
    model: str
    message: str
    api_key_configured: bool = False
    response_snippet: Optional[str] = None
    response_text: Optional[str] = None
    latency_ms: Optional[float] = None


class FlashcardItem(BaseModel):
    front: str
    back: str


class QuizItem(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str


class MilestoneTutorRequest(BaseModel):
    milestone_title: str
    role_title: str
    domain: Optional[str] = "Technology"
    action: str = "explain"  # "explain", "notes", "flashcards", "practice", "quiz", "custom"
    query: Optional[str] = None
    level: Optional[str] = "intermediate"
    profile_id: Optional[int] = None


class MilestoneTutorResponse(BaseModel):
    milestone_title: str
    role_title: str
    domain: str
    action: str
    content: str
    flashcards: Optional[List[FlashcardItem]] = None
    quiz: Optional[List[QuizItem]] = None
    key_takeaways: Optional[List[str]] = None
    sources: Optional[List[RAGRetrievedSource]] = []
    is_grounded_in_rag: Optional[bool] = True
    is_ai_generated: bool = True



# -------------------------------------------------------------
# Gamification & Skill Tree Schemas
# -------------------------------------------------------------
class GamificationStatusOut(BaseModel):
    xp: int
    level: int
    level_title: str
    next_level_xp: int
    level_progress_pct: float
    streak_days: int
    badges: List[Dict[str, Any]] = []
    missions_completed: int = 0
    skills_unlocked: int = 0
    daily_challenge_done_today: bool = False


class DailyChallengeOut(BaseModel):
    id: int
    career_slug: Optional[str] = None
    category: str
    title: str
    description: str
    difficulty: str
    time_estimate_mins: int
    instructions: str
    starter_prompt: Optional[str] = None
    xp_reward: int = 75
    is_completed_today: bool = False


class DailyChallengeSubmitRequest(BaseModel):
    challenge_id: int
    profile_id: Optional[int] = None
    solution_text: str


class DailyChallengeSubmitResponse(BaseModel):
    challenge_id: int
    success: bool
    xp_earned: int
    total_xp: int
    feedback: str


class SkillTreeNode(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    status: str  # "locked", "available", "in_progress", "completed", "needs_reassessment"
    current_proficiency: int
    required_proficiency: int
    importance_weight: int
    estimated_hours: int
    description: str
    doc_url: str
    level: int = 1
    unmet_prerequisites: List[str] = []
    all_prerequisites: List[str] = []


class SkillTreeEdge(BaseModel):
    source: str
    target: str
    is_strict: bool = True


class SkillTreeResponse(BaseModel):
    nodes: List[SkillTreeNode]
    edges: List[SkillTreeEdge]
    role_title: str
    readiness_score: float
    unlocked_count: int
    total_count: int


# -------------------------------------------------------------
# Premium Gamified RPG Engine Schemas
# -------------------------------------------------------------
class XPTransactionOut(BaseModel):
    id: int
    profile_id: int
    amount: int
    source_type: str
    source_id: str
    description: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AchievementOut(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    category: str
    xp_reward: int
    icon: str
    badge_color: str
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class BossBattleOut(BaseModel):
    id: int
    slug: str
    title: str
    boss_name: str
    boss_title: str
    category: str
    difficulty: str
    health_points: int
    required_level: int
    xp_reward: int
    badge_slug: str
    passing_score: float
    description: str
    phases: List[Dict[str, Any]]
    is_defeated: bool = False
    best_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)


class BossBattleSubmitRequest(BaseModel):
    profile_id: Optional[int] = None
    answers: Dict[str, int] = {}  # "phase_1": selected_option_idx


class BossBattleSubmitResponse(BaseModel):
    boss_id: int
    score_percentage: float
    passed: bool
    xp_awarded: int
    total_xp: int
    boss_health_remaining: int
    feedback: str
    badge_unlocked: Optional[str] = None


class ArenaChallengeOut(BaseModel):
    id: int
    slug: str
    arena_type: str
    title: str
    difficulty: str
    time_limit_mins: int
    xp_reward: int
    problem_statement: str
    starter_code: Optional[str] = None
    hints: List[str] = []
    is_completed: bool = False
    best_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)


class ArenaSubmitRequest(BaseModel):
    profile_id: Optional[int] = None
    submission_text: str
    time_spent_secs: int = 0


class ArenaSubmitResponse(BaseModel):
    challenge_id: int
    passed: bool
    score: float
    xp_awarded: int
    total_xp: int
    feedback: str
    rubric_evaluation: Optional[Dict[str, Any]] = None


class LeaderboardEntryOut(BaseModel):
    rank: int
    display_name: str
    gamer_handle: Optional[str] = None
    level: int
    level_title: str
    total_xp: int
    streak_days: int
    badges_count: int
    is_current_user: bool = False


class CareerReadinessBreakdown(BaseModel):
    overall_score: float
    skill_competency_score: float
    coding_dsa_score: float
    aptitude_score: float
    project_deliverables_score: float
    interview_performance_score: float
    summary: str
    is_ready_for_placement: bool


class PlayerProfileDetailedOut(BaseModel):
    id: int
    display_name: str
    gamer_handle: Optional[str] = None
    level: int
    level_title: str
    total_xp: int
    next_level_xp: int
    level_progress_pct: float
    streak_days: int
    target_role_title: Optional[str] = None
    skills_mastered_count: int
    total_required_skills: int
    achievements: List[AchievementOut] = []
    recent_xp_transactions: List[XPTransactionOut] = []
    career_readiness: CareerReadinessBreakdown
    leaderboard_opt_in: bool = True


class QuestItemOut(BaseModel):
    task_id: int
    roadmap_id: int
    title: str
    quest_type: str
    skill_name: Optional[str] = None
    phase_name: str
    week_number: int
    difficulty: str
    estimated_hours: int
    xp_reward: int
    description: str
    completion_criteria: str
    deliverable: Optional[str] = None
    evidence_link: Optional[str] = None
    status: str
    is_completed: bool
    resources: List[Dict[str, Any]] = []


# -------------------------------------------------------------
# Career-Based Skill Assessment Schemas
# -------------------------------------------------------------
class CareerOverviewOut(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    domain: Optional[str] = "Technology and IT"
    subdomain: Optional[str] = None
    description: str
    short_summary: str
    market_demand: str
    average_salary_range: str
    icon: str
    is_regulated_profession: Optional[bool] = False
    regulatory_disclaimer: Optional[str] = None
    required_education: Optional[List[str]] = []
    tools_and_technologies: List[str] = []
    core_competencies: List[str] = []
    assessment_duration_mins: int = 30
    assessment_question_count: int = 25
    difficulty_distribution: Dict[str, Any] = {}
    skills: List[Dict[str, Any]] = []
    model_config = ConfigDict(from_attributes=True)


class CareerAssessmentQuestionStudentOut(BaseModel):
    id: int
    category: str
    question_type: str
    difficulty: str
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    marks: int = 1


class StartAssessmentRequest(BaseModel):
    career_id_or_slug: str
    profile_id: Optional[int] = None
    question_count: Optional[int] = 25
    difficulty: Optional[str] = "adaptive"
    duration_mins: Optional[int] = 30


class StartAssessmentResponse(BaseModel):
    attempt_id: int
    role_id: int
    role_slug: str
    role_title: str
    duration_mins: int
    total_questions: int
    questions: List[CareerAssessmentQuestionStudentOut]
    saved_answers: Dict[str, Any] = {}
    review_flags: List[int] = []
    started_at: datetime


class SaveAssessmentAnswersRequest(BaseModel):
    answers: Dict[str, Any] = {}
    review_flags: List[int] = []
    time_spent_secs: Optional[int] = 0


class SubmitAssessmentRequest(BaseModel):
    answers: Dict[str, Any] = {}
    time_spent_secs: int = 0


class QuestionEvaluationOut(BaseModel):
    id: int
    category: str
    difficulty: str
    question_type: str
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    user_choice: Optional[int] = None
    correct_choice: int
    is_correct: bool
    explanation: str
    marks: int


class AssessmentResultOut(BaseModel):
    attempt_id: int
    role_id: int
    role_title: str
    total_questions: int
    answered_count: int
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    total_marks_earned: int
    total_possible_marks: int
    score_percentage: float
    proficiency_level: str
    category_scores: Dict[str, Any]
    difficulty_scores: Dict[str, Any]
    question_details: List[QuestionEvaluationOut] = []
    evaluated_at: datetime


class SkillGapItemOut(BaseModel):
    skill_name: str
    category: str
    required_level: str
    assessed_level: str
    score_percentage: float
    gap_level: str
    gap_status: str
    priority: int
    confidence: str
    is_core: bool = True


class SkillGapReportOut(BaseModel):
    attempt_id: int
    role_id: int
    role_title: str
    readiness_score: float
    skills_table: List[SkillGapItemOut]
    strong_skills: List[str] = []
    needs_improvement_skills: List[str] = []
    missing_skills: List[str] = []
    critical_gaps: List[str] = []
    recommended_priorities: List[Dict[str, Any]] = []
    ai_gap_explanation: Optional[str] = None
    ai_learning_topics: List[str] = []
    created_at: datetime


class GenerateRoadmapFromAssessmentRequest(BaseModel):
    attempt_id: int
    weekly_hours: int = 15
    duration_weeks: int = 12


class AssessmentAttemptSummaryOut(BaseModel):
    id: int
    role_id: int
    role_title: str
    status: str
    score_percentage: Optional[float] = None
    proficiency_level: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_spent_secs: int = 0
