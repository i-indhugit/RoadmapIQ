from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False, default="Student")
    is_active = Column(Boolean, default=True, nullable=False)
    is_guest = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, unique=True, index=True)
    display_name = Column(String(100), nullable=False)
    education_level = Column(String(100), nullable=False)  # "Undergraduate - Final Year", "Pre-final Year", "Recent Graduate", "Self-Taught", etc.
    educational_field = Column(String(100), nullable=False, default="Engineering / Technology")  # "Commerce", "Arts & Humanities", "Business Administration", "Engineering / Technology", "Natural Sciences", "Other"
    degree_specialization = Column(String(150), nullable=False)  # e.g., "B.Com Accounting", "B.Tech Computer Science", "BA English Literature"
    current_status = Column(String(50), nullable=False, default="student")  # "student", "fresher", "employed", "unemployed", "career_switcher"
    current_role = Column(String(100), nullable=True)  # e.g. "Customer Support Associate", "Accountant", "Sales Representative", "Student"
    current_experience_level = Column(String(50), nullable=False, default="Beginner")  # "Beginner", "Basic Working Knowledge", "Intermediate", "Experienced Professional"
    target_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    educational_stream = Column(String(100), nullable=True, default="Engineering / Technology")
    graduation_status = Column(String(50), nullable=True, default="Pursuing")
    work_experience_years = Column(Float, nullable=False, default=0.0)
    areas_of_interest = Column(JSON, nullable=False, default=list)
    preferred_learning_style = Column(String(50), nullable=False, default="visual_practical")
    career_goals = Column(Text, nullable=True)
    weekly_study_hours = Column(Integer, nullable=False, default=15)
    target_duration_weeks = Column(Integer, nullable=False, default=12)
    preferred_learning_format = Column(String(50), nullable=False, default="mixed")  # "video", "documentation", "practice", "mixed"
    learning_budget = Column(String(50), nullable=False, default="free_only")  # "free_only", "budget_under_50", "flexible"
    preferred_language = Column(String(20), nullable=False, default="en")
    placement_deadline = Column(String(50), nullable=True)  # YYYY-MM-DD or descriptive
    skills_assessment = Column(JSON, nullable=False, default=dict)  # {"skill_slug": proficiency (0 to 5)}
    assessed_skills = Column(JSON, nullable=False, default=dict)  # {"skill_slug": {"level": 3, "verified": True, "score": 85, "evidence_link": "..."}}
    xp = Column(Integer, nullable=False, default=100)
    level = Column(Integer, nullable=False, default=1)
    streak_days = Column(Integer, nullable=False, default=1)
    longest_streak = Column(Integer, nullable=False, default=1)
    last_active_date = Column(String(20), nullable=True)
    weekly_streak_count = Column(Integer, nullable=False, default=0)
    longest_weekly_streak = Column(Integer, nullable=False, default=0)
    weekly_goal_type = Column(String(50), nullable=False, default="days_per_week")  # "days_per_week", "activities_per_week", "hours_per_week"
    weekly_goal_target = Column(Integer, nullable=False, default=5)
    timezone = Column(String(50), nullable=False, default="UTC")
    badges = Column(JSON, nullable=False, default=list)
    daily_challenge_completed_date = Column(String(20), nullable=True)
    leaderboard_opt_in = Column(Boolean, nullable=False, default=True)
    gamer_handle = Column(String(50), nullable=True)
    avatar_style = Column(String(50), nullable=False, default="cyber_nomad")
    avatar_checkpoint_id = Column(String(50), nullable=True)
    journey_settings = Column(JSON, nullable=False, default=dict)
    ai_enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="student_profile")
    target_role = relationship("CareerRole", back_populates="student_profiles")
    roadmaps = relationship("Roadmap", back_populates="student_profile", cascade="all, delete-orphan")
    snapshots = relationship("ProgressSnapshot", back_populates="student_profile", cascade="all, delete-orphan")
    bookmarks = relationship("ResourceBookmark", back_populates="student_profile", cascade="all, delete-orphan")
    assessment_results = relationship("SkillAssessmentResult", back_populates="student_profile", cascade="all, delete-orphan")
    xp_transactions = relationship("XPTransaction", back_populates="student_profile", cascade="all, delete-orphan")
    student_achievements = relationship("StudentAchievement", back_populates="student_profile", cascade="all, delete-orphan")
    boss_attempts = relationship("BossBattleAttempt", back_populates="student_profile", cascade="all, delete-orphan")
    arena_attempts = relationship("ArenaAttempt", back_populates="student_profile", cascade="all, delete-orphan")
    career_assessment_attempts = relationship("CareerAssessmentAttempt", back_populates="student_profile", cascade="all, delete-orphan")
    daily_activities = relationship("DailyActivityLog", back_populates="student_profile", cascade="all, delete-orphan")
    weekly_goals = relationship("WeeklyGoalRecord", back_populates="student_profile", cascade="all, delete-orphan")
    reassessment_comparisons = relationship("CareerReassessmentComparison", back_populates="student_profile", cascade="all, delete-orphan")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # "Software Engineering", "Data & AI", "Business & Product", "Marketing & Creative", "Human Resources", "Finance & Operations"
    domain = Column(String(100), nullable=False, default="Technology and IT", index=True)
    subdomain = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    short_summary = Column(String(255), nullable=False)
    daily_responsibilities = Column(JSON, nullable=False, default=list)
    required_education = Column(JSON, nullable=False, default=list)
    eligibility_requirements = Column(Text, nullable=True)
    optional_qualifications = Column(JSON, nullable=False, default=list)
    preferred_skills = Column(JSON, nullable=False, default=list)
    soft_skills = Column(JSON, nullable=False, default=list)
    certifications_or_exams = Column(JSON, nullable=False, default=list)
    career_progression = Column(JSON, nullable=False, default=list)
    is_regulated_profession = Column(Boolean, nullable=False, default=False)
    regulatory_disclaimer = Column(Text, nullable=True)
    market_demand = Column(String(50), default="High")
    average_salary_range = Column(String(100), default="₹6 - 16 LPA")
    icon = Column(String(50), default="Briefcase")
    is_active = Column(Boolean, default=True)
    tools_and_technologies = Column(JSON, nullable=False, default=list)
    core_competencies = Column(JSON, nullable=False, default=list)
    assessment_duration_mins = Column(Integer, nullable=False, default=30)
    assessment_question_count = Column(Integer, nullable=False, default=25)
    difficulty_distribution = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profiles = relationship("StudentProfile", back_populates="target_role")
    skill_requirements = relationship("RoleSkillRequirement", back_populates="career_role", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="career_role", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="career_role")
    interview_questions = relationship("InterviewQuestion", back_populates="career_role")
    assessment_questions = relationship("CareerAssessmentQuestion", back_populates="career_role", cascade="all, delete-orphan")
    assessment_attempts = relationship("CareerAssessmentAttempt", back_populates="career_role", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    # The 9 standardized categories:
    # 1. Technical skills
    # 2. Digital literacy skills
    # 3. Soft skills
    # 4. Communication skills
    # 5. Business and domain skills
    # 6. Analytical and cognitive skills
    # 7. Leadership and management skills
    # 8. Creative skills
    # 9. Role-specific certifications
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    doc_url = Column(String(255), nullable=False)
    difficulty_level = Column(String(50), default="intermediate")  # "beginner", "intermediate", "advanced"
    assessment_method = Column(String(50), default="quiz")  # "quiz", "code_test", "case_study", "presentation"
    cost_type = Column(String(50), default="free")  # "free", "freemium", "paid"
    estimated_hours_beginner = Column(Integer, default=15)
    estimated_hours_intermediate = Column(Integer, default=25)
    estimated_hours_advanced = Column(Integer, default=35)

    role_requirements = relationship("RoleSkillRequirement", back_populates="skill", cascade="all, delete-orphan")
    resources = relationship("LearningResource", back_populates="skill", cascade="all, delete-orphan")
    tasks = relationship("RoadmapTask", back_populates="skill")
    quizzes = relationship("AssessmentQuiz", back_populates="skill", cascade="all, delete-orphan")
    assessment_results = relationship("SkillAssessmentResult", back_populates="skill", cascade="all, delete-orphan")

    prerequisites_for = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.prerequisite_skill_id",
        back_populates="prerequisite_skill",
        cascade="all, delete-orphan",
    )
    prerequisites_required = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.skill_id",
        back_populates="target_skill",
        cascade="all, delete-orphan",
    )


class RoleSkillRequirement(Base):
    __tablename__ = "role_skill_requirements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_proficiency = Column(Integer, nullable=False, default=3)  # 0 to 5 scale (0=None, 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert)
    importance_weight = Column(Integer, nullable=False, default=3)  # 1 to 5
    is_core = Column(Boolean, nullable=False, default=True)

    __table_args__ = (UniqueConstraint("role_id", "skill_id", name="uq_role_skill"),)

    career_role = relationship("CareerRole", back_populates="skill_requirements")
    skill = relationship("Skill", back_populates="role_requirements")


class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    is_strict = Column(Boolean, nullable=False, default=True)  # True = strict prerequisite, False = recommended preparation

    __table_args__ = (UniqueConstraint("skill_id", "prerequisite_skill_id", name="uq_skill_prerequisite"),)

    target_skill = relationship("Skill", foreign_keys=[skill_id], back_populates="prerequisites_required")
    prerequisite_skill = relationship("Skill", foreign_keys=[prerequisite_skill_id], back_populates="prerequisites_for")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    provider = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    format = Column(String(50), nullable=False, default="documentation")  # "video", "documentation", "practice", "mixed"
    difficulty = Column(String(50), nullable=False, default="beginner")  # "beginner", "intermediate", "advanced", "all"
    is_free = Column(Boolean, nullable=False, default=True)
    cost_info = Column(String(100), default="100% Free Access")
    description = Column(Text, nullable=False)
    rating = Column(Float, default=4.8)
    career_domain = Column(String(100), nullable=True)
    topic = Column(String(100), nullable=True)
    estimated_duration = Column(String(50), nullable=True)
    last_verified_date = Column(String(20), nullable=True)
    language = Column(String(20), nullable=False, default="en")
    free_status = Column(String(50), nullable=False, default="100% Free Access")

    skill = relationship("Skill", back_populates="resources")
    bookmarks = relationship("ResourceBookmark", back_populates="resource", cascade="all, delete-orphan")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_duration_weeks = Column(Integer, nullable=False)
    weekly_hours = Column(Integer, nullable=False)
    readiness_score = Column(Float, nullable=False)
    total_estimated_hours = Column(Integer, nullable=False)
    is_over_capacity = Column(Boolean, default=False)
    capacity_warning = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    ai_advice = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="roadmaps")
    career_role = relationship("CareerRole", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.week_number, RoadmapTask.order_in_week")
    snapshots = relationship("ProgressSnapshot", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    phase_number = Column(Integer, nullable=False, default=1)  # 1 to 5
    phase_name = Column(String(100), nullable=False, default="Phase 1: Foundations")
    week_number = Column(Integer, nullable=False, index=True)
    order_in_week = Column(Integer, nullable=False, default=1)
    day_of_week = Column(String(20), nullable=True)  # "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    day_number = Column(Integer, nullable=True, default=1)  # 1 to 7
    activity_category = Column(String(50), nullable=False, default="LEARN")  # "LEARN", "PRACTICE", "TEST", "BUILD", "REVISE", "PREPARE"
    practice_exercises = Column(JSON, nullable=False, default=list)
    quiz_data = Column(JSON, nullable=False, default=list)
    coding_challenge = Column(JSON, nullable=True)
    title = Column(String(200), nullable=False)
    skill_category = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False, default="theory")  # "theory", "practice", "project", "assessment", "revision", "interview", "case_study"
    description = Column(Text, nullable=False)
    estimated_hours = Column(Integer, nullable=False, default=4)
    actual_hours_spent = Column(Float, nullable=False, default=0.0)
    priority = Column(String(50), nullable=False, default="Medium")  # "High", "Medium", "Low"
    status = Column(String(30), nullable=False, default="not_started")  # "not_started", "in_progress", "completed"
    is_completed = Column(Boolean, nullable=False, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    completion_criteria = Column(Text, nullable=False)
    deliverable = Column(String(255), nullable=True)  # Expected practical artifact (e.g., "Excel Pivot Model", "STAR Story Script", "FastAPI CRUD Router")
    evidence_link = Column(String(500), nullable=True)
    xp_reward = Column(Integer, nullable=False, default=50)
    mission_title = Column(String(200), nullable=True)
    quest_type = Column(String(50), nullable=False, default="skill_quest")  # "daily", "weekly_mission", "skill_quest", "epic_project", "revision", "boss"
    activity_method = Column(String(50), nullable=True, default="theory")  # "coding", "financial_model", "case_brief", "clinical_case", "design_brief", "syllabus_prep", "engineering_calc", "business_case"
    specialization_branch = Column(String(100), nullable=True)
    workspace_data = Column(JSON, nullable=False, default=dict)

    roadmap = relationship("Roadmap", back_populates="tasks")
    skill = relationship("Skill", back_populates="tasks")
    resources = relationship("TaskResource", back_populates="task", cascade="all, delete-orphan")


class TaskResource(Base):
    __tablename__ = "task_resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("roadmap_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    provider = Column(String(100), nullable=False)
    format = Column(String(50), default="documentation")

    task = relationship("RoadmapTask", back_populates="resources")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    problem_statement = Column(Text, nullable=False)
    skills_covered = Column(JSON, nullable=False, default=list)
    difficulty = Column(String(50), nullable=False, default="Intermediate")
    estimated_hours = Column(Integer, default=20)
    suggested_tech_stack = Column(JSON, nullable=False, default=list)
    milestones = Column(JSON, nullable=False, default=list)
    evaluation_criteria = Column(JSON, nullable=False, default=list)
    deliverables = Column(JSON, nullable=False, default=list)
    portfolio_presentation_tips = Column(Text, nullable=True)

    career_role = relationship("CareerRole", back_populates="projects")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(100), nullable=False)  # "Technical", "DSA", "Case Study", "Aptitude", "Core CS", "HR/Behavioral", "Communication"
    title = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    sample_answer = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Medium")
    key_points = Column(JSON, default=list)
    is_completed = Column(Boolean, default=False)
    is_bookmarked = Column(Boolean, default=False)

    career_role = relationship("CareerRole", back_populates="interview_questions")


class AssessmentQuiz(Base):
    __tablename__ = "assessment_quizzes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of 4 strings
    correct_answer_index = Column(Integer, nullable=False)  # 0 to 3
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(50), default="intermediate")

    skill = relationship("Skill", back_populates="quizzes")


class SkillAssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    score_percentage = Column(Float, nullable=False)
    verified_proficiency = Column(Integer, nullable=False, default=1)  # 0 to 5
    evidence_link = Column(String(500), nullable=True)
    assessed_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="assessment_results")
    skill = relationship("Skill", back_populates="assessment_results")


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    completed_tasks_count = Column(Integer, nullable=False, default=0)
    total_tasks_count = Column(Integer, nullable=False, default=0)
    completion_percentage = Column(Float, nullable=False, default=0.0)
    readiness_score = Column(Float, nullable=False, default=0.0)
    hours_spent = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="snapshots")
    roadmap = relationship("Roadmap", back_populates="snapshots")


class ResourceBookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("profile_id", "resource_id", name="uq_profile_resource_bookmark"),)

    student_profile = relationship("StudentProfile", back_populates="bookmarks")
    resource = relationship("LearningResource", back_populates="bookmarks")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    career_slug = Column(String(100), nullable=True, index=True)
    category = Column(String(50), nullable=False, default="Coding")
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(30), default="Medium")
    time_estimate_mins = Column(Integer, default=15)
    instructions = Column(Text, nullable=False)
    starter_prompt = Column(Text, nullable=True)
    xp_reward = Column(Integer, default=75)
    created_at = Column(DateTime, default=utcnow, nullable=False)


class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    source_type = Column(String(50), nullable=False)  # "task_completion", "daily_challenge", "skill_assessment", "boss_battle", "arena_challenge", "interview_practice"
    source_id = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("profile_id", "source_type", "source_id", name="uq_profile_source_xp"),
    )

    student_profile = relationship("StudentProfile", back_populates="xp_transactions")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="general")  # "quest", "streak", "boss", "project", "interview", "mastery"
    xp_reward = Column(Integer, nullable=False, default=100)
    icon = Column(String(50), nullable=False, default="Award")
    badge_color = Column(String(50), nullable=False, default="#00f0ff")

    student_achievements = relationship("StudentAchievement", back_populates="achievement", cascade="all, delete-orphan")


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    unlocked_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("profile_id", "achievement_id", name="uq_student_achievement"),
    )

    student_profile = relationship("StudentProfile", back_populates="student_achievements")
    achievement = relationship("Achievement", back_populates="student_achievements")


class BossBattle(Base):
    __tablename__ = "boss_battles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    boss_name = Column(String(150), nullable=False)
    boss_title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # "Language Core", "Algorithms & DSA", "Aptitude & Logic", "System Architecture", "Placement Simulation"
    difficulty = Column(String(50), default="Advanced")  # "Intermediate", "Advanced", "Epic", "Legendary"
    health_points = Column(Integer, default=100)
    required_level = Column(Integer, default=1)
    xp_reward = Column(Integer, default=250)
    badge_slug = Column(String(100), default="bug_slayer")
    passing_score = Column(Float, default=70.0)
    description = Column(Text, nullable=False)
    phases = Column(JSON, nullable=False, default=list)  # Questions & drills
    created_at = Column(DateTime, default=utcnow, nullable=False)

    attempts = relationship("BossBattleAttempt", back_populates="boss_battle", cascade="all, delete-orphan")


class BossBattleAttempt(Base):
    __tablename__ = "boss_battle_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    boss_id = Column(Integer, ForeignKey("boss_battles.id", ondelete="CASCADE"), nullable=False, index=True)
    score_percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False, default=False)
    xp_awarded = Column(Integer, nullable=False, default=0)
    student_responses = Column(JSON, nullable=False, default=dict)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="boss_attempts")
    boss_battle = relationship("BossBattle", back_populates="attempts")


class ArenaChallenge(Base):
    __tablename__ = "arena_challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    arena_type = Column(String(50), nullable=False, index=True)  # "dsa", "aptitude", "technical", "hr", "project"
    title = Column(String(200), nullable=False)
    difficulty = Column(String(50), default="Medium")  # "Beginner", "Medium", "Hard", "Epic"
    time_limit_mins = Column(Integer, default=20)
    xp_reward = Column(Integer, default=80)
    problem_statement = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=True)
    test_cases = Column(JSON, nullable=False, default=list)
    rubric = Column(JSON, nullable=False, default=dict)
    hints = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    attempts = relationship("ArenaAttempt", back_populates="challenge", cascade="all, delete-orphan")


class ArenaAttempt(Base):
    __tablename__ = "arena_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("arena_challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    arena_type = Column(String(50), nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    passed = Column(Boolean, nullable=False, default=False)
    time_spent_secs = Column(Integer, default=0)
    submission_text = Column(Text, nullable=True)
    ai_evaluation = Column(JSON, nullable=True)
    xp_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="arena_attempts")
    challenge = relationship("ArenaChallenge", back_populates="attempts")


# -------------------------------------------------------------
# Career-Based Skill Assessment System Models
# -------------------------------------------------------------
class CareerAssessmentQuestion(Base):
    __tablename__ = "career_assessment_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., "Java Fundamentals", "Spring Boot", "OOP", "SQL"
    question_type = Column(String(50), nullable=False, default="mcq")  # "mcq", "code_prediction", "debugging", "scenario", "conceptual", "practical"
    difficulty = Column(String(50), nullable=False, default="intermediate")  # "fundamentals", "intermediate", "practical", "advanced"
    question = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    options = Column(JSON, nullable=False)  # List of 4 string options
    correct_answer_index = Column(Integer, nullable=False)  # 0 to 3
    explanation = Column(Text, nullable=False)
    marks = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    career_role = relationship("CareerRole", back_populates="assessment_questions")
    skill = relationship("Skill")


class CareerAssessmentAttempt(Base):
    __tablename__ = "career_assessment_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="in_progress")  # "in_progress", "submitted"
    answers = Column(JSON, nullable=False, default=dict)  # {str(question_id): selected_index}
    review_flags = Column(JSON, nullable=False, default=list)  # list of question IDs
    time_spent_secs = Column(Integer, default=0)
    started_at = Column(DateTime, default=utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    student_profile = relationship("StudentProfile", back_populates="career_assessment_attempts")
    career_role = relationship("CareerRole", back_populates="assessment_attempts")
    result = relationship("CareerAssessmentResult", back_populates="attempt", uselist=False, cascade="all, delete-orphan")
    gap_report = relationship("CareerSkillGapReport", back_populates="attempt", uselist=False, cascade="all, delete-orphan")


class CareerAssessmentResult(Base):
    __tablename__ = "career_assessment_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("career_assessment_attempts.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    total_questions = Column(Integer, nullable=False)
    answered_count = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    incorrect_count = Column(Integer, nullable=False)
    unanswered_count = Column(Integer, nullable=False)
    total_marks_earned = Column(Integer, nullable=False, default=0)
    total_possible_marks = Column(Integer, nullable=False, default=0)
    score_percentage = Column(Float, nullable=False)
    proficiency_level = Column(String(50), nullable=False)  # "Beginner" (0-39%), "Developing" (40-59%), "Intermediate" (60-79%), "Advanced" (80-100%)
    category_scores = Column(JSON, nullable=False, default=dict)  # {category: {total, correct, percentage, proficiency}}
    difficulty_scores = Column(JSON, nullable=False, default=dict)  # {difficulty: {total, correct, percentage}}
    question_details = Column(JSON, nullable=False, default=list)  # list of question evaluations
    evaluated_at = Column(DateTime, default=utcnow, nullable=False)

    attempt = relationship("CareerAssessmentAttempt", back_populates="result")
    student_profile = relationship("StudentProfile")
    career_role = relationship("CareerRole")


class CareerSkillGapReport(Base):
    __tablename__ = "career_skill_gap_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("career_assessment_attempts.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    readiness_score = Column(Float, nullable=False)
    skills_table = Column(JSON, nullable=False, default=list)  # list of {skill_name, category, required_level, assessed_level, gap_level, gap_status, priority, confidence}
    strong_skills = Column(JSON, nullable=False, default=list)
    needs_improvement_skills = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)
    critical_gaps = Column(JSON, nullable=False, default=list)
    recommended_priorities = Column(JSON, nullable=False, default=list)
    ai_gap_explanation = Column(Text, nullable=True)
    ai_learning_topics = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    attempt = relationship("CareerAssessmentAttempt", back_populates="gap_report")
    student_profile = relationship("StudentProfile")
    career_role = relationship("CareerRole")


# -------------------------------------------------------------
# Daily Activities, Streaks & Weekly Preparation Models
# -------------------------------------------------------------
class DailyActivityLog(Base):
    __tablename__ = "daily_activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=True, index=True)
    task_id = Column(Integer, ForeignKey("roadmap_tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    activity_type = Column(String(50), nullable=False, default="learn")  # "learn", "practice", "test", "build", "revise", "prepare"
    title = Column(String(255), nullable=False)
    hours_spent = Column(Float, nullable=False, default=0.5)
    xp_earned = Column(Integer, nullable=False, default=50)
    completion_status = Column(String(50), nullable=False, default="completed")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Enriched fields for Complete Personal Learning Calendar & Tracking
    category = Column(String(50), nullable=False, default="learning")  # "learning", "video_lesson", "study_note", "practice", "quiz", "project", "assessment", "roadmap", "revision", "ai_learning"
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    career_title = Column(String(150), nullable=True)
    score = Column(Float, nullable=True)
    score_total = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True, default=30)
    reference_type = Column(String(50), nullable=True)  # "task", "quiz", "assessment", "project", "ai_tutor", "resource"
    reference_id = Column(String(100), nullable=True)
    action_url = Column(String(255), nullable=True)
    idempotency_key = Column(String(150), nullable=True, index=True)
    extra_metadata = Column(JSON, nullable=True, default=dict)

    student_profile = relationship("StudentProfile", back_populates="daily_activities")
    roadmap = relationship("Roadmap")
    task = relationship("RoadmapTask")
    career_role = relationship("CareerRole")


class WeeklyGoalRecord(Base):
    __tablename__ = "weekly_goal_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    week_identifier = Column(String(20), nullable=False, index=True)  # YYYY-W## (e.g. 2026-W45)
    goal_type = Column(String(50), nullable=False, default="days_per_week")  # "days_per_week", "activities_per_week", "hours_per_week"
    goal_target = Column(Integer, nullable=False, default=5)
    achieved_count = Column(Integer, nullable=False, default=0)
    is_achieved = Column(Boolean, nullable=False, default=False)
    achieved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("profile_id", "week_identifier", name="uq_profile_weekly_goal"),
    )

    student_profile = relationship("StudentProfile", back_populates="weekly_goals")


class CareerReassessmentComparison(Base):
    __tablename__ = "career_reassessment_comparisons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    initial_attempt_id = Column(Integer, ForeignKey("career_assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    latest_attempt_id = Column(Integer, ForeignKey("career_assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    initial_score = Column(Float, nullable=False)
    latest_score = Column(Float, nullable=False)
    score_delta = Column(Float, nullable=False)
    improved_skills = Column(JSON, nullable=False, default=list)
    remaining_gaps = Column(JSON, nullable=False, default=list)
    new_weaknesses = Column(JSON, nullable=False, default=list)
    readiness_delta = Column(Float, nullable=False, default=0.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="reassessment_comparisons")
    career_role = relationship("CareerRole")


class CareerDiscoveryResponse(Base):
    __tablename__ = "career_discovery_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    answers = Column(JSON, nullable=False, default=dict)
    recommended_careers = Column(JSON, nullable=False, default=list)  # list of {role_id, slug, title, domain, match_percentage, reason}
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    provider = Column(String(150), nullable=False, default="Official Curriculum")
    source_url = Column(String(500), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_type = Column(String(50), nullable=False, default="web")  # "pdf", "docx", "txt", "markdown", "html", "web"
    doc_hash = Column(String(64), unique=True, index=True, nullable=False)  # SHA-256 for duplicate detection
    career_domain = Column(String(100), nullable=False, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    career_role_title = Column(String(150), nullable=True, index=True)
    category = Column(String(100), nullable=False, default="learning_materials", index=True)
    # 10 core categories:
    # "profile_responsibilities", "qualifications_eligibility", "skills_competencies",
    # "learning_materials", "official_documentation", "examination_syllabi",
    # "preparation_tutorials", "practical_exercises", "projects_portfolio", "interview_preparation"
    related_skills = Column(JSON, nullable=False, default=list)
    related_topics = Column(JSON, nullable=False, default=list)
    difficulty = Column(String(50), nullable=False, default="intermediate")  # "beginner", "intermediate", "advanced"
    country_jurisdiction = Column(String(100), nullable=True, default="Global")  # "India", "Global", "US", etc.
    access_type = Column(String(50), nullable=False, default="free_open")  # "free_open", "official", "academic"
    publication_date = Column(String(50), nullable=True)
    verification_date = Column(String(50), nullable=True)
    is_verified = Column(Boolean, nullable=False, default=True)
    raw_content = Column(Text, nullable=True)
    cleaned_content = Column(Text, nullable=True)
    chunk_count = Column(Integer, nullable=False, default=0)
    ingestion_status = Column(String(50), nullable=False, default="indexed")  # "pending", "processing", "indexed", "failed"
    ingestion_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")
    career_role = relationship("CareerRole")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_hash = Column(String(64), index=True, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False, default=0)
    embedding = Column(JSON, nullable=True)  # List of floats for dense vector retrieval
    career_domain = Column(String(100), nullable=False, index=True)
    career_role_title = Column(String(150), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    related_skills = Column(JSON, nullable=False, default=list)
    related_topics = Column(JSON, nullable=False, default=list)
    section_reference = Column(String(255), nullable=True)
    page_number = Column(Integer, nullable=True)
    source_title = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=False)
    provider = Column(String(150), nullable=False)
    country_jurisdiction = Column(String(100), nullable=True, default="Global")
    difficulty = Column(String(50), nullable=False, default="intermediate")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    document = relationship("KnowledgeDocument", back_populates="chunks")


class RAGInteractionLog(Base):
    __tablename__ = "rag_interaction_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    query = Column(Text, nullable=False)
    context_role = Column(String(150), nullable=True)
    context_domain = Column(String(100), nullable=True)
    milestone_title = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False, default="query")  # "query", "milestone_tutor", "quiz_gen", "notes"
    retrieved_chunk_ids = Column(JSON, nullable=False, default=list)
    retrieved_source_urls = Column(JSON, nullable=False, default=list)
    answer_snippet = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=False, default="rag_hybrid")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student_profile = relationship("StudentProfile")

