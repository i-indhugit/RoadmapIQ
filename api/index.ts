import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

import { getAllRoles, getRoleByIdOrSlug, compareRoles } from '../lib/services/rolesService.js';
import { getAllSkills, getSkillByIdOrSlug, getSkillPrerequisites } from '../lib/services/skillsService.js';
import {
  getLatestProfile,
  getProfileById,
  createProfile,
  updateProfile,
  setTargetCareer,
  getSavedCareers,
  saveCareer,
  removeSavedCareer,
} from '../lib/services/profileService.js';
import {
  getRoadmapById,
  getRoadmapByRole,
  switchCareerRoadmap,
  getRoadmapProgress,
  getRoadmapSpecializations,
  switchRoadmapSpecialization,
} from '../lib/services/roadmapService.js';
import { generateUniversalCareerRoadmap } from '../lib/engine/universalRoadmapEngine.js';
import { toggleTaskCompletion, updateTask } from '../lib/services/tasksService.js';
import { getGamificationStatus, getSkillTree, getQuests, getLeaderboard } from '../lib/services/gamificationService.js';
import { getStreakStatus, getCalendar, getDateActivities, getTodayRecommendations } from '../lib/services/activitiesService.js';
import { getPortfolio, submitEvidence } from '../lib/services/portfolioService.js';
import { askLearningAssistant, queryRag } from '../lib/services/aiService.js';
import { getDbDriver } from '../lib/db.js';

export const config = {
  runtime: 'nodejs',
};

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['*'],
}));

// Core API Router
const r = new Hono();

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
const healthHandler = (c: any) =>
  c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RoadmapIQ Vercel-Native Serverless API',
    database_driver: getDbDriver(),
    environment: process.env.NODE_ENV || 'production',
  });

r.get('/health', healthHandler);
r.get('/ready', (c) => c.json({ status: 'ready', database: 'connected' }));

// ==========================================
// 2. CAREER ROLES & DOMAINS (259+ CAREERS)
// ==========================================
r.get('/roles', async (c) => {
  try {
    const roles = await getAllRoles();
    return c.json(roles);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// Alias /careers to /roles
r.get('/careers', async (c) => {
  try {
    const roles = await getAllRoles();
    return c.json(roles);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/roles/:idOrSlug', async (c) => {
  try {
    const param = c.req.param('idOrSlug');
    const role = await getRoleByIdOrSlug(param);
    if (!role) return c.json({ detail: `Career role '${param}' not found` }, 404);
    return c.json(role);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/careers/:idOrSlug', async (c) => {
  try {
    const param = c.req.param('idOrSlug');
    const role = await getRoleByIdOrSlug(param);
    if (!role) return c.json({ detail: `Career role '${param}' not found` }, 404);
    return c.json(role);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/roles/compare', async (c) => {
  try {
    const body = await c.req.json();
    const roleIds = body.role_ids || body.ids || [];
    const roles = await compareRoles(roleIds);
    return c.json(roles);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 3. SKILLS & PREREQUISITE DAG
// ==========================================
r.get('/skills', async (c) => {
  try {
    const skills = await getAllSkills();
    return c.json(skills);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/skills/prerequisites', async (c) => {
  try {
    const prereqs = await getSkillPrerequisites();
    return c.json(prereqs);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/skills/:idOrSlug', async (c) => {
  try {
    const param = c.req.param('idOrSlug');
    const skill = await getSkillByIdOrSlug(param);
    if (!skill) return c.json({ detail: `Skill '${param}' not found` }, 404);
    return c.json(skill);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 4. STUDENT PROFILE & ATOMIC TARGET CAREER
// ==========================================
r.get('/profile/latest', async (c) => {
  try {
    const profile = await getLatestProfile();
    return c.json(profile);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/profile/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const profile = await getProfileById(id);
    if (!profile) return c.json({ detail: `Profile #${id} not found` }, 404);
    return c.json(profile);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/profile', async (c) => {
  try {
    const body = await c.req.json();
    const profile = await createProfile(body);
    return c.json(profile, 201);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.put('/profile/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const updated = await updateProfile(id, body);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// Primary atomic target career locking
r.post('/profile/target', async (c) => {
  try {
    const body = await c.req.json();
    const updated = await setTargetCareer({
      profileId: body.profile_id,
      roleId: body.role_id,
      careerSlug: body.career_slug,
      careerGoals: body.career_goals,
      targetDurationWeeks: body.target_duration_weeks,
      weeklyStudyHours: body.weekly_study_hours,
      preferredLearningFormat: body.preferred_learning_format,
    });
    return c.json(updated);
  } catch (err: any) {
    return c.json({ detail: err?.message || 'Failed to set target career' }, 400);
  }
});

r.post('/profile/:id/target', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const updated = await setTargetCareer({
      profileId: id,
      roleId: body.role_id,
      careerSlug: body.career_slug,
      careerGoals: body.career_goals,
      targetDurationWeeks: body.target_duration_weeks,
      weeklyStudyHours: body.weekly_study_hours,
      preferredLearningFormat: body.preferred_learning_format,
    });
    return c.json(updated);
  } catch (err: any) {
    return c.json({ detail: err?.message || 'Failed to set target career' }, 400);
  }
});

r.get('/profile/:id/saved-careers', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const saved = await getSavedCareers(id);
    return c.json(saved);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/profile/:id/saved-careers', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const saved = await saveCareer(id, Number(body.role_id));
    return c.json(saved);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.delete('/profile/:id/saved-careers/:roleId', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const roleId = Number(c.req.param('roleId'));
    const saved = await removeSavedCareer(id, roleId);
    return c.json(saved);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 5. UNIVERSAL 6-PHASE ROADMAPS
// ==========================================
r.post('/roadmaps/generate', async (c) => {
  try {
    const body = await c.req.json();
    const roleId = Number(body.role_id);
    const profileId = Number(body.profile_id) || (await getLatestProfile()).id;

    const roadmap = await generateUniversalCareerRoadmap({
      roleId,
      profileId,
      weeklyHours: Number(body.weekly_hours) || 15,
      targetDurationWeeks: Number(body.target_duration_weeks) || 12,
      preferredFormat: body.preferred_format || 'mixed',
    });
    const full = await getRoadmapById(roadmap.id);
    return c.json(full, 201);
  } catch (err: any) {
    return c.json({ detail: err?.message || 'Roadmap generation error' }, 400);
  }
});

r.post('/roadmaps/switch', async (c) => {
  try {
    const body = await c.req.json();
    const roleId = Number(body.role_id);
    const profileId = body.profile_id ? Number(body.profile_id) : undefined;

    const roadmap = await switchCareerRoadmap({
      profileId,
      roleId,
      weeklyHours: body.weekly_hours ? Number(body.weekly_hours) : undefined,
      targetDurationWeeks: body.target_duration_weeks ? Number(body.target_duration_weeks) : undefined,
      preferredFormat: body.preferred_format,
      forceRegenerate: !!body.force_regenerate,
    });
    return c.json(roadmap);
  } catch (err: any) {
    return c.json({ detail: err?.message || 'Career switch error' }, 400);
  }
});

r.get('/roadmaps/by-role/:roleId', async (c) => {
  try {
    const roleId = Number(c.req.param('roleId'));
    const profileIdQuery = c.req.query('profile_id');
    const profileId = profileIdQuery ? Number(profileIdQuery) : undefined;

    const roadmap = await getRoadmapByRole(roleId, profileId);
    if (!roadmap) return c.json({ detail: 'Roadmap not found' }, 404);
    return c.json(roadmap);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/roadmaps/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const roadmap = await getRoadmapById(id);
    if (!roadmap) return c.json({ detail: `Roadmap #${id} not found` }, 404);
    return c.json(roadmap);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/roadmaps/:id/progress', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const progress = await getRoadmapProgress(id);
    return c.json(progress);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/roadmaps/:id/specializations', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const spec = await getRoadmapSpecializations(id);
    return c.json(spec);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/roadmaps/:id/specialization', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const branchId = body.branch_id || body.specialization_branch;
    const spec = await switchRoadmapSpecialization(id, branchId);
    return c.json(spec);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 6. TASKS & MILESTONE COMPLETION
// ==========================================
r.patch('/tasks/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    if (body.is_completed !== undefined) {
      const updated = await toggleTaskCompletion(id, Boolean(body.is_completed), body.actual_hours_spent);
      return c.json(updated);
    }

    const updated = await updateTask(id, body);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 7. GAMIFICATION, QUESTS & SKILL TREE
// ==========================================
r.get('/gamification/status', async (c) => {
  try {
    const profileIdQuery = c.req.query('profile_id');
    const profileId = profileIdQuery ? Number(profileIdQuery) : undefined;
    const status = await getGamificationStatus(profileId);
    return c.json(status);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/gamification/profile', async (c) => {
  try {
    const profileIdQuery = c.req.query('profile_id');
    const profileId = profileIdQuery ? Number(profileIdQuery) : undefined;
    const status = await getGamificationStatus(profileId);
    return c.json(status);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/gamification/tree', async (c) => {
  try {
    const roleIdQuery = c.req.query('role_id');
    const roleId = roleIdQuery ? Number(roleIdQuery) : undefined;
    const tree = await getSkillTree(roleId);
    return c.json(tree);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/gamification/quests', async (c) => {
  try {
    const roadmapIdQuery = c.req.query('roadmap_id');
    const roadmapId = roadmapIdQuery ? Number(roadmapIdQuery) : undefined;
    const quests = await getQuests(roadmapId);
    return c.json(quests);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/gamification/leaderboard', async (c) => {
  try {
    const leaderboard = await getLeaderboard();
    return c.json(leaderboard);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 8. ACTIVITIES & LEARNING CALENDAR
// ==========================================
r.get('/activities/students/:id/streak-status', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const tz = c.req.query('timezone') || 'UTC';
    const status = await getStreakStatus(id, tz);
    return c.json(status);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/activities/students/:id/calendar', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const year = Number(c.req.query('year')) || new Date().getFullYear();
    const month = Number(c.req.query('month')) || new Date().getMonth() + 1;
    const category = c.req.query('category');
    const cal = await getCalendar(id, year, month, category);
    return c.json(cal);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/activities/students/:id/date/:dateStr', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const dateStr = c.req.param('dateStr');
    const category = c.req.query('category');
    const activities = await getDateActivities(id, dateStr, category);
    return c.json(activities);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.get('/activities/students/:id/today-recommendations', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const recs = await getTodayRecommendations(id);
    return c.json(recs);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 9. PORTFOLIO & EVIDENCE
// ==========================================
r.get('/portfolio/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const portfolio = await getPortfolio(id);
    return c.json(portfolio);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/portfolio/:id/evidence', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const portfolio = await submitEvidence(id, {
      taskId: Number(body.task_id),
      evidenceLink: String(body.evidence_link || body.link),
    });
    return c.json(portfolio);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// ==========================================
// 10. AI MENTOR & GROUNDED RAG
// ==========================================
r.get('/ai/status', (c) =>
  c.json({
    ai_status: 'online',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    rag_enabled: true,
  })
);

r.post('/ai/learning-assistant', async (c) => {
  try {
    const body = await c.req.json();
    const res = await askLearningAssistant({
      question: body.question || body.message,
      topic: body.topic,
      careerRole: body.career_role || body.career,
    });
    return c.json(res);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

r.post('/rag/query', async (c) => {
  try {
    const body = await c.req.json();
    const res = await queryRag({ queryText: body.query || body.query_text });
    return c.json(res);
  } catch (err: any) {
    return c.json({ error: err?.message }, 500);
  }
});

// Mount router on both '/' and '/api' for complete resilience across Vercel rewrite patterns
app.route('/', r);
app.route('/api', r);

// Export underlying Hono app and Vercel handler
export { app };
export default handle(app);
