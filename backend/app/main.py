import os
import sys
from pathlib import Path

# Ensure the backend directory is in sys.path regardless of where uvicorn is executed from
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.engine.seed_data import seed_database
from app.api import (
    auth,
    health,
    roles,
    skills,
    profile,
    roadmaps,
    tasks,
    resources,
    projects,
    interview,
    ai,
    assessment,
    gamification,
    career_assessment,
    discovery,
    activities,
    portfolio,
    rag,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("roadmapiq")


def migrate_sqlite_columns():
    """Ensure newly introduced columns exist in SQLite schema without data loss."""
    if not str(engine.url).startswith("sqlite"):
        return
    try:
        with engine.connect() as conn:
            # Check student_profiles columns
            res = conn.exec_driver_sql("PRAGMA table_info(student_profiles)").fetchall()
            cols = {row[1] for row in res}
            if cols:
                new_cols = [
                    ("xp", "INTEGER DEFAULT 100"),
                    ("level", "INTEGER DEFAULT 1"),
                    ("streak_days", "INTEGER DEFAULT 1"),
                    ("longest_streak", "INTEGER DEFAULT 1"),
                    ("last_active_date", "VARCHAR"),
                    ("weekly_streak_count", "INTEGER DEFAULT 0"),
                    ("longest_weekly_streak", "INTEGER DEFAULT 0"),
                    ("weekly_goal_type", "VARCHAR DEFAULT 'days_per_week'"),
                    ("weekly_goal_target", "INTEGER DEFAULT 5"),
                    ("timezone", "VARCHAR DEFAULT 'UTC'"),
                    ("educational_stream", "VARCHAR DEFAULT 'Engineering / Technology'"),
                    ("graduation_status", "VARCHAR DEFAULT 'Pursuing'"),
                    ("work_experience_years", "FLOAT DEFAULT 0.0"),
                    ("areas_of_interest", "JSON DEFAULT '[]'"),
                    ("preferred_learning_style", "VARCHAR DEFAULT 'visual_practical'"),
                    ("career_goals", "TEXT"),
                    ("badges", "JSON DEFAULT '[]'"),
                    ("daily_challenge_completed_date", "VARCHAR"),
                    ("leaderboard_opt_in", "INTEGER DEFAULT 1"),
                    ("gamer_handle", "VARCHAR"),
                    ("avatar_style", "VARCHAR DEFAULT 'cyber_nomad'"),
                    ("avatar_checkpoint_id", "VARCHAR"),
                    ("journey_settings", "JSON DEFAULT '{}'"),
                    ("user_id", "INTEGER"),
                ]
                for col_name, col_def in new_cols:
                    if col_name not in cols:
                        try:
                            conn.exec_driver_sql(f"ALTER TABLE student_profiles ADD COLUMN {col_name} {col_def}")
                        except Exception as e:
                            logger.warning(f"Column migration warning for student_profiles.{col_name}: {e}")

            # Check roadmap_tasks columns
            res_tasks = conn.exec_driver_sql("PRAGMA table_info(roadmap_tasks)").fetchall()
            cols_tasks = {row[1] for row in res_tasks}
            if cols_tasks:
                new_task_cols = [
                    ("xp_reward", "INTEGER DEFAULT 50"),
                    ("mission_title", "VARCHAR"),
                    ("quest_type", "VARCHAR DEFAULT 'skill_quest'"),
                    ("day_of_week", "VARCHAR DEFAULT 'Monday'"),
                    ("day_number", "INTEGER DEFAULT 1"),
                    ("activity_category", "VARCHAR DEFAULT 'LEARN'"),
                    ("practice_exercises", "JSON DEFAULT '[]'"),
                    ("quiz_data", "JSON DEFAULT '[]'"),
                    ("coding_challenge", "JSON DEFAULT 'null'"),
                    ("activity_method", "VARCHAR DEFAULT 'theory'"),
                    ("specialization_branch", "VARCHAR"),
                    ("workspace_data", "JSON DEFAULT '{}'"),
                ]
                for col_name, col_def in new_task_cols:
                    if col_name not in cols_tasks:
                        try:
                            conn.exec_driver_sql(f"ALTER TABLE roadmap_tasks ADD COLUMN {col_name} {col_def}")
                        except Exception as e:
                            logger.warning(f"Column migration warning for roadmap_tasks.{col_name}: {e}")

            # Check career_roles columns
            res_roles = conn.exec_driver_sql("PRAGMA table_info(career_roles)").fetchall()
            cols_roles = {row[1] for row in res_roles}
            if cols_roles:
                new_role_cols = [
                    ("domain", "VARCHAR DEFAULT 'Technology and IT'"),
                    ("subdomain", "VARCHAR"),
                    ("daily_responsibilities", "JSON DEFAULT '[]'"),
                    ("required_education", "JSON DEFAULT '[]'"),
                    ("eligibility_requirements", "TEXT"),
                    ("optional_qualifications", "JSON DEFAULT '[]'"),
                    ("preferred_skills", "JSON DEFAULT '[]'"),
                    ("soft_skills", "JSON DEFAULT '[]'"),
                    ("certifications_or_exams", "JSON DEFAULT '[]'"),
                    ("career_progression", "JSON DEFAULT '[]'"),
                    ("is_regulated_profession", "INTEGER DEFAULT 0"),
                    ("regulatory_disclaimer", "TEXT"),
                    ("tools_and_technologies", "JSON DEFAULT '[]'"),
                    ("core_competencies", "JSON DEFAULT '[]'"),
                    ("assessment_duration_mins", "INTEGER DEFAULT 30"),
                    ("assessment_question_count", "INTEGER DEFAULT 25"),
                    ("difficulty_distribution", "JSON DEFAULT '{}'"),
                ]
                for col_name, col_def in new_role_cols:
                    if col_name not in cols_roles:
                        try:
                            conn.exec_driver_sql(f"ALTER TABLE career_roles ADD COLUMN {col_name} {col_def}")
                        except Exception as e:
                            logger.warning(f"Column migration warning for career_roles.{col_name}: {e}")

            # Check learning_resources columns
            res_res = conn.exec_driver_sql("PRAGMA table_info(learning_resources)").fetchall()
            cols_res = {row[1] for row in res_res}
            if cols_res:
                new_res_cols = [
                    ("career_domain", "VARCHAR"),
                    ("topic", "VARCHAR"),
                    ("estimated_duration", "VARCHAR"),
                    ("last_verified_date", "VARCHAR"),
                    ("language", "VARCHAR DEFAULT 'en'"),
                    ("free_status", "VARCHAR DEFAULT '100% Free Access'"),
                ]
                for col_name, col_def in new_res_cols:
                    if col_name not in cols_res:
                        try:
                            conn.exec_driver_sql(f"ALTER TABLE learning_resources ADD COLUMN {col_name} {col_def}")
                        except Exception as e:
                            logger.warning(f"Column migration warning for learning_resources.{col_name}: {e}")

            # Check daily_activity_logs columns
            res_act = conn.exec_driver_sql("PRAGMA table_info(daily_activity_logs)").fetchall()
            cols_act = {row[1] for row in res_act}
            if cols_act:
                new_act_cols = [
                    ("category", "VARCHAR DEFAULT 'learning'"),
                    ("career_role_id", "INTEGER"),
                    ("career_title", "VARCHAR"),
                    ("score", "FLOAT"),
                    ("score_total", "FLOAT"),
                    ("duration_minutes", "INTEGER DEFAULT 30"),
                    ("reference_type", "VARCHAR"),
                    ("reference_id", "VARCHAR"),
                    ("action_url", "VARCHAR"),
                    ("idempotency_key", "VARCHAR"),
                    ("extra_metadata", "JSON DEFAULT '{}'"),
                ]
                for col_name, col_def in new_act_cols:
                    if col_name not in cols_act:
                        try:
                            conn.exec_driver_sql(f"ALTER TABLE daily_activity_logs ADD COLUMN {col_name} {col_def}")
                        except Exception as e:
                            logger.warning(f"Column migration warning for daily_activity_logs.{col_name}: {e}")

            conn.commit()
    except Exception as err:
        logger.warning(f"Migration check error: {err}")


def init_db():
    """Synchronous database schema creation and seed verification with non-blocking cold start guard."""
    try:
        # If on PostgreSQL (Neon), enable pgvector extension if available
        if not str(engine.url).startswith("sqlite"):
            try:
                from sqlalchemy import text
                with engine.connect() as conn:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    conn.commit()
                    logger.info("Neon pgvector extension verified.")
            except Exception as e:
                logger.warning(f"Note on pgvector extension: {e}")

        Base.metadata.create_all(bind=engine)
        migrate_sqlite_columns()

        db = SessionLocal()
        try:
            from app.models import CareerRole
            # Skip seeding if catalogue is already populated (avoids blocking Render cold starts)
            if db.query(CareerRole).count() >= 250:
                logger.info("Database catalogue already seeded with 250+ careers. Skipping startup seed.")
                return

            seed_database(db)
            from app.engine.seed_career_assessments import seed_career_assessments
            seed_career_assessments(db)
            from app.engine.seed_all_domain_careers import seed_all_domain_careers
            seed_all_domain_careers(db)
            from app.engine.seed_rag_knowledge import seed_rag_knowledge
            seed_rag_knowledge(db)
            logger.info("RoadmapIQ database seeded successfully.")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during RoadmapIQ database initialization: {e}")


# Initialize database schema and seeds
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("RoadmapIQ backend service started.")
    yield
    logger.info("RoadmapIQ backend service stopped.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent Skill Roadmap & Career Placement Generator Backend",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS: Allow Vercel frontend (*.vercel.app), Render, local dev with full credentials & standard methods
cors_origins = list(settings.CORS_ORIGINS)
env_cors = os.environ.get("CORS_ORIGINS")
if env_cors:
    try:
        import json
        parsed = json.loads(env_cors) if env_cors.startswith("[") else [o.strip() for o in env_cors.split(",")]
        cors_origins.extend(parsed)
    except Exception:
        pass

for default_origin in [
    "https://roadmap-iq.vercel.app",
    "https://roadmapiq-2.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root level health & readiness probes for Render and cloud load balancers
from fastapi import Response

@app.get("/health", include_in_schema=False)
def root_health():
    return health.get_health()

@app.get("/ready", include_in_schema=False)
def root_ready(response: Response):
    return health.get_ready(response)

# Mount all API routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(roadmaps.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")
app.include_router(discovery.router, prefix="/api")
app.include_router(career_assessment.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(rag.router, prefix="/api")


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for production built frontend (Single-site unified deployment)
candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]
DIST_DIR = next((p for p in candidates if os.path.isdir(p)), None)

if DIST_DIR:
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        # Serve exact file if exists (e.g. favicon.ico, vite.svg)
        target_file = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        # Fallback to index.html for client-side routing
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"app": settings.APP_NAME, "status": "online"}
else:
    @app.get("/", include_in_schema=False)
    def root():
        return {
            "app": settings.APP_NAME,
            "tagline": "Your Skills. Your Path. Your Future.",
            "status": "online",
            "documentation": "/docs",
            "api_prefix": settings.API_V1_STR
        }
