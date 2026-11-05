import { query, queryOne } from '../db.js';
import type { CareerRole } from '../types.js';

export async function getAllRoles(): Promise<CareerRole[]> {
  const sql = `
    SELECT id, title, slug, domain, subdomain, description, category,
           average_salary_range as salary_range, market_demand as growth_rate,
           daily_responsibilities, required_education, eligibility_requirements,
           optional_qualifications, preferred_skills, soft_skills, certifications_or_exams,
           career_progression, is_regulated_profession, regulatory_disclaimer,
           tools_and_technologies, core_competencies, assessment_duration_mins,
           assessment_question_count, difficulty_distribution, created_at
    FROM career_roles
    ORDER BY domain ASC, title ASC
  `;
  const { rows } = await query(sql);
  return rows;
}

export async function getRoleByIdOrSlug(idOrSlug: string | number): Promise<CareerRole | null> {
  const isNumeric = typeof idOrSlug === 'number' || (!isNaN(Number(idOrSlug)) && String(idOrSlug).trim() !== '');

  let role: CareerRole | null = null;
  if (isNumeric) {
    role = await queryOne('SELECT * FROM career_roles WHERE id = $1', [Number(idOrSlug)]);
  } else {
    role = await queryOne('SELECT * FROM career_roles WHERE slug = $1', [String(idOrSlug).trim()]);
  }

  if (!role) return null;

  // Attach associated skills
  const skillsSql = `
    SELECT s.id, s.name, s.slug, s.category, s.description,
           r.importance_weight as importance, r.required_proficiency as min_proficiency
    FROM role_skill_requirements r
    JOIN skills s ON r.skill_id = s.id
    WHERE r.role_id = $1
    ORDER BY r.required_proficiency ASC
  `;
  const { rows: skillRows } = await query(skillsSql, [role.id]);
  role.skills = skillRows;

  return role;
}

export async function compareRoles(roleIds: number[]): Promise<CareerRole[]> {
  if (!roleIds || roleIds.length === 0) return [];
  const validIds = roleIds.slice(0, 4).map(Number);
  const placeholders = validIds.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `SELECT * FROM career_roles WHERE id IN (${placeholders})`;
  const { rows } = await query(sql, validIds);
  return rows;
}
