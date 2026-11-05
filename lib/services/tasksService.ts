import { query, queryOne } from '../db.js';
import type { RoadmapTask } from '../types.js';

export async function toggleTaskCompletion(taskId: number, isCompleted: boolean, actualHoursSpent?: number): Promise<RoadmapTask> {
  const task = await queryOne('SELECT * FROM roadmap_tasks WHERE id = $1', [taskId]);
  if (!task) throw new Error(`Task #${taskId} not found`);

  const now = new Date().toISOString();
  const status = isCompleted ? 'completed' : 'not_started';
  const hours = actualHoursSpent !== undefined ? actualHoursSpent : (isCompleted ? task.estimated_hours || 2.0 : 0.0);

  await query(
    `UPDATE roadmap_tasks SET
      is_completed = $1,
      status = $2,
      actual_hours_spent = $3,
      updated_at = $4
     WHERE id = $5`,
    [isCompleted, status, hours, now, taskId]
  );

  // If completed, award XP to profile and log daily activity
  if (isCompleted) {
    const roadmap = await queryOne('SELECT profile_id, role_id FROM roadmaps WHERE id = $1', [task.roadmap_id]);
    if (roadmap) {
      const xpReward = task.xp_reward || (task.phase_number >= 4 ? 100 : 50);
      const todayStr = now.split('T')[0];

      // Update student profile XP
      await query(
        `UPDATE student_profiles SET
          xp = xp + $1,
          last_active_date = $2,
          updated_at = $3
         WHERE id = $4`,
        [xpReward, todayStr, now, roadmap.profile_id]
      );

      // Log daily activity
      try {
        await query(
          `INSERT INTO daily_activity_logs (
            profile_id, activity_type, category, career_role_id, task_id,
            xp_earned, duration_minutes, completed_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            roadmap.profile_id,
            'task_completion',
            task.activity_category || 'LEARN',
            roadmap.role_id,
            taskId,
            xpReward,
            Math.round(hours * 60) || 30,
            todayStr,
          ]
        );
      } catch (err: any) {
        console.warn(`[toggleTaskCompletion] Activity logging note: ${err?.message}`);
      }
    }
  }

  const updated = await queryOne('SELECT * FROM roadmap_tasks WHERE id = $1', [taskId]);
  if (!updated) throw new Error('Failed to retrieve updated task');
  return updated;
}

export async function updateTask(taskId: number, data: Partial<RoadmapTask>): Promise<RoadmapTask> {
  const task = await queryOne('SELECT * FROM roadmap_tasks WHERE id = $1', [taskId]);
  if (!task) throw new Error(`Task #${taskId} not found`);

  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    if (['id', 'roadmap_id', 'created_at'].includes(key)) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(val);
  }

  fields.push(`updated_at = $${idx++}`);
  values.push(now);
  values.push(taskId);

  await query(`UPDATE roadmap_tasks SET ${fields.join(', ')} WHERE id = $${idx}`, values);

  const updated = await queryOne('SELECT * FROM roadmap_tasks WHERE id = $1', [taskId]);
  return updated;
}
