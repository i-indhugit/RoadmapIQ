import { query, queryOne } from '../db.js';
import type { StudentProfile, CareerRole } from '../types.js';
import { getRoleByIdOrSlug } from './rolesService.js';
import { switchCareerRoadmap } from './roadmapService.js';

export async function getLatestProfile(): Promise<StudentProfile> {
  let profile = await queryOne('SELECT * FROM student_profiles ORDER BY updated_at DESC, id DESC LIMIT 1');

  if (!profile) {
    const now = new Date().toISOString();
    await query(
      `INSERT INTO student_profiles (
        display_name, education_level, educational_field, degree_specialization,
        current_status, current_experience_level, target_role_id, weekly_study_hours,
        target_duration_weeks, preferred_learning_format, xp, level, streak_days,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        'Jordan Reed',
        'Undergraduate - Final Year',
        'Engineering / Technology',
        'Computer Science',
        'student',
        'Intermediate',
        1, // Default Software Engineer
        15,
        12,
        'mixed',
        100,
        1,
        1,
        now,
        now,
      ]
    );
    profile = await queryOne('SELECT * FROM student_profiles ORDER BY id DESC LIMIT 1');
  }

  if (profile?.target_role_id) {
    profile.target_role = await getRoleByIdOrSlug(profile.target_role_id);
  }

  return profile;
}

export async function getProfileById(id: number): Promise<StudentProfile | null> {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE id = $1', [id]);
  if (profile && profile.target_role_id) {
    profile.target_role = await getRoleByIdOrSlug(profile.target_role_id);
  }
  return profile;
}

export async function createProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
  const now = new Date().toISOString();
  await query(
    `INSERT INTO student_profiles (
      display_name, education_level, educational_field, degree_specialization,
      current_status, current_experience_level, target_role_id, weekly_study_hours,
      target_duration_weeks, preferred_learning_format, career_goals, xp, level, streak_days,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      data.display_name || 'Future Professional',
      data.education_level || 'Undergraduate',
      data.educational_field || 'Technology',
      data.degree_specialization || 'Professional Track',
      data.current_status || 'student',
      data.current_experience_level || 'Intermediate',
      data.target_role_id || null,
      data.weekly_study_hours || 15,
      data.target_duration_weeks || 12,
      data.preferred_learning_format || 'mixed',
      data.career_goals || null,
      data.xp || 100,
      data.level || 1,
      data.streak_days || 1,
      now,
      now,
    ]
  );
  return getLatestProfile();
}

export async function updateProfile(id: number, data: Partial<StudentProfile>): Promise<StudentProfile> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    if (['id', 'created_at', 'target_role'].includes(key)) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(val);
  }

  fields.push(`updated_at = $${idx++}`);
  values.push(now);
  values.push(id);

  const sql = `UPDATE student_profiles SET ${fields.join(', ')} WHERE id = $${idx}`;
  await query(sql, values);

  const updated = await getProfileById(id);
  if (!updated) throw new Error(`Profile #${id} not found`);
  return updated;
}

export async function setTargetCareer(params: {
  profileId?: number;
  roleId?: number;
  careerSlug?: string;
  careerGoals?: string;
  targetDurationWeeks?: number;
  weeklyStudyHours?: number;
  preferredLearningFormat?: string;
}): Promise<StudentProfile> {
  let role: CareerRole | null = null;
  if (params.roleId) {
    role = await getRoleByIdOrSlug(params.roleId);
  } else if (params.careerSlug) {
    role = await getRoleByIdOrSlug(params.careerSlug);
  }

  if (!role) {
    throw new Error(`Target career role (ID: ${params.roleId}, slug: '${params.careerSlug}') not found in catalogue.`);
  }

  let profile = params.profileId ? await getProfileById(params.profileId) : await getLatestProfile();
  if (!profile) {
    profile = await getLatestProfile();
  }

  const now = new Date().toISOString();
  await query(
    `UPDATE student_profiles SET
      target_role_id = $1,
      target_duration_weeks = COALESCE($2, target_duration_weeks),
      weekly_study_hours = COALESCE($3, weekly_study_hours),
      career_goals = COALESCE($4, career_goals),
      preferred_learning_format = COALESCE($5, preferred_learning_format),
      updated_at = $6
     WHERE id = $7`,
    [
      role.id,
      params.targetDurationWeeks || null,
      params.weeklyStudyHours || null,
      params.careerGoals || null,
      params.preferredLearningFormat || null,
      now,
      profile.id,
    ]
  );

  // Synchronize roadmap immediately so student never sees an empty state
  try {
    await switchCareerRoadmap({
      profileId: profile.id,
      roleId: role.id,
      weeklyHours: params.weeklyStudyHours || profile.weekly_study_hours || 15,
      targetDurationWeeks: params.targetDurationWeeks || profile.target_duration_weeks || 12,
      preferredFormat: params.preferredLearningFormat || profile.preferred_learning_format || 'mixed',
    });
  } catch (err: any) {
    console.warn(`[setTargetCareer] Roadmap synchronization note: ${err?.message}`);
  }

  const refreshed = await getProfileById(profile.id);
  if (!refreshed) throw new Error('Failed to retrieve updated profile');
  refreshed.target_role = role;
  return refreshed;
}

export async function getSavedCareers(profileId: number): Promise<any[]> {
  const sql = `
    SELECT b.id as bookmark_id, r.id, r.title, r.slug, r.domain, b.created_at as saved_at
    FROM bookmarks b
    JOIN career_roles r ON b.role_id = r.id
    WHERE b.profile_id = $1
    ORDER BY b.id DESC
  `;
  try {
    const { rows } = await query(sql, [profileId]);
    return rows;
  } catch {
    // If bookmarks table not present in some environments, query fallback
    return [];
  }
}

export async function saveCareer(profileId: number, roleId: number): Promise<any[]> {
  const now = new Date().toISOString();
  try {
    const existing = await queryOne('SELECT id FROM bookmarks WHERE profile_id = $1 AND role_id = $2', [profileId, roleId]);
    if (!existing) {
      await query('INSERT INTO bookmarks (profile_id, role_id, created_at) VALUES ($1, $2, $3)', [profileId, roleId, now]);
    }
  } catch (e: any) {
    console.warn(`[saveCareer] Note on bookmark: ${e?.message}`);
  }
  return getSavedCareers(profileId);
}

export async function removeSavedCareer(profileId: number, roleId: number): Promise<any[]> {
  try {
    await query('DELETE FROM bookmarks WHERE profile_id = $1 AND role_id = $2', [profileId, roleId]);
  } catch (e: any) {
    console.warn(`[removeSavedCareer] Note on bookmark deletion: ${e?.message}`);
  }
  return getSavedCareers(profileId);
}
