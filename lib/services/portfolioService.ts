import { query, queryOne } from '../db.js';

export async function getPortfolio(profileId: number): Promise<any> {
  const profile = await queryOne('SELECT * FROM student_profiles WHERE id = $1', [profileId]);
  if (!profile) throw new Error(`Profile #${profileId} not found`);

  // Completed tasks with deliverables or evidence
  const { rows: completedTasks } = await query(
    `SELECT t.id, t.title, t.deliverable, t.evidence_link, t.phase_name, t.actual_hours_spent, r.role_id, cr.title as role_title
     FROM roadmap_tasks t
     JOIN roadmaps r ON t.roadmap_id = r.id
     JOIN career_roles cr ON r.role_id = cr.id
     WHERE r.profile_id = $1 AND t.is_completed = true
     ORDER BY t.updated_at DESC`,
    [profileId]
  );

  // Associated skills
  const { rows: skills } = await query(
    `SELECT DISTINCT s.id, s.name, s.category, t.evidence_link, t.is_completed
     FROM roadmap_tasks t
     JOIN roadmaps r ON t.roadmap_id = r.id
     JOIN skills s ON t.skill_id = s.id
     WHERE r.profile_id = $1
     ORDER BY s.name ASC`,
    [profileId]
  );

  return {
    profile_id: profileId,
    display_name: profile.display_name,
    target_role_id: profile.target_role_id,
    total_deliverables: completedTasks.length,
    skills: skills.map((s: any) => ({
      name: s.name,
      category: s.category,
      verified: !!s.is_completed,
      evidence_link: s.evidence_link || null,
    })),
    deliverables: completedTasks,
  };
}

export async function submitEvidence(profileId: number, data: { taskId: number; evidenceLink: string }): Promise<any> {
  const { taskId, evidenceLink } = data;
  const now = new Date().toISOString();

  await query(
    `UPDATE roadmap_tasks SET evidence_link = $1, is_completed = true, status = 'completed', updated_at = $2 WHERE id = $3`,
    [evidenceLink, now, taskId]
  );

  return getPortfolio(profileId);
}
