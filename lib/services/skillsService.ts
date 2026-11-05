import { query, queryOne } from '../db.js';
import type { Skill } from '../types.js';

export async function getAllSkills(): Promise<Skill[]> {
  const { rows } = await query('SELECT * FROM skills ORDER BY category ASC, name ASC');
  return rows;
}

export async function getSkillByIdOrSlug(idOrSlug: string | number): Promise<Skill | null> {
  const isNumeric = typeof idOrSlug === 'number' || (!isNaN(Number(idOrSlug)) && String(idOrSlug).trim() !== '');
  if (isNumeric) {
    return queryOne('SELECT * FROM skills WHERE id = $1', [Number(idOrSlug)]);
  }
  return queryOne('SELECT * FROM skills WHERE slug = $1', [String(idOrSlug).trim()]);
}

export async function getSkillPrerequisites(): Promise<any[]> {
  const sql = `
    SELECT sp.id, sp.skill_id, sp.prerequisite_skill_id,
           s1.name as skill_name, s1.slug as skill_slug,
           s2.name as prerequisite_name, s2.slug as prerequisite_slug
    FROM skill_prerequisites sp
    JOIN skills s1 ON sp.skill_id = s1.id
    JOIN skills s2 ON sp.prerequisite_skill_id = s2.id
  `;
  const { rows } = await query(sql);
  return rows;
}
