import { query, queryOne } from '../db.js';
import type { Roadmap, RoadmapTask, CareerRole } from '../types.js';
import { generateUniversalCareerRoadmap, getSpecializationBranches } from '../engine/universalRoadmapEngine.js';
import { getRoleByIdOrSlug } from './rolesService.js';

export async function getRoadmapById(id: number): Promise<Roadmap | null> {
  const roadmap = await queryOne('SELECT * FROM roadmaps WHERE id = $1', [id]);
  if (!roadmap) return null;

  // Fetch all tasks for this roadmap
  const { rows: tasks } = await query(
    `SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY phase_number ASC, week_number ASC, order_in_week ASC`,
    [id]
  );
  roadmap.tasks = tasks;

  if (roadmap.role_id) {
    roadmap.role = await getRoleByIdOrSlug(roadmap.role_id);
  }

  return roadmap;
}

export async function getRoadmapByRole(roleId: number, profileId?: number): Promise<Roadmap | null> {
  let pId = profileId;
  if (!pId) {
    const latest = await queryOne('SELECT id FROM student_profiles ORDER BY updated_at DESC, id DESC LIMIT 1');
    pId = latest?.id || 1;
  }

  let roadmap = await queryOne(
    `SELECT * FROM roadmaps WHERE profile_id = $1 AND role_id = $2 ORDER BY updated_at DESC, id DESC LIMIT 1`,
    [pId, roleId]
  );

  // If no roadmap exists yet for this role, auto-generate it (No assessment required)
  if (!roadmap) {
    roadmap = await generateUniversalCareerRoadmap({
      roleId,
      profileId: pId,
      weeklyHours: 15,
      targetDurationWeeks: 12,
    });
  }

  return getRoadmapById(roadmap.id);
}

export async function switchCareerRoadmap(params: {
  profileId?: number;
  roleId: number;
  weeklyHours?: number;
  targetDurationWeeks?: number;
  preferredFormat?: string;
  forceRegenerate?: boolean;
}): Promise<Roadmap> {
  const { roleId, weeklyHours = 15, targetDurationWeeks = 12, preferredFormat = 'mixed', forceRegenerate = false } = params;

  let profileId = params.profileId;
  if (!profileId) {
    const latest = await queryOne('SELECT id FROM student_profiles ORDER BY updated_at DESC, id DESC LIMIT 1');
    profileId = latest?.id || 1;
  }

  // Sync profile's target_role_id
  const now = new Date().toISOString();
  await query('UPDATE student_profiles SET target_role_id = $1, updated_at = $2 WHERE id = $3', [roleId, now, profileId]);

  // Check if existing roadmap exists
  if (!forceRegenerate) {
    const existing = await queryOne(
      'SELECT id FROM roadmaps WHERE profile_id = $1 AND role_id = $2 ORDER BY updated_at DESC, id DESC LIMIT 1',
      [profileId, roleId]
    );

    if (existing) {
      const taskCountRes = await queryOne('SELECT count(*) as count FROM roadmap_tasks WHERE roadmap_id = $1', [existing.id]);
      if (Number(taskCountRes?.count || 0) > 0) {
        await query('UPDATE roadmaps SET updated_at = $1 WHERE id = $2', [now, existing.id]);
        const fullExisting = await getRoadmapById(existing.id);
        if (fullExisting) return fullExisting;
      }
    }
  }

  // Generate new 6-phase roadmap
  const newRoadmap = await generateUniversalCareerRoadmap({
    roleId,
    profileId,
    weeklyHours,
    targetDurationWeeks,
    preferredFormat,
  });

  const full = await getRoadmapById(newRoadmap.id);
  if (!full) throw new Error('Failed to create new roadmap');
  return full;
}

export async function getRoadmapProgress(roadmapId: number): Promise<any> {
  const roadmap = await queryOne('SELECT * FROM roadmaps WHERE id = $1', [roadmapId]);
  if (!roadmap) throw new Error(`Roadmap #${roadmapId} not found`);

  const { rows: tasks } = await query('SELECT * FROM roadmap_tasks WHERE roadmap_id = $1', [roadmapId]);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.is_completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let totalHoursSpent = 0;
  for (const t of tasks) {
    if (t.is_completed) {
      totalHoursSpent += Number(t.actual_hours_spent || t.estimated_hours || 0);
    }
  }

  // Phase breakdown
  const phaseStats: Record<number, { name: string; total: number; completed: number }> = {};
  for (const t of tasks) {
    const pNum = t.phase_number || 1;
    if (!phaseStats[pNum]) {
      phaseStats[pNum] = { name: t.phase_name || `Phase ${pNum}`, total: 0, completed: 0 };
    }
    phaseStats[pNum].total += 1;
    if (t.is_completed) phaseStats[pNum].completed += 1;
  }

  return {
    roadmap_id: roadmapId,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_percentage: completionPercentage,
    hours_spent: totalHoursSpent,
    total_estimated_hours: roadmap.total_estimated_hours,
    readiness_score: Math.min(100, Math.round(50 + completionPercentage * 0.5)),
    phases: Object.entries(phaseStats).map(([num, stats]) => ({
      phase_number: Number(num),
      phase_name: stats.name,
      total_tasks: stats.total,
      completed_tasks: stats.completed,
      is_completed: stats.completed >= stats.total && stats.total > 0,
    })),
  };
}

export async function getRoadmapSpecializations(roadmapId: number): Promise<any> {
  const roadmap = await queryOne('SELECT * FROM roadmaps WHERE id = $1', [roadmapId]);
  if (!roadmap) throw new Error(`Roadmap #${roadmapId} not found`);

  const role = await getRoleByIdOrSlug(roadmap.role_id);
  const branches = getSpecializationBranches(role?.domain || 'Technology');

  // Find currently active branch from tasks
  const activeTask = await queryOne('SELECT specialization_branch FROM roadmap_tasks WHERE roadmap_id = $1 AND specialization_branch IS NOT NULL LIMIT 1', [roadmapId]);

  return {
    roadmap_id: roadmapId,
    domain: role?.domain || 'Technology',
    active_branch: activeTask?.specialization_branch || branches[0]?.id || 'core',
    specializations: branches,
  };
}

export async function switchRoadmapSpecialization(roadmapId: number, branchId: string): Promise<any> {
  const now = new Date().toISOString();
  await query(
    `UPDATE roadmap_tasks SET specialization_branch = $1, updated_at = $2 WHERE roadmap_id = $3 AND phase_number >= 5`,
    [branchId, now, roadmapId]
  );
  return getRoadmapSpecializations(roadmapId);
}
