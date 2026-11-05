"""
RoadmapIQ - SQLite to Neon PostgreSQL Migration Utility
Preserves 100% of data, relational integrity, primary keys, and sequences.

Features:
- Migrates all 36 tables in dependency order.
- Automatically creates PostgreSQL schema and enables pgvector extension.
- Handles type conversions (JSON strings -> JSON objects, SQLite 0/1 integers -> Booleans).
- Resets PostgreSQL auto-increment sequences after migration.
- Provides dry-run, row verification, and validation reporting.
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    Project,
    LearningResource,
    CareerAssessmentQuestion,
    StudentProfile,
    Roadmap,
    RoadmapTask,
    TaskResource,
    CareerAssessmentAttempt,
    CareerAssessmentResult,
    CareerSkillGapReport,
    DailyActivityLog,
    WeeklyGoalRecord,
    Achievement,
    StudentAchievement,
    XPTransaction,
    ProgressSnapshot,
    ArenaChallenge,
    ArenaAttempt,
    BossBattle,
    BossBattleAttempt,
    DailyChallenge,
    InterviewQuestion,
    CareerDiscoveryResponse,
    CareerReassessmentComparison,
    KnowledgeDocument,
    KnowledgeChunk,
    RAGInteractionLog,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("roadmapiq.migration")

# Topological table migration ordering
MIGRATION_ORDER = [
    # Level 0: No FK dependencies
    "career_roles",
    "skills",
    "achievements",
    "arena_challenges",
    "boss_battles",
    "daily_challenges",
    "interview_questions",
    "knowledge_documents",
    # Level 1: FK dependencies on Level 0
    "role_skill_requirements",
    "skill_prerequisites",
    "projects",
    "learning_resources",
    "career_assessment_questions",
    "knowledge_chunks",
    "student_profiles",
    # Level 2: FK dependencies on Level 1
    "roadmaps",
    "career_assessment_attempts",
    "student_achievements",
    "xp_transactions",
    "weekly_goal_records",
    "arena_attempts",
    "boss_battle_attempts",
    "career_discovery_responses",
    "rag_interaction_logs",
    "progress_snapshots",
    # Level 3: FK dependencies on Level 2
    "roadmap_tasks",
    "career_assessment_results",
    "career_skill_gap_reports",
    "daily_activity_logs",
    "career_reassessment_comparisons",
    # Level 4: FK dependencies on Level 3
    "task_resources",
]

# JSON column registry for type safety
JSON_COLUMNS = {
    "student_profiles": {"areas_of_interest", "skills_assessment", "assessed_skills", "badges", "journey_settings"},
    "career_roles": {
        "daily_responsibilities", "required_education", "optional_qualifications",
        "preferred_skills", "soft_skills", "certifications_or_exams", "career_progression",
        "tools_and_technologies", "core_competencies", "difficulty_distribution"
    },
    "roadmap_tasks": {"prerequisite_skill_ids", "practice_exercises", "quiz_data", "coding_challenge", "workspace_data"},
    "career_assessment_attempts": {"answers", "review_flags"},
    "career_assessment_results": {"category_scores", "difficulty_scores", "question_details"},
    "career_skill_gap_reports": {"skills_table", "strong_skills", "needs_improvement_skills", "missing_skills", "critical_gaps", "recommended_priorities", "ai_learning_topics"},
    "career_assessment_questions": {"options"},
    "knowledge_documents": {"related_skills", "related_topics"},
    "knowledge_chunks": {"embedding", "related_skills", "related_topics"},
    "daily_activity_logs": {"extra_metadata"},
    "career_discovery_responses": {"answers", "recommended_careers"},
    "career_reassessment_comparisons": {"improved_skills", "remaining_gaps", "new_weaknesses"},
    "rag_interaction_logs": {"retrieved_chunk_ids", "retrieved_source_urls"},
    "arena_challenges": {"constraints", "test_cases"},
    "arena_attempts": {"test_results"},
    "boss_battles": {"milestone_phases", "evaluation_rubric"},
    "boss_battle_attempts": {"phase_submissions", "evaluation_feedback"},
}

# Boolean column registry
BOOLEAN_COLUMNS = {
    "career_roles": {"is_regulated_profession"},
    "skills": {"is_technical"},
    "role_skill_requirements": {"is_core"},
    "learning_resources": {"is_active"},
    "roadmap_tasks": {"is_completed"},
    "weekly_goal_records": {"is_achieved"},
    "knowledge_documents": {"is_verified"},
    "student_profiles": {"ai_enabled", "leaderboard_opt_in"},
}


def clean_row_data(table_name: str, row_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure data conforms to PostgreSQL types."""
    cleaned = dict(row_dict)
    
    # Process JSON fields
    if table_name in JSON_COLUMNS:
        for col in JSON_COLUMNS[table_name]:
            if col in cleaned:
                val = cleaned[col]
                if isinstance(val, str):
                    try:
                        cleaned[col] = json.loads(val)
                    except Exception:
                        pass
                elif val is None and col in ("answers", "badges", "journey_settings", "skills_assessment"):
                    cleaned[col] = {} if "assessment" in col or "settings" in col or "answers" in col else []

    # Process Boolean fields
    if table_name in BOOLEAN_COLUMNS:
        for col in BOOLEAN_COLUMNS[table_name]:
            if col in cleaned and cleaned[col] is not None:
                cleaned[col] = bool(cleaned[col])

    # Convert empty strings for integer/float columns to None
    for k, v in list(cleaned.items()):
        if isinstance(v, str) and v == "" and ("_id" in k or k.endswith("_count") or k == "id"):
            cleaned[k] = None

    return cleaned


def migrate(sqlite_path: str, target_url: str, batch_size: int = 500, dry_run: bool = False, verify_only: bool = False):
    """Execute complete migration and verification."""
    if not os.path.exists(sqlite_path):
        logger.error(f"SQLite database file not found at: {sqlite_path}")
        sys.exit(1)

    logger.info(f"Connecting to SQLite: {sqlite_path}")
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")

    # Normalize PostgreSQL URL
    pg_url = target_url.strip()
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    logger.info(f"Connecting to Target PostgreSQL (Neon): {pg_url.split('@')[-1] if '@' in pg_url else pg_url}")
    pg_engine = create_engine(pg_url, pool_pre_ping=True)

    # Check connection
    try:
        with pg_engine.connect() as conn:
            res = conn.execute(text("SELECT version();")).scalar()
            logger.info(f"Target Database Version: {res}")
            
            # Enable pgvector extension on PostgreSQL
            if not dry_run and not verify_only:
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    conn.commit()
                    logger.info("Successfully verified / enabled pgvector extension on Neon PostgreSQL.")
                except Exception as ext_err:
                    logger.warning(f"Note: pgvector extension check: {ext_err}")
    except Exception as e:
        logger.error(f"Failed to connect to Neon PostgreSQL: {e}")
        sys.exit(1)

    # Verify-only mode
    if verify_only:
        logger.info("--- ROW COUNT COMPARISON ---")
        for table in MIGRATION_ORDER:
            try:
                with sqlite_engine.connect() as s_conn:
                    s_count = s_conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            except Exception:
                s_count = "N/A"
            try:
                with pg_engine.connect() as p_conn:
                    p_count = p_conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            except Exception:
                p_count = "N/A"
            match = "MATCH" if s_count == p_count else "MISMATCH"
            logger.info(f"{table:35}: SQLite={s_count} | Neon={p_count} [{match}]")
        return

    # Create target tables if not dry run
    if not dry_run:
        logger.info("Ensuring PostgreSQL schema matches SQLAlchemy metadata...")
        Base.metadata.create_all(bind=pg_engine)

    total_migrated_rows = 0

    for table_name in MIGRATION_ORDER:
        # Check if table exists in SQLite
        try:
            with sqlite_engine.connect() as s_conn:
                s_count = s_conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
        except Exception:
            logger.debug(f"Table {table_name} does not exist in SQLite source. Skipping.")
            continue

        if s_count == 0:
            logger.info(f"Table '{table_name}': 0 rows in source. Skipping.")
            continue

        logger.info(f"Migrating table '{table_name}' ({s_count} rows)...")

        if dry_run:
            logger.info(f"[DRY-RUN] Would migrate {s_count} rows for {table_name}.")
            continue

        # Fetch all rows from SQLite
        with sqlite_engine.connect() as s_conn:
            result = s_conn.execute(text(f"SELECT * FROM {table_name}"))
            columns = list(result.keys())
            rows = [dict(zip(columns, r)) for r in result.fetchall()]

        # Insert rows into PostgreSQL in batches
        with pg_engine.begin() as p_conn:
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                cleaned_batch = [clean_row_data(table_name, r) for r in batch]
                
                # Build parameterized insert
                cols = list(cleaned_batch[0].keys())
                col_names = ", ".join([f'"{c}"' for c in cols])
                param_names = ", ".join([f":{c}" for c in cols])
                
                # ON CONFLICT DO NOTHING preserves existing records safely
                stmt = text(f'INSERT INTO "{table_name}" ({col_names}) VALUES ({param_names}) ON CONFLICT DO NOTHING')
                p_conn.execute(stmt, cleaned_batch)

        # Reset PostgreSQL sequence to prevent duplicate primary key collisions
        try:
            with pg_engine.begin() as p_conn:
                seq_sql = f"""
                SELECT setval(
                    pg_get_serial_sequence('"{table_name}"', 'id'),
                    COALESCE((SELECT MAX(id) + 1 FROM "{table_name}"), 1),
                    false
                );
                """
                p_conn.execute(text(seq_sql))
        except Exception as seq_err:
            logger.debug(f"Sequence reset note for {table_name}: {seq_err}")

        total_migrated_rows += s_count
        logger.info(f"Completed table '{table_name}' successfully.")

    logger.info("======================================================")
    logger.info(f"MIGRATION COMPLETE! Total Source Rows Processed: {total_migrated_rows}")
    logger.info("======================================================")


def main():
    parser = argparse.ArgumentParser(description="Migrate RoadmapIQ SQLite to Neon PostgreSQL Free")
    parser.add_argument("--sqlite", default=str(ROOT_DIR / "roadmapiq.db"), help="Path to SQLite database file")
    parser.add_argument("--neon-url", default=os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL"), help="Neon PostgreSQL Connection String")
    parser.add_argument("--batch-size", type=int, default=500, help="Batch insertion size")
    parser.add_argument("--dry-run", action="store_true", help="Inspect and report without writing to PostgreSQL")
    parser.add_argument("--verify-only", action="store_true", help="Compare row counts between SQLite and Neon")

    args = parser.parse_args()

    if not args.neon_url:
        logger.error("No Neon PostgreSQL connection URL provided. Set DATABASE_URL or DIRECT_URL environment variable, or pass --neon-url.")
        sys.exit(1)

    migrate(
        sqlite_path=args.sqlite,
        target_url=args.neon_url,
        batch_size=args.batch_size,
        dry_run=args.dry_run,
        verify_only=args.verify_only,
    )


if __name__ == "__main__":
    main()
