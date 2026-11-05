import axios from 'axios';

// Centralized base URL configured through frontend environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor with structured error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred while communicating with RoadmapIQ.';

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        friendlyMessage = 'Request timed out. The RoadmapIQ server took too long to respond.';
      } else {
        friendlyMessage = 'Unable to connect to RoadmapIQ backend. Please verify the FastAPI server is running at ' + API_BASE_URL;
      }
    } else {
      const data = error.response.data;
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          friendlyMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Pydantic validation errors
          friendlyMessage = data.detail.map((err) => `${err.loc?.join('.') || 'Field'}: ${err.msg}`).join(', ');
        }
      } else if (data && data.message) {
        friendlyMessage = data.message;
      } else {
        friendlyMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
      }
    }

    const customError = new Error(friendlyMessage);
    customError.status = error.response ? error.response.status : null;
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

export const healthApi = {
  check: () => apiClient.get('/health'),
};

export const rolesApi = {
  getAll: () => apiClient.get('/roles'),
  getDetail: (idOrSlug) => apiClient.get(`/roles/${idOrSlug}`),
  compare: (data) => apiClient.post('/roles/compare', data),
};

export const skillsApi = {
  getAll: () => apiClient.get('/skills'),
  getPrerequisites: () => apiClient.get('/skills/prerequisites'),
  getDetail: (idOrSlug) => apiClient.get(`/skills/${idOrSlug}`),
};

export const assessmentApi = {
  getAssessableSkills: () => apiClient.get('/assessment/available-skills'),
  getQuiz: (idOrSlug) => apiClient.get(`/assessment/quiz/${idOrSlug}`),
  submit: (data) => apiClient.post('/assessment/submit', data),
};

export const profileApi = {
  create: (data) => apiClient.post('/profile', data),
  getLatest: () => apiClient.get('/profile/latest'),
  get: (id) => apiClient.get(`/profile/${id}`),
  update: (id, data) => apiClient.put(`/profile/${id}`, data),
};

export const roadmapsApi = {
  generate: (data) => apiClient.post('/roadmaps/generate', data),
  switchCareer: (data) => apiClient.post('/roadmaps/switch', data),
  getByRole: (roleId, profileId) => apiClient.get(`/roadmaps/by-role/${roleId}`, { params: { profile_id: profileId } }),
  get: (id) => apiClient.get(`/roadmaps/${id}`),
  getProgress: (id) => apiClient.get(`/roadmaps/${id}/progress`),
  getSkillGaps: (id) => apiClient.get(`/roadmaps/${id}/skill-gaps`),
  analyzeGaps: (roleId, skills) => apiClient.post('/skill-gaps/analyze', skills, { params: { role_id: roleId } }),
  reschedule: (roadmapId, data) => apiClient.post(`/roadmaps/${roadmapId}/reschedule`, data),
  getSpecializations: (roadmapId) => apiClient.get(`/roadmaps/${roadmapId}/specializations`),
  switchSpecialization: (roadmapId, data) => apiClient.post(`/roadmaps/${roadmapId}/specialization`, data),
};

export const tasksApi = {
  toggle: (taskId, isCompleted) => apiClient.patch(`/tasks/${taskId}`, { is_completed: isCompleted }),
  update: (taskId, data) => apiClient.patch(`/tasks/${taskId}`, data),
};

export const resourcesApi = {
  getAll: (params = {}) => apiClient.get('/resources', { params }),
  toggleBookmark: (resourceId, profileId) => apiClient.post(`/resources/${resourceId}/bookmark`, null, { params: { profile_id: profileId } }),
};

export const projectsApi = {
  getAll: (params = {}) => apiClient.get('/projects', { params }),
  getDetail: (idOrSlug) => apiClient.get(`/projects/${idOrSlug}`),
};

export const interviewApi = {
  getQuestions: (params = {}) => apiClient.get('/interview/questions', { params }),
  updateStatus: (questionId, data) => apiClient.patch(`/interview/questions/${questionId}`, data),
  getFeedback: (data) => apiClient.post('/interview/feedback', data),
};

export const careerAssessmentApi = {
  getCareers: () => apiClient.get('/careers'),
  getCareerDetail: (idOrSlug) => apiClient.get(`/careers/${idOrSlug}`),
  getCareerOverview: (idOrSlug) => apiClient.get(`/careers/${idOrSlug}/overview`),
  getCareerSkills: (idOrSlug) => apiClient.get(`/careers/${idOrSlug}/skills`),
  startAssessment: (data) => apiClient.post('/assessments/start', data),
  getAttempt: (attemptId) => apiClient.get(`/assessments/${attemptId}`),
  saveAnswers: (attemptId, data) => apiClient.post(`/assessments/${attemptId}/answers`, data),
  submitAssessment: (attemptId, data) => apiClient.post(`/assessments/${attemptId}/submit`, data),
  getResults: (attemptId) => apiClient.get(`/assessments/${attemptId}/results`),
  getSkillAnalysis: (attemptId) => apiClient.get(`/assessments/${attemptId}/skill-analysis`),
  generateRoadmapFromAssessment: (data) => apiClient.post('/roadmaps/generate-from-assessment', data),
  getHistory: (profileId) => apiClient.get(`/students/${profileId}/assessment-history`),
  reassess: (data) => apiClient.post('/assessments/reassess', data),
  compareAttempts: (attemptId, previousAttemptId) => apiClient.get(`/assessments/${attemptId}/compare/${previousAttemptId}`),
};

export const discoveryApi = {
  getQuestions: () => apiClient.get('/careers/discovery-questions'),
  discover: (data) => apiClient.post('/careers/discover', data),
};

export const activitiesApi = {
  complete: (data) => apiClient.post('/activities/complete', data),
  getStreakStatus: (studentId, timezone = 'UTC') => apiClient.get(`/activities/students/${studentId}/streak-status`, { params: { timezone } }),
  setWeeklyGoal: (studentId, data) => apiClient.post(`/activities/students/${studentId}/weekly-goal`, data),
  getTodayRecommendations: (studentId) => apiClient.get(`/activities/students/${studentId}/today-recommendations`),
  // Personal Learning Calendar
  getCalendar: (studentId, year, month, category) =>
    apiClient.get(`/activities/students/${studentId}/calendar`, { params: { year, month, ...(category && category !== 'all' ? { category } : {}) } }),
  getDateActivities: (studentId, dateStr, category) =>
    apiClient.get(`/activities/students/${studentId}/date/${dateStr}`, { params: { ...(category && category !== 'all' ? { category } : {}) } }),
  getAnalytics: (studentId, timeframe = 'monthly', year, month) =>
    apiClient.get(`/activities/students/${studentId}/analytics`, { params: { timeframe, ...(year ? { year } : {}), ...(month ? { month } : {}) } }),
};

export const journeyApi = {
  get: (profileId) => apiClient.get(`/journey/${profileId}`),
};

export const portfolioApi = {
  get: (profileId) => apiClient.get(`/portfolio/${profileId}`),
  submitEvidence: (profileId, data) => apiClient.post(`/portfolio/${profileId}/evidence`, data),
};

export const aiApi = {
  getStatus: () => apiClient.get('/ai/status'),
  testGemini: () => apiClient.get('/ai/test'),
  getRoadmapAdvice: (data) => apiClient.post('/ai/roadmap-advice', data),
  getSkillGapExplanation: (data) => apiClient.post('/ai/skill-gap-explanation', data),
  askAssistant: (data) => apiClient.post('/ai/learning-assistant', data),
  getProjectMentor: (data) => apiClient.post('/ai/project-mentor', data),
  generateWeeklyPlan: (data) => apiClient.post('/ai/weekly-plan', data),
  getProjectRecommendations: (data) => apiClient.post('/ai/project-recommendations', data),
  generateInterviewQuestions: (data) => apiClient.post('/ai/interview-questions', data),
  evaluateInterviewAnswer: (data) => apiClient.post('/ai/interview-feedback', data),
  getMilestoneTutor: (data) => apiClient.post('/ai/milestone-tutor', data),
};

export const ragApi = {
  query: (data) => apiClient.post('/rag/query', data),
  getMilestoneBundle: (data) => apiClient.post('/rag/milestone-bundle', data),
  getAdminDocs: (params) => apiClient.get('/rag/admin/documents', { params }),
  ingestDoc: (data) => apiClient.post('/rag/admin/documents/ingest', data),
  deleteDoc: (id) => apiClient.delete(`/rag/admin/documents/${id}`),
  getAdminStats: () => apiClient.get('/rag/admin/stats'),
  testRetrieval: (params) => apiClient.post('/rag/admin/test-retrieval', null, { params }),
};

export const gamificationApi = {
  getStatus: (profileId) => apiClient.get('/gamification/status', { params: profileId ? { profile_id: profileId } : {} }),
  getPlayerProfile: (profileId) => apiClient.get('/gamification/profile', { params: profileId ? { profile_id: profileId } : {} }),
  getXpHistory: (profileId, limit = 20) => apiClient.get('/gamification/xp-history', { params: { ...(profileId ? { profile_id: profileId } : {}), limit } }),
  getAchievements: (profileId) => apiClient.get('/gamification/achievements', { params: profileId ? { profile_id: profileId } : {} }),
  getQuests: (roadmapId) => apiClient.get('/gamification/quests', { params: roadmapId ? { roadmap_id: roadmapId } : {} }),
  completeQuest: (taskId) => apiClient.post(`/gamification/quests/${taskId}/complete`),
  getDailyChallenge: () => apiClient.get('/gamification/daily-challenge'),
  submitDailyChallenge: (data) => apiClient.post('/gamification/daily-challenge/submit', data),
  getSkillTree: (roleId, profileId) => apiClient.get('/gamification/tree', {
    params: {
      ...(roleId ? { role_id: roleId } : {}),
      ...(profileId ? { profile_id: profileId } : {})
    }
  }),
  getBosses: (profileId) => apiClient.get('/gamification/bosses', { params: profileId ? { profile_id: profileId } : {} }),
  getBossDetail: (bossId, profileId) => apiClient.get(`/gamification/bosses/${bossId}`, { params: profileId ? { profile_id: profileId } : {} }),
  fightBoss: (bossId, data) => apiClient.post(`/gamification/bosses/${bossId}/battle`, data),
  getArenaChallenges: (arenaType = 'all', profileId) => apiClient.get('/gamification/arena', {
    params: {
      ...(arenaType && arenaType !== 'all' ? { arena_type: arenaType } : {}),
      ...(profileId ? { profile_id: profileId } : {})
    }
  }),
  getArenaDetail: (challengeId, profileId) => apiClient.get(`/gamification/arena/${challengeId}`, { params: profileId ? { profile_id: profileId } : {} }),
  submitArenaChallenge: (challengeId, data) => apiClient.post(`/gamification/arena/${challengeId}/submit`, data),
  getLeaderboard: () => apiClient.get('/gamification/leaderboard'),
  toggleLeaderboardPrivacy: (profileId) => apiClient.post('/gamification/leaderboard/toggle', null, { params: profileId ? { profile_id: profileId } : {} }),
  getReadiness: (profileId) => apiClient.get('/gamification/readiness', { params: profileId ? { profile_id: profileId } : {} }),
};

export default apiClient;
