import { query, queryOne } from '../db.js';
import type { StudentProfile } from '../types.js';

export async function getGamificationStatus(profileId?: number): Promise<any> {
  let profile: StudentProfile | null = null;
  if (profileId) {
    profile = await queryOne('SELECT * FROM student_profiles WHERE id = $1', [profileId]);
  }
  if (!profile) {
    profile = await queryOne('SELECT * FROM student_profiles ORDER BY updated_at DESC, id DESC LIMIT 1');
  }

  const xp = profile?.xp || 100;
  const level = Math.max(1, Math.floor(xp / 200) + 1);
  const nextLevelXp = level * 200;
  const streakDays = profile?.streak_days || 1;

  // Fetch unlocked badges from student_achievements or profile.badges
  let badges: any[] = profile?.badges || [];
  if (typeof badges === 'string') {
    try { badges = JSON.parse(badges); } catch { badges = []; }
  }

  return {
    profile_id: profile?.id || 1,
    display_name: profile?.display_name || 'Jordan Reed',
    xp,
    level,
    next_level_xp: nextLevelXp,
    progress_to_next_level: Math.round(((xp % 200) / 200) * 100),
    streak_days: streakDays,
    longest_streak: profile?.longest_streak || streakDays,
    badges,
    avatar_style: profile?.avatar_style || 'cyber_nomad',
  };
}

export async function getSkillTree(roleId?: number, profileId?: number): Promise<any> {
  let rId = roleId;
  if (!rId) {
    const prof = await queryOne('SELECT target_role_id FROM student_profiles ORDER BY updated_at DESC, id DESC LIMIT 1');
    rId = prof?.target_role_id || 1;
  }

  const { rows: skillRows } = await query(
    `SELECT s.id, s.name, s.slug, s.category, s.description, s.doc_url,
            r.importance_weight as importance, r.required_proficiency as min_proficiency
     FROM role_skill_requirements r
     JOIN skills s ON r.skill_id = s.id
     WHERE r.role_id = $1
     ORDER BY r.required_proficiency ASC, s.name ASC`,
    [rId]
  );

  // Group into tiers based on min_proficiency (1: Fundamentals, 2: Core, 3: Advanced, 4: Mastery)
  const tiers = [
    { tier: 1, name: 'Foundation', nodes: [] as any[] },
    { tier: 2, name: 'Core Knowledge', nodes: [] as any[] },
    { tier: 3, name: 'Specialization', nodes: [] as any[] },
    { tier: 4, name: 'Mastery', nodes: [] as any[] },
  ];

  for (const s of skillRows) {
    const tierIdx = Math.min(3, Math.max(0, (s.min_proficiency || 1) - 1));
    tiers[tierIdx].nodes.push({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      importance: s.importance,
      status: tierIdx === 0 ? 'unlocked' : 'available',
      doc_url: s.doc_url || 'https://developer.mozilla.org',
    });
  }

  return {
    role_id: rId,
    total_skills: skillRows.length,
    tiers: tiers.filter((t) => t.nodes.length > 0),
  };
}

export async function getQuests(roadmapId?: number): Promise<any[]> {
  let rId = roadmapId;
  if (!rId) {
    const latest = await queryOne('SELECT id FROM roadmaps ORDER BY updated_at DESC, id DESC LIMIT 1');
    rId = latest?.id || 1;
  }

  const { rows: tasks } = await query(
    `SELECT id, title, quest_type, phase_name, is_completed, xp_reward, estimated_hours
     FROM roadmap_tasks
     WHERE roadmap_id = $1
     ORDER BY phase_number ASC, week_number ASC
     LIMIT 10`,
    [rId]
  );

  return tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    quest_type: t.quest_type || 'skill_quest',
    phase: t.phase_name,
    xp_reward: t.xp_reward || 50,
    status: t.is_completed ? 'completed' : 'active',
  }));
}

export async function getLeaderboard(): Promise<any[]> {
  const { rows } = await query(
    `SELECT id, display_name, xp, level, streak_days, avatar_style
     FROM student_profiles
     ORDER BY xp DESC
     LIMIT 20`
  );

  return rows.map((r: any, idx: number) => ({
    rank: idx + 1,
    id: r.id,
    display_name: r.display_name || `Learner #${r.id}`,
    xp: r.xp || 100,
    level: r.level || 1,
    streak_days: r.streak_days || 1,
    avatar_style: r.avatar_style || 'cyber_nomad',
  }));
}
