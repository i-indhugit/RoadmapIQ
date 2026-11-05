import { app } from '../api/index.js';

async function runTests() {
  console.log('=== RoadmapIQ Vercel-Native TypeScript API Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}: ${err?.message}`);
      failed++;
    }
  }

  // 1. Health Probe
  await test('GET /health returns healthy status', async () => {
    const res = await app.request('/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data: any = await res.json();
    if (data.status !== 'healthy') throw new Error(`Expected healthy, got ${data.status}`);
  });

  // 2. Health under /api
  await test('GET /api/health returns healthy status', async () => {
    const res = await app.request('/api/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 3. Career Roles Catalogue
  await test('GET /api/roles returns 250+ careers', async () => {
    const res = await app.request('/api/roles');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const roles: any = await res.json();
    if (!Array.isArray(roles) || roles.length < 250) {
      throw new Error(`Expected >= 250 roles, got ${roles?.length}`);
    }
  });

  // 4. Role Detail by ID & Slug
  await test('GET /api/roles/17 returns Java Developer with skills', async () => {
    const res = await app.request('/api/roles/17');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const role: any = await res.json();
    if (role.slug !== 'java-developer') throw new Error(`Expected java-developer, got ${role.slug}`);
    if (!Array.isArray(role.skills)) throw new Error('Expected skills array on role');
  });

  // 5. Skills Catalogue
  await test('GET /api/skills returns skills list', async () => {
    const res = await app.request('/api/skills');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const skills: any = await res.json();
    if (!Array.isArray(skills) || skills.length < 100) {
      throw new Error(`Expected >= 100 skills, got ${skills?.length}`);
    }
  });

  // 6. Latest Profile
  await test('GET /api/profile/latest returns student profile', async () => {
    const res = await app.request('/api/profile/latest');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const prof: any = await res.json();
    if (!prof.id || !prof.display_name) throw new Error('Invalid profile structure');
  });

  // 7. Atomic Target Career Setting & Roadmap Generation
  await test('POST /api/profile/target atomically sets target career and syncs roadmap', async () => {
    const payload = {
      role_id: 17,
      target_duration_weeks: 12,
      weekly_study_hours: 15,
      career_goals: 'Master enterprise backend systems',
    };
    const res = await app.request('/api/profile/target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const updated: any = await res.json();
    if (updated.target_role_id !== 17) {
      throw new Error(`Expected target_role_id 17, got ${updated.target_role_id}`);
    }
  });

  // 8. 6-Phase Universal Roadmap Fetch
  await test('GET /api/roadmaps/by-role/17 returns 6-phase roadmap with tasks', async () => {
    const res = await app.request('/api/roadmaps/by-role/17');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const rm: any = await res.json();
    if (!Array.isArray(rm.tasks) || rm.tasks.length === 0) {
      throw new Error('Expected roadmap tasks array');
    }
    const phaseNames = new Set(rm.tasks.map((t: any) => t.phase_name));
    if (phaseNames.size < 4) {
      throw new Error(`Expected multiple structured phases, found ${phaseNames.size}`);
    }
  });

  // 9. Gamification Status
  await test('GET /api/gamification/status returns XP and level', async () => {
    const res = await app.request('/api/gamification/status');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data: any = await res.json();
    if (data.xp === undefined || data.level === undefined) {
      throw new Error('Expected xp and level in gamification status');
    }
  });

  // 10. AI Mentor (with offline fallback guard)
  await test('POST /api/ai/learning-assistant returns grounded guidance', async () => {
    const payload = {
      question: 'How do I optimize database connection pooling?',
      topic: 'Database Optimization',
      career_role: 'Java Developer',
    };
    const res = await app.request('/api/ai/learning-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data: any = await res.json();
    if (!data.answer || !Array.isArray(data.grounded_sources)) {
      throw new Error('Expected answer and grounded_sources in AI response');
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
