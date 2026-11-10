import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  authApi,
  healthApi,
  rolesApi,
  skillsApi,
  profileApi,
  roadmapsApi,
  tasksApi,
  aiApi,
  gamificationApi
} from '../services/api';
import { getCareerTheme, applyThemeToDocument } from '../utils/careerThemes';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PROFILE_ID: 'roadmapiq_profile_id',
  ROADMAP_ID: 'roadmapiq_roadmap_id',
  ROLE_ID: 'roadmapiq_role_id',
  AUTH_TOKEN: 'roadmapiq_auth_token',
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [activeRoadmapProgress, setActiveRoadmapProgress] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [backendOnline, setBackendOnline] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSwitchingCareer, setIsSwitchingCareer] = useState(false);

  // Stale API response & race condition sequence tracker
  const switchRequestSeq = useRef(0);

  // Dynamic Career Theme state - automatically updates throughout the entire application
  const activeTheme = useMemo(() => {
    const roleSlugOrTitle = activeRole?.slug || activeRole?.title || activeRoadmap?.role_title || '';
    return getCareerTheme(roleSlugOrTitle);
  }, [activeRole?.slug, activeRole?.title, activeRoadmap?.role_title]);

  // Synchronize CSS custom properties on document.documentElement whenever activeTheme changes
  useEffect(() => {
    if (activeTheme) {
      applyThemeToDocument(activeTheme);
    }
  }, [activeTheme]);

  // Gamification state: XP, level, badges, streak
  const [gamification, setGamification] = useState({
    xp: 100,
    level: 1,
    levelTitle: 'Beginner Explorer',
    nextLevelXp: 250,
    levelProgressPct: 40.0,
    streakDays: 1,
    badges: [],
    missionsCompleted: 0,
    skillsUnlocked: 0,
    dailyChallengeDone: false,
  });

  // Haptic/confetti celebration particle animation adapting to current career palette
  const triggerCelebration = useCallback((options = {}) => {
    try {
      const palette = activeTheme?.palette;
      const themeColors = palette
        ? [palette.primary, palette.secondary, palette.accent, '#ffffff']
        : ['#00d2ff', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: themeColors,
        ...options,
      });
    } catch (e) {
      console.debug('Confetti effect trigger:', e);
    }
  }, [activeTheme]);

  // Toast management
  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check health and AI status
  const checkHealth = useCallback(async () => {
    try {
      await healthApi.check();
      setBackendOnline(true);
      const ai = await aiApi.getStatus();
      setAiStatus(ai);
    } catch (err) {
      setBackendOnline(false);
      setAiStatus({
        enabled: false,
        available: false,
        provider: 'Disconnected',
        model: 'None',
        message: 'FastAPI backend is offline or unreachable'
      });
    }
  }, []);

  // Load roles and skills catalog
  const loadCatalogs = useCallback(async () => {
    try {
      const [roles, skills] = await Promise.all([
        rolesApi.getAll(),
        skillsApi.getAll(),
      ]);
      setAllRoles(roles);
      setAllSkills(skills);
      return { roles, skills };
    } catch (err) {
      console.warn('Could not load catalogs:', err.message);
      return { roles: [], skills: [] };
    }
  }, []);

  // Fetch or reload profile (prefers token-bound /profile/latest when authenticated)
  const refreshProfile = useCallback(async (profileId = null) => {
    try {
      let prof = null;
      const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
      if (!profileId && hasToken) {
        prof = await profileApi.getLatest().catch(() => null);
      }
      if (!prof) {
        const targetId = profileId || localStorage.getItem(STORAGE_KEYS.PROFILE_ID);
        if (targetId) {
          try {
            prof = await profileApi.get(targetId);
          } catch {
            prof = await profileApi.getLatest().catch(() => null);
          }
        } else {
          prof = await profileApi.getLatest().catch(() => null);
        }
      }

      if (prof) {
        setProfile(prof);
        localStorage.setItem(STORAGE_KEYS.PROFILE_ID, prof.id.toString());
      }
      return prof;
    } catch (err) {
      console.warn('Profile load note:', err.message);
      return null;
    }
  }, []);

  // Fetch or reload roadmap & progress for a given roadmap or active role
  const refreshRoadmap = useCallback(async (roadmapId = null, roleId = null) => {
    try {
      const effectiveRoleId = roleId || profile?.target_role_id || localStorage.getItem(STORAGE_KEYS.ROLE_ID);
      let roadmapData = null;

      // 1. If we have a profile and role, retrieve that role's specific saved roadmap
      if (effectiveRoleId && profile?.id) {
        try {
          roadmapData = await roadmapsApi.getByRole(Number(effectiveRoleId), profile.id);
        } catch {
          // Fall back to target ID lookup
        }
      }

      // 2. Fall back to target roadmap ID
      if (!roadmapData) {
        const targetId = roadmapId || localStorage.getItem(STORAGE_KEYS.ROADMAP_ID);
        if (targetId) {
          roadmapData = await roadmapsApi.get(targetId).catch(() => null);
        }
      }

      if (roadmapData) {
        setActiveRoadmap(roadmapData);
        localStorage.setItem(STORAGE_KEYS.ROADMAP_ID, roadmapData.id.toString());
        if (roadmapData.role_id) {
          localStorage.setItem(STORAGE_KEYS.ROLE_ID, roadmapData.role_id.toString());
        }

        const progressData = await roadmapsApi.getProgress(roadmapData.id).catch(() => null);
        setActiveRoadmapProgress(progressData);
        return roadmapData;
      }
      return null;
    } catch (err) {
      console.warn('Roadmap load note:', err.message);
      return null;
    }
  }, [profile?.target_role_id, profile?.id]);

  // Dynamic career switching with race-condition guard and progress preservation
  const switchCareer = useCallback(async (roleOrId, options = {}) => {
    if (!roleOrId) return null;

    let targetRoleId = null;
    if (typeof roleOrId === 'number') {
      targetRoleId = roleOrId;
    } else if (typeof roleOrId === 'string' && !isNaN(Number(roleOrId)) && roleOrId.trim() !== '') {
      targetRoleId = Number(roleOrId);
    } else if (typeof roleOrId === 'object' && roleOrId !== null) {
      targetRoleId = roleOrId.id || roleOrId.role_id || roleOrId.target_role_id;
      if (!targetRoleId && roleOrId.slug) {
        const found = allRoles.find((r) => r.slug === roleOrId.slug);
        if (found) targetRoleId = found.id;
      }
    } else if (typeof roleOrId === 'string') {
      const found = allRoles.find((r) => r.slug === roleOrId || r.title?.toLowerCase() === roleOrId.toLowerCase());
      if (found) targetRoleId = found.id;
    }

    if (!targetRoleId || isNaN(targetRoleId)) {
      console.warn('switchCareer: could not resolve roleId from', roleOrId);
      return null;
    }

    // 1. Race condition guard: increment sequence
    const currentSeq = ++switchRequestSeq.current;
    setIsSwitchingCareer(true);

    // 2. Immediate optimistic update of activeRole & dynamic career theme
    let targetRole = allRoles.find((r) => r.id === targetRoleId);
    if (!targetRole && typeof roleOrId === 'object' && roleOrId.title) {
      targetRole = roleOrId;
    }

    if (targetRole) {
      setActiveRole(targetRole);
      const nextTheme = getCareerTheme(targetRole.slug || targetRole.title);
      applyThemeToDocument(nextTheme);
    }

    try {
      // 3. Persist target directly to backend profile in PostgreSQL
      const profRes = await profileApi.setTarget({
        role_id: targetRoleId,
        profile_id: profile?.id || undefined,
        career_goals: options.careerGoals || undefined,
        target_duration_weeks: options.durationWeeks || undefined,
        weekly_study_hours: options.weeklyHours || undefined,
        preferred_learning_format: options.preferredFormat || undefined,
      }).catch((err) => {
        console.warn('Direct target endpoint note, falling back to roadmap switch:', err.message);
        return null;
      });

      // 4. Request backend switch: restores existing career roadmap if present, or generates new one
      const newRoadmap = await roadmapsApi.switchCareer({
        role_id: targetRoleId,
        profile_id: profRes?.id || profile?.id || undefined,
        weekly_hours: options.weeklyHours || undefined,
        target_duration_weeks: options.durationWeeks || undefined,
        force_regenerate: !!options.forceRegenerate,
      });

      // 5. Stale response check: if user clicked another career while waiting, discard stale response
      if (currentSeq !== switchRequestSeq.current) {
        return null;
      }

      // 6. Update state with returned roadmap & profile data
      setActiveRoadmap(newRoadmap);
      localStorage.setItem(STORAGE_KEYS.ROADMAP_ID, newRoadmap.id.toString());
      localStorage.setItem(STORAGE_KEYS.ROLE_ID, targetRoleId.toString());
      if (newRoadmap.profile_id) {
        localStorage.setItem(STORAGE_KEYS.PROFILE_ID, newRoadmap.profile_id.toString());
      }

      const definitiveProf = profRes || (await profileApi.get(newRoadmap.profile_id).catch(() => null));
      if (definitiveProf) {
        setProfile(definitiveProf);
      } else {
        setProfile((prev) => ({
          ...(prev || {}),
          id: newRoadmap.profile_id,
          target_role_id: targetRoleId,
          target_role: targetRole,
        }));
      }

      // 7. Fetch progress breakdown for this roadmap
      const progressData = await roadmapsApi.getProgress(newRoadmap.id).catch(() => null);
      if (currentSeq === switchRequestSeq.current) {
        setActiveRoadmapProgress(progressData);
      }

      if (targetRole && !options.silent) {
        addToast(
          'success',
          `Target career set to ${targetRole.title}. Target and roadmap saved in database.`,
          'Target Saved'
        );
      }

      return { roadmap: newRoadmap, profile: definitiveProf };
    } catch (err) {
      if (currentSeq === switchRequestSeq.current) {
        addToast('error', err.message || 'Failed to set target career.', 'Target Selection Error');
      }
      throw err;
    } finally {
      if (currentSeq === switchRequestSeq.current) {
        setIsSwitchingCareer(false);
      }
    }
  }, [allRoles, profile?.id, addToast]);

  // Fetch gamification status: XP, level, badges, streak
  const refreshGamification = useCallback(async (profileId = null) => {
    try {
      const targetId = profileId || profile?.id || localStorage.getItem(STORAGE_KEYS.PROFILE_ID);
      const data = await gamificationApi.getStatus(targetId ? parseInt(targetId, 10) : undefined);
      if (data) {
        setGamification({
          xp: data.xp,
          level: data.level,
          levelTitle: data.level_title,
          nextLevelXp: data.next_level_xp,
          levelProgressPct: data.level_progress_pct,
          streakDays: data.streak_days,
          badges: data.badges || [],
          missionsCompleted: data.missions_completed || 0,
          skillsUnlocked: data.skills_unlocked || 0,
          dailyChallengeDone: data.daily_challenge_done_today || false,
        });
      }
      return data;
    } catch (err) {
      console.warn('Gamification refresh note:', err.message);
      return null;
    }
  }, [profile]);

  // Task completion toggle with backend confirmation
  const toggleTask = useCallback(async (taskId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const updatedTask = await tasksApi.toggle(taskId, newStatus);

      // Update task in local activeRoadmap state immediately upon backend confirmation
      setActiveRoadmap((prev) => {
        if (!prev || !prev.tasks) return prev;
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId ? { ...t, is_completed: updatedTask.is_completed, completed_at: updatedTask.completed_at } : t
        );
        const completedCount = updatedTasks.filter((t) => t.is_completed).length;
        return {
          ...prev,
          tasks: updatedTasks,
          completed_tasks_count: completedCount,
        };
      });

      // Update progress metrics
      if (activeRoadmap?.id) {
        const prog = await roadmapsApi.getProgress(activeRoadmap.id).catch(() => null);
        if (prog) setActiveRoadmapProgress(prog);
      }

      if (newStatus) {
        triggerCelebration();
        await refreshGamification();
        addToast('success', `Mission Accomplished! +${updatedTask.xp_reward || 50} XP earned.`, 'Level Up!');
      } else {
        addToast('info', 'Mission marked as pending.', 'Task Status');
      }

      return updatedTask;
    } catch (err) {
      addToast('error', err.message || 'Failed to update task status.', 'Update Error');
      throw err;
    }
  }, [activeRoadmap, addToast, refreshGamification, triggerCelebration]);

  // Comprehensive task update (status, hours logged, evidence link, completion)
  const updateTaskDetails = useCallback(async (taskId, data) => {
    try {
      const updated = await tasksApi.update(taskId, data);
      setActiveRoadmap((prev) => {
        if (!prev || !prev.tasks) return prev;
        const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t));
        const completedCount = updatedTasks.filter((t) => t.is_completed).length;
        return {
          ...prev,
          tasks: updatedTasks,
          completed_tasks_count: completedCount,
        };
      });

      if (activeRoadmap?.id) {
        const prog = await roadmapsApi.getProgress(activeRoadmap.id).catch(() => null);
        if (prog) setActiveRoadmapProgress(prog);
      }

      if (updated.is_completed) {
        triggerCelebration();
        await refreshGamification();
        addToast('success', `Mission Completed! +${updated.xp_reward || 50} XP awarded.`, 'Progress Updated');
      } else {
        addToast('success', 'Task progress updated successfully.', 'Progress Updated');
      }

      return updated;
    } catch (err) {
      addToast('error', err.message || 'Failed to update task details.', 'Update Error');
      throw err;
    }
  }, [activeRoadmap, addToast, refreshGamification, triggerCelebration]);

  // Reschedule active roadmap
  const rescheduleActiveRoadmap = useCallback(async (newWeeklyHours, newDurationWeeks) => {
    if (!activeRoadmap?.id) return null;
    try {
      const updated = await roadmapsApi.reschedule(activeRoadmap.id, {
        roadmap_id: activeRoadmap.id,
        new_weekly_hours: newWeeklyHours ? parseInt(newWeeklyHours, 10) : undefined,
        new_duration_weeks: newDurationWeeks ? parseInt(newDurationWeeks, 10) : undefined,
      });
      setActiveRoadmap(updated);
      const prog = await roadmapsApi.getProgress(updated.id).catch(() => null);
      if (prog) setActiveRoadmapProgress(prog);
      addToast('success', 'Roadmap schedule updated. Completed tasks and history preserved.', 'Schedule Updated');
      return updated;
    } catch (err) {
      addToast('error', err.message || 'Failed to reschedule roadmap.', 'Reschedule Error');
      throw err;
    }
  }, [activeRoadmap, addToast]);

  // Student Authentication Operations
  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.access_token);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_ID);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP_ID);
      localStorage.removeItem(STORAGE_KEYS.ROLE_ID);
      setCurrentUser(res.user);
      const prof = await refreshProfile();
      if (prof?.target_role_id) {
        await switchCareer(prof.target_role_id, { silent: true });
      }
      setIsAuthModalOpen(false);
      addToast('success', `Welcome back, ${res.user.display_name}!`, 'Signed In');
      return res;
    } catch (err) {
      addToast('error', err.message || 'Login failed', 'Authentication Error');
      throw err;
    }
  }, [refreshProfile, switchCareer, addToast]);

  const register = useCallback(async (email, password, displayName) => {
    try {
      const res = await authApi.register({ email, password, display_name: displayName });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.access_token);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_ID);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP_ID);
      localStorage.removeItem(STORAGE_KEYS.ROLE_ID);
      setCurrentUser(res.user);
      const prof = await refreshProfile();
      if (prof?.target_role_id) {
        await switchCareer(prof.target_role_id, { silent: true });
      }
      setIsAuthModalOpen(false);
      addToast('success', `Account created! Welcome, ${res.user.display_name}.`, 'Registration Complete');
      return res;
    } catch (err) {
      addToast('error', err.message || 'Registration failed', 'Registration Error');
      throw err;
    }
  }, [refreshProfile, switchCareer, addToast]);

  const continueAsGuest = useCallback(async (displayName) => {
    try {
      const res = await authApi.guest({ display_name: displayName || 'Student Explorer' });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.access_token);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_ID);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP_ID);
      localStorage.removeItem(STORAGE_KEYS.ROLE_ID);
      setCurrentUser(res.user);
      const prof = await refreshProfile();
      if (prof?.target_role_id) {
        await switchCareer(prof.target_role_id, { silent: true });
      }
      setIsAuthModalOpen(false);
      addToast('info', 'Guest session activated. Your progress is saved in this browser.', 'Guest Session');
      return res;
    } catch (err) {
      addToast('error', err.message || 'Guest session error', 'Guest Mode');
      throw err;
    }
  }, [refreshProfile, switchCareer, addToast]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout().catch(() => null);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_ID);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP_ID);
      const guestRes = await authApi.guest({ display_name: 'Student Explorer' }).catch(() => null);
      if (guestRes) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, guestRes.access_token);
        setCurrentUser(guestRes.user);
        await refreshProfile();
      } else {
        setCurrentUser(null);
      }
      addToast('info', 'You have been signed out.', 'Signed Out');
    }
  }, [refreshProfile, addToast]);

  // Initial startup synchronization
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsInitializing(true);
      await checkHealth();

      // Verify or establish isolated user session
      let token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        try {
          const userObj = await authApi.getMe();
          if (mounted) setCurrentUser(userObj);
        } catch {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          token = null;
        }
      }
      if (!token) {
        try {
          const guestRes = await authApi.guest({ display_name: 'Student Explorer' });
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, guestRes.access_token);
          if (mounted) setCurrentUser(guestRes.user);
        } catch (e) {
          console.debug('Guest session establishment note:', e);
        }
      }

      const { roles } = await loadCatalogs();
      const loadedProf = await refreshProfile();

      const savedRoleId = localStorage.getItem(STORAGE_KEYS.ROLE_ID);
      // Give precedence to the authoritative database profile target_role_id!
      const targetRoleId =
        loadedProf?.target_role_id ||
        (savedRoleId ? parseInt(savedRoleId, 10) : null) ||
        (roles.length > 0 ? roles[0].id : null);

      if (loadedProf?.id) {
        localStorage.setItem(STORAGE_KEYS.PROFILE_ID, loadedProf.id.toString());
      }
      if (targetRoleId) {
        localStorage.setItem(STORAGE_KEYS.ROLE_ID, targetRoleId.toString());
      }

      if (targetRoleId) {
        // Resolve target role and immediately apply its career theme
        const matched = roles.find((r) => r.id === targetRoleId);
        if (matched) {
          setActiveRole(matched);
          applyThemeToDocument(getCareerTheme(matched.slug || matched.title));
        }

        // Load or create roadmap for the target career
        try {
          const rm = await roadmapsApi.switchCareer({
            role_id: targetRoleId,
            profile_id: loadedProf?.id || undefined,
          });
          if (mounted && rm) {
            setActiveRoadmap(rm);
            localStorage.setItem(STORAGE_KEYS.ROADMAP_ID, rm.id.toString());
            localStorage.setItem(STORAGE_KEYS.ROLE_ID, targetRoleId.toString());
            if (rm.profile_id) {
              localStorage.setItem(STORAGE_KEYS.PROFILE_ID, rm.profile_id.toString());
              if (!loadedProf) {
                const freshP = await profileApi.get(rm.profile_id).catch(() => null);
                if (mounted && freshP) setProfile(freshP);
              }
            }

            const prog = await roadmapsApi.getProgress(rm.id).catch(() => null);
            if (mounted && prog) setActiveRoadmapProgress(prog);
          }
        } catch {
          if (mounted) await refreshRoadmap(null, targetRoleId);
        }
      } else {
        if (mounted) await refreshRoadmap();
      }

      await refreshGamification(loadedProf?.id);

      if (mounted) {
        setIsInitializing(false);
      }
    };

    init();

    // Periodic health heartbeat (every 30 seconds)
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [checkHealth, loadCatalogs, refreshProfile, refreshRoadmap, refreshGamification]);

  // Sync activeRole with profile target_role_id if set
  useEffect(() => {
    if (profile?.target_role_id && allRoles.length > 0) {
      const matched = allRoles.find((r) => r.id === profile.target_role_id);
      if (matched && activeRole?.id !== matched.id) {
        setActiveRole(matched);
      }
    }
  }, [profile?.target_role_id, allRoles, activeRole?.id]);

  const value = {
    currentUser,
    setCurrentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    continueAsGuest,
    logout,
    profile,
    setProfile,
    activeRoadmap,
    setActiveRoadmap,
    activeRoadmapProgress,
    setActiveRoadmapProgress,
    activeRole,
    setActiveRole,
    activeTheme,
    allRoles,
    allSkills,
    backendOnline,
    aiStatus,
    gamification,
    setGamification,
    refreshGamification,
    triggerCelebration,
    toasts,
    addToast,
    removeToast,
    isInitializing,
    isSwitchingCareer,
    switchCareer,
    checkHealth,
    refreshProfile,
    refreshRoadmap,
    toggleTask,
    updateTaskDetails,
    rescheduleActiveRoadmap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
