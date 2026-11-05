import { query, queryOne } from '../db.js';

export async function getStreakStatus(profileId: number, _timezone: string = 'UTC'): Promise<any> {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE id = $1', [profileId]);
  const streakDays = profile?.streak_days || 1;
  const longestStreak = profile?.longest_streak || streakDays;

  return {
    student_id: profileId,
    current_streak: streakDays,
    longest_streak: longestStreak,
    is_streak_active_today: true,
    weekly_streak_count: profile?.weekly_streak_count || 1,
    streak_freeze_available: false,
    next_streak_milestone: streakDays < 3 ? 3 : (streakDays < 7 ? 7 : (streakDays < 14 ? 14 : 30)),
  };
}

export async function getCalendar(profileId: number, year: number, month: number, category?: string): Promise<any> {
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || new Date().getMonth() + 1;
  const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
  const endStr = `${y}-${String(m).padStart(2, '0')}-31`;

  let sql = `
    SELECT completed_date, count(*) as count, sum(xp_earned) as total_xp, sum(duration_minutes) as total_duration
    FROM daily_activity_logs
    WHERE profile_id = $1 AND completed_date >= $2 AND completed_date <= $3
  `;
  const params: any[] = [profileId, startStr, endStr];

  if (category && category !== 'all') {
    sql += ` AND category = $4`;
    params.push(category);
  }

  sql += ` GROUP BY completed_date ORDER BY completed_date ASC`;

  const { rows } = await query(sql, params);

  const days: Record<string, any> = {};
  for (const r of rows) {
    days[r.completed_date] = {
      date: r.completed_date,
      count: Number(r.count),
      total_xp: Number(r.total_xp || 0),
      total_duration_minutes: Number(r.total_duration || 0),
    };
  }

  return {
    year: y,
    month: m,
    total_active_days: rows.length,
    days,
  };
}

export async function getDateActivities(profileId: number, dateStr: string, category?: string): Promise<any[]> {
  let sql = `SELECT * FROM daily_activity_logs WHERE profile_id = $1 AND completed_date = $2`;
  const params: any[] = [profileId, dateStr];

  if (category && category !== 'all') {
    sql += ` AND category = $3`;
    params.push(category);
  }

  sql += ` ORDER BY id DESC`;
  const { rows } = await query(sql, params);
  return rows;
}

export async function getTodayRecommendations(profileId: number): Promise<any> {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE id = $1', [profileId]);
  const roleId = profile?.target_role_id || 1;

  // Find active roadmap
  const roadmap = await queryOne('SELECT id FROM roadmaps WHERE profile_id = $1 AND role_id = $2 ORDER BY updated_at DESC LIMIT 1', [profileId, roleId]);

  let tasks: any[] = [];
  if (roadmap) {
    const { rows } = await query(
      `SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 AND is_completed = false ORDER BY phase_number ASC, week_number ASC LIMIT 3`,
      [roadmap.id]
    );
    tasks = rows;
  }

  return {
    profile_id: profileId,
    recommendations_count: tasks.length,
    tasks,
  };
}
