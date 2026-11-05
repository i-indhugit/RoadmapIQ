import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const { Pool } = pg;

export type DbDriver = 'postgres' | 'sqlite';

let pool: pg.Pool | null = null;
let sqliteDb: any = null;
let driver: DbDriver = 'sqlite';

const rawUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const isPostgres = rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://');

if (isPostgres) {
  driver = 'postgres';
  pool = new Pool({
    connectionString: rawUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  driver = 'sqlite';
  try {
    const { DatabaseSync } = require('node:sqlite');
    const dbPath = resolve(process.cwd(), 'roadmapiq.db');
    if (existsSync(dbPath)) {
      sqliteDb = new DatabaseSync(dbPath);
    } else {
      console.warn(`[RoadmapIQ DB] SQLite file not found at ${dbPath}`);
    }
  } catch (err: any) {
    console.warn(`[RoadmapIQ DB] node:sqlite initialization notice: ${err?.message}`);
  }
}

export function getDbDriver(): DbDriver {
  return driver;
}

/**
 * Safely parse potential JSON string fields from database rows
 */
export function sanitizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const jsonFields = [
    'daily_responsibilities',
    'required_education',
    'optional_qualifications',
    'preferred_skills',
    'soft_skills',
    'certifications_or_exams',
    'career_progression',
    'tools_and_technologies',
    'core_competencies',
    'difficulty_distribution',
    'skills_assessment',
    'assessed_skills',
    'badges',
    'areas_of_interest',
    'journey_settings',
    'workspace_data',
    'practice_exercises',
    'quiz_data',
    'coding_challenge',
    'extra_metadata',
    'deliverables',
  ];

  const sanitized: any = { ...row };
  for (const field of jsonFields) {
    if (sanitized[field] !== undefined && typeof sanitized[field] === 'string') {
      try {
        sanitized[field] = JSON.parse(sanitized[field]);
      } catch {
        // Keep as string if not valid JSON
      }
    }
  }

  // Normalize booleans in SQLite (0/1 -> false/true)
  const boolFields = ['is_completed', 'is_over_capacity', 'is_regulated_profession', 'ai_enabled', 'leaderboard_opt_in'];
  for (const field of boolFields) {
    if (sanitized[field] !== undefined && typeof sanitized[field] === 'number') {
      sanitized[field] = sanitized[field] === 1;
    }
  }

  return sanitized;
}

/**
 * Execute parameterized query seamlessly across PostgreSQL or SQLite
 */
export async function query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (driver === 'postgres' && pool) {
    const res = await pool.query(sql, params);
    const sanitizedRows = res.rows.map(sanitizeRow);
    return { rows: sanitizedRows, rowCount: res.rowCount ?? sanitizedRows.length };
  }

  if (sqliteDb) {
    // Translate PostgreSQL $1, $2, $3 to SQLite ?
    const sqliteSql = sql.replace(/\$(\d+)/g, '?');

    // SQLite parameters: stringify objects/arrays
    const sanitizedParams = params.map((p) => {
      if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
        return JSON.stringify(p);
      }
      if (typeof p === 'boolean') {
        return p ? 1 : 0;
      }
      if (p instanceof Date) {
        return p.toISOString();
      }
      return p;
    });

    const isSelect = /^\s*(SELECT|PRAGMA|WITH)/i.test(sqliteSql);
    const stmt = sqliteDb.prepare(sqliteSql);

    if (isSelect) {
      const rawRows = stmt.all(...sanitizedParams);
      const rows = rawRows.map(sanitizeRow);
      return { rows, rowCount: rows.length };
    } else {
      const result = stmt.run(...sanitizedParams);
      return { rows: [], rowCount: Number(result.changes || 0) };
    }
  }

  throw new Error('No active database connection available (PostgreSQL or SQLite)');
}

/**
 * Helper to fetch a single record or null
 */
export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const { rows } = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
