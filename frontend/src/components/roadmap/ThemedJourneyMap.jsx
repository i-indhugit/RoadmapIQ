import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getCareerTheme, getSkillEnvironment } from '../../utils/careerThemes';
import { getAvatarStyle } from '../../utils/avatarStyles';
import { soundEffects } from '../../utils/soundEffects';
import SceneryRenderer from './scenery/SceneryRenderer';
import CheckpointIllustration from './CheckpointIcon';
import AvatarCustomizerModal from './AvatarCustomizerModal';
import {
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  MapPin,
  Award,
  Trophy,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  Layers,
  GitBranch,
  ChevronDown,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Target,
  Flame,
  Zap,
  BookOpen,
  Check,
  RotateCcw,
  Maximize,
  Info,
} from 'lucide-react';
import { roadmapsApi } from '../../services/api';

const ThemedJourneyMap = ({
  roadmap,
  role,
  onSelectCheckpoint,
  selectedCheckpointId,
  onOpenCertificate,
  onSpecializationChange,
  isFullScreen: controlledFullScreen,
  onToggleFullScreen: controlledToggleFullScreen,
}) => {
  const { profile, triggerCelebration } = useApp();
  const containerRef = useRef(null);

  // URL search parameter integration for full-screen persistence across refresh
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalFullScreen, setInternalFullScreen] = useState(
    () => searchParams.get('fullscreen') === 'true'
  );

  const isFullScreen =
    controlledFullScreen !== undefined ? controlledFullScreen : internalFullScreen;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [specializationData, setSpecializationData] = useState(null);
  const [activeSpecialization, setActiveSpecialization] = useState(null);
  const [isSwitchingBranch, setIsSwitchingBranch] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  // Touch gesture support: Pinch-to-zoom & smooth touch pan
  const touchDistRef = useRef(null);
  const initialZoomRef = useRef(zoomLevel);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
      initialZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistRef.current;
      const next = Math.min(1.5, Math.max(0.6, Number((initialZoomRef.current * factor).toFixed(2))));
      setZoomLevel(next);
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  // Smart Fit-to-Screen handler adapting automatically to current device width
  const handleFitToScreen = () => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      // Coordinate system scales based on ~760px effective road width
      const fitZoom = Math.min(1.0, Math.max(0.65, Number((w / 760).toFixed(2))));
      setZoomLevel(fitZoom);
    } else {
      setZoomLevel(isMobile ? 0.8 : 1);
    }
  };

  // Handle Full-Screen Toggling (with Browser Fullscreen API & graceful fallback)
  const handleToggleFullScreen = async () => {
    const nextState = !isFullScreen;
    if (controlledToggleFullScreen) {
      controlledToggleFullScreen(nextState);
    } else {
      setInternalFullScreen(nextState);
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextState) {
          next.set('fullscreen', 'true');
        } else {
          next.delete('fullscreen');
        }
        return next;
      },
      { replace: true }
    );

    try {
      if (nextState) {
        if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.debug('Browser fullscreen API fallback:', err);
    }
  };

  // Listen to Escape key and Zoom hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        handleToggleFullScreen();
      } else if (isFullScreen) {
        if (e.key === '+' || e.key === '=') {
          setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
        } else if (e.key === '-' || e.key === '_') {
          setZoomLevel((z) => Math.max(0.65, Number((z - 0.1).toFixed(2))));
        } else if (e.key === '0') {
          setZoomLevel(1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Sync with native browser fullscreen changes (e.g. user pressed Esc natively)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = Boolean(document.fullscreenElement);
      if (!isNative && isFullScreen) {
        if (controlledToggleFullScreen) {
          controlledToggleFullScreen(false);
        } else {
          setInternalFullScreen(false);
        }
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('fullscreen');
            return next;
          },
          { replace: true }
        );
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullScreen, controlledToggleFullScreen]);

  // Fetch domain specialization tracks
  useEffect(() => {
    if (roadmap?.id) {
      roadmapsApi
        .getSpecializations(roadmap.id)
        .then((res) => {
          setSpecializationData(res.data);
          if (res.data?.active_specialization) {
            setActiveSpecialization(res.data.active_specialization);
          }
        })
        .catch((err) => {
          console.debug('Failed to fetch specializations:', err);
        });
    }
  }, [roadmap?.id]);

  const handleSelectBranch = async (branch) => {
    if (!roadmap?.id || isSwitchingBranch) return;
    setIsSwitchingBranch(true);
    try {
      await roadmapsApi.switchSpecialization(roadmap.id, {
        specialization_branch: branch.title,
        specialization_id: branch.id,
      });
      setActiveSpecialization(branch.title);
      soundEffects.playLevelUp(soundEnabled);
      if (onSpecializationChange) {
        onSpecializationChange(branch);
      }
    } catch (err) {
      console.error('Switch specialization failed:', err);
    } finally {
      setIsSwitchingBranch(false);
    }
  };

  // Responsive window resize tracking
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Resolve career theme dynamically based on user's chosen target role
  const roleIdentifier = role?.slug || roadmap?.role_title || '';
  const theme = useMemo(() => getCareerTheme(roleIdentifier), [roleIdentifier]);

  // 2. Avatar style tailored to career or user preference
  const [equippedAvatar, setEquippedAvatar] = useState(
    profile?.avatar_style || theme.defaultAvatar || 'code_knight'
  );

  useEffect(() => {
    if (profile?.avatar_style) {
      setEquippedAvatar(profile.avatar_style);
    } else if (theme.defaultAvatar) {
      setEquippedAvatar(theme.defaultAvatar);
    }
  }, [profile?.avatar_style, theme.defaultAvatar]);

  const avatarStyle = useMemo(() => getAvatarStyle(equippedAvatar), [equippedAvatar]);

  // 3. Transform roadmap tasks into progressive sequenced checkpoints
  const checkpoints = useMemo(() => {
    if (!roadmap?.tasks || roadmap.tasks.length === 0) return [];

    // Sort tasks stably by phase_number, week_number, order_in_week
    const sortedTasks = [...roadmap.tasks].sort((a, b) => {
      const pA = a.phase_number || 1;
      const pB = b.phase_number || 1;
      if (pA !== pB) return pA - pB;
      if (a.week_number !== b.week_number) return a.week_number - b.week_number;
      return (a.order_in_week || 0) - (b.order_in_week || 0);
    });

    const total = sortedTasks.length;

    // Track completed skills and tasks
    const completedSkillIds = new Set();
    sortedTasks.forEach((t) => {
      if (t.is_completed) {
        if (t.skill_id) completedSkillIds.add(t.skill_id);
      }
    });

    // Check which phases are completed
    const phaseTasks = {};
    sortedTasks.forEach((t) => {
      const p = t.phase_number || 1;
      if (!phaseTasks[p]) phaseTasks[p] = [];
      phaseTasks[p].push(t);
    });

    const phaseNumbers = Object.keys(phaseTasks).map(Number).sort((a, b) => a - b);
    const phaseCompleted = {};
    phaseNumbers.forEach((p) => {
      const tasksInPhase = phaseTasks[p] || [];
      phaseCompleted[p] = tasksInPhase.length > 0 && tasksInPhase.every((t) => t.is_completed);
    });

    // A phase P is unlocked if all previous phases (1 to P-1) are completed
    const isPhaseUnlocked = (p) => {
      if (p <= 1) return true;
      for (let prevP = 1; prevP < p; prevP++) {
        if (!phaseCompleted[prevP]) return false;
      }
      return true;
    };

    const yStep = isMobile ? 130 : 150;
    const startY = isMobile ? 120 : 160;

    return sortedTasks.map((task, index) => {
      const stageNumber = Math.min(
        5,
        Math.max(1, task.phase_number || Math.ceil(((index + 1) / total) * 5))
      );
      const stageInfo = theme.stages[stageNumber - 1] || theme.stages[0];

      const y = startY + index * yStep;

      // Coordinate placement along responsive canvas:
      // Mobile (<640px): Straight down the center line (x = 400).
      // Desktop (>=640px): Smooth gentle S-curve (400 -> 580 -> 400 -> 220).
      let x = 400;
      if (!isMobile) {
        const oscillationPhase = index % 4;
        if (oscillationPhase === 0) x = 400;
        else if (oscillationPhase === 1) x = 580;
        else if (oscillationPhase === 2) x = 400;
        else if (oscillationPhase === 3) x = 220;
      }

      // Determine progressive prerequisite-based unlock status
      let status = 'available';
      let lockReason = '';
      const unmetPrereqs = [];

      if (task.is_completed) {
        status = 'completed';
      } else {
        const phaseUnlocked = isPhaseUnlocked(stageNumber);
        if (!phaseUnlocked) {
          status = 'locked';
          lockReason = `Complete Phase ${stageNumber - 1} to unlock this phase.`;
          unmetPrereqs.push(`Phase ${stageNumber - 1} Foundations`);
        } else {
          // Check explicit prerequisite skills
          const prereqIds = task.prerequisite_skill_ids || [];
          if (prereqIds.length > 0) {
            prereqIds.forEach((reqId, pIdx) => {
              if (!completedSkillIds.has(reqId)) {
                const reqTask = sortedTasks.find((t) => t.skill_id === reqId);
                const reqTitle =
                  (task.prerequisite_titles && task.prerequisite_titles[pIdx]) ||
                  reqTask?.title ||
                  reqTask?.name ||
                  `Prerequisite Skill #${reqId}`;
                unmetPrereqs.push(reqTitle);
              }
            });
          }

          if (unmetPrereqs.length > 0) {
            status = 'locked';
            lockReason = `Requires: ${unmetPrereqs.join(', ')}`;
          } else if (task.status === 'in_progress') {
            status = 'in_progress';
          } else {
            status = 'available';
          }
        }
      }

      return {
        ...task,
        checkpointIndex: index,
        stageNumber,
        stageInfo,
        x,
        y,
        status,
        lockReason,
        unmet_prerequisites: unmetPrereqs,
      };
    });
  }, [roadmap, theme, isMobile]);

  // Landmark coordinate at the end of the road
  const landmarkCoord = useMemo(() => {
    if (checkpoints.length === 0) return { x: 400, y: 350 };
    const last = checkpoints[checkpoints.length - 1];
    return {
      x: 400,
      y: last.y + (isMobile ? 150 : 170),
    };
  }, [checkpoints, isMobile]);

  // Overall metrics & details
  const completedCount = useMemo(
    () => checkpoints.filter((c) => c.status === 'completed').length,
    [checkpoints]
  );
  const totalCount = checkpoints.length;
  const remainingCount = totalCount - completedCount;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const totalHours = useMemo(
    () => checkpoints.reduce((acc, c) => acc + (c.estimated_hours || 2), 0),
    [checkpoints]
  );
  const completedHours = useMemo(
    () =>
      checkpoints
        .filter((c) => c.status === 'completed')
        .reduce((acc, c) => acc + (c.actual_hours_spent || c.estimated_hours || 2), 0),
    [checkpoints]
  );
  const remainingHours = Math.max(0, totalHours - completedHours);

  const skillsDevelopedList = useMemo(() => {
    return Array.from(
      new Set(
        checkpoints
          .filter((c) => c.status === 'completed' && (c.skill_name || c.title))
          .map((c) => c.skill_name || c.title)
      )
    );
  }, [checkpoints]);
  const skillsDevelopedCount = skillsDevelopedList.length;

  const totalEarnedXp = useMemo(
    () =>
      checkpoints
        .filter((c) => c.status === 'completed')
        .reduce((acc, c) => acc + (c.xp_reward || 50), 0),
    [checkpoints]
  );

  const targetWeeks = roadmap?.target_duration_weeks || profile?.target_duration_weeks || 12;
  const weeklyHours = roadmap?.weekly_hours || profile?.weekly_study_hours || 15;
  const readinessScore =
    roadmap?.readiness_score ||
    Math.min(100, Math.round(completionPercentage * 0.9 + (completedCount > 0 ? 10 : 0)));

  // Active checkpoint where the character/icon rests
  const activeCheckpoint = useMemo(() => {
    if (checkpoints.length === 0) return null;
    const firstPending = checkpoints.find((c) => !c.is_completed && c.status === 'available');
    if (firstPending) return firstPending;
    const firstInProgress = checkpoints.find((c) => c.status === 'in_progress');
    if (firstInProgress) return firstInProgress;
    const firstLocked = checkpoints.find((c) => c.status === 'locked');
    if (firstLocked) return firstLocked;
    return checkpoints[checkpoints.length - 1];
  }, [checkpoints]);

  const activeStage = useMemo(() => {
    if (!theme.stages || theme.stages.length === 0) return null;
    const stageNum = activeCheckpoint?.stageNumber || 1;
    return theme.stages[Math.min(theme.stages.length - 1, Math.max(0, stageNum - 1))];
  }, [theme, activeCheckpoint]);

  // Avatar final target position
  const avatarPosition = useMemo(() => {
    if (checkpoints.length === 0) return null;
    if (allCompleted) {
      return {
        x: landmarkCoord.x,
        y: landmarkCoord.y - 85,
        label: 'Career Certified',
      };
    }
    if (activeCheckpoint) {
      return {
        x: activeCheckpoint.x,
        y: activeCheckpoint.y - 70,
        label: profile?.display_name?.split(' ')[0] || 'Current Goal',
      };
    }
    return null;
  }, [allCompleted, activeCheckpoint, landmarkCoord, checkpoints, profile]);

  // Complete SVG path through all checkpoint coordinates to the destination landmark
  const pathD = useMemo(() => {
    if (checkpoints.length === 0) return '';
    let d = `M ${checkpoints[0].x} ${checkpoints[0].y}`;
    for (let i = 1; i < checkpoints.length; i++) {
      const prev = checkpoints[i - 1];
      const curr = checkpoints[i];
      if (isMobile) {
        d += ` L ${curr.x} ${curr.y}`;
      } else {
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
    }
    const last = checkpoints[checkpoints.length - 1];
    if (isMobile) {
      d += ` L ${landmarkCoord.x} ${landmarkCoord.y}`;
    } else {
      const midY = (last.y + landmarkCoord.y) / 2;
      d += ` C ${last.x} ${midY}, ${landmarkCoord.x} ${midY}, ${landmarkCoord.x} ${landmarkCoord.y}`;
    }
    return d;
  }, [checkpoints, landmarkCoord, isMobile]);

  // Highlighted path connecting already completed checkpoints up to active position
  const completedPathD = useMemo(() => {
    if (checkpoints.length === 0) return '';
    if (allCompleted) return pathD;

    const activeIdx = activeCheckpoint ? activeCheckpoint.checkpointIndex : 0;
    const reachedNodes = checkpoints.slice(0, activeIdx + 1);
    if (reachedNodes.length <= 1) return '';

    let d = `M ${reachedNodes[0].x} ${reachedNodes[0].y}`;
    for (let i = 1; i < reachedNodes.length; i++) {
      const prev = reachedNodes[i - 1];
      const curr = reachedNodes[i];
      if (isMobile) {
        d += ` L ${curr.x} ${curr.y}`;
      } else {
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
    }
    return d;
  }, [checkpoints, activeCheckpoint, allCompleted, pathD, isMobile]);

  const mapHeight = useMemo(() => {
    return landmarkCoord.y + 220;
  }, [landmarkCoord]);

  const handleNodeClick = (node) => {
    soundEffects.playClick(soundEnabled);
    if (onSelectCheckpoint) {
      onSelectCheckpoint(node);
    }
  };

  const handleLandmarkCelebration = () => {
    soundEffects.playLevelUp(soundEnabled);
    triggerCelebration({ particleCount: 120, spread: 100 });
    if (onOpenCertificate) {
      onOpenCertificate();
    }
  };

  // Phase grouping for stage headers
  const phases = useMemo(() => {
    const list = [];
    theme.stages.forEach((stg) => {
      const stageNodes = checkpoints.filter((c) => c.stageNumber === stg.number);
      if (stageNodes.length > 0) {
        const isPhaseDone = stageNodes.every((c) => c.status === 'completed');
        const isPhaseActive = stageNodes.some(
          (c) => c.status === 'available' || c.status === 'in_progress'
        );
        list.push({
          ...stg,
          firstY: stageNodes[0].y,
          nodes: stageNodes,
          isDone: isPhaseDone,
          isActive: isPhaseActive,
        });
      }
    });
    return list;
  }, [theme, checkpoints]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex flex-col transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 z-50 w-screen h-screen min-h-[100dvh] max-h-[100dvh] bg-navy-950 overflow-hidden'
          : `rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b ${
              theme.palette.bgGradient || 'from-slate-950 via-slate-900 to-navy-950'
            } shadow-2xl`
      }`}
    >
      {/* =========================================================================
          TOP COMMAND BAR & CAREER TRACK HEADER (FULLSCREEN & STANDARD MODES)
         ========================================================================= */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-navy-900/98 via-navy-850/98 to-navy-900/98 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* In Full-Screen: Prominent "Back to Journey / Exit Fullscreen" Action */}
          {isFullScreen && (
            <button
              onClick={handleToggleFullScreen}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-navy-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100 transition-all hover:border-brand-cyan/60 hover:text-white shadow-sm shrink-0"
              title="Exit Full-Screen Learning Mode (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-brand-cyan" />
              <span className="hidden sm:inline">Back to Journey</span>
              <span className="sm:hidden">Back</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-navy-950 border border-slate-700 rounded text-slate-400">
                ESC
              </kbd>
            </button>
          )}

          {/* Domain Icon & Context */}
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-navy-950 shadow-lg shrink-0"
            style={{ backgroundColor: theme.palette.accent || '#06b6d4' }}
          >
            <Compass className="w-5 h-5 text-navy-950" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cyan">
                {theme.name}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-navy-800 border hidden sm:inline-block"
                style={{
                  borderColor: `${theme.palette.primary}55`,
                  color: theme.palette.primary,
                }}
              >
                {theme.environmentName}
              </span>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2 truncate">
              <span>{role?.title || roadmap?.role_title || 'Universal Career Roadmap'}</span>
              <span className="text-xs font-mono font-normal text-slate-400 hidden lg:inline">
                ({targetWeeks} Wks • {weeklyHours} hrs/wk)
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden md:block max-w-xl truncate">
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* Center: Next Recommended Activity Pill (if incomplete milestone available) */}
        {activeCheckpoint && (
          <div
            onClick={() => handleNodeClick(activeCheckpoint)}
            className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-navy-900/90 hover:bg-navy-850 border border-brand-cyan/40 hover:border-brand-cyan text-xs cursor-pointer transition-all shadow-sm group shrink-0"
            title="Click to open this milestone workspace"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-ping shrink-0" />
            <div className="text-left">
              <div className="text-[9px] font-mono uppercase font-bold text-brand-cyan">
                Next Recommended Activity
              </div>
              <div className="text-xs font-bold text-white max-w-[200px] truncate group-hover:text-brand-cyan">
                {activeCheckpoint.title || activeCheckpoint.name}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-brand-cyan group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Avatar Switcher Button */}
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-navy-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
            title="Customize Learner Avatar"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {avatarStyle.renderAvatar({ size: 18 })}
            </div>
            <span className="hidden lg:inline">{avatarStyle.name}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40'
                : 'bg-navy-800 text-slate-400 border-slate-700'
            }`}
            title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Zoom & Fit-to-Screen Controls */}
          <div className="flex items-center rounded-xl bg-navy-800 border border-slate-700 overflow-hidden shadow-sm">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 sm:p-2 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-1 sm:px-2 text-[10px] font-mono text-slate-400 min-w-[34px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 sm:p-2 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="px-2 py-1.5 text-[10px] font-mono font-bold text-brand-cyan hover:bg-slate-700 border-l border-slate-700 active:scale-95 transition-all"
              title="Fit Roadmap to Screen Viewport"
              aria-label="Fit to Screen"
            >
              Fit
            </button>
          </div>

          {/* Full-Screen Toggle Button */}
          <button
            onClick={handleToggleFullScreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              isFullScreen
                ? 'bg-brand-cyan text-navy-950 border-brand-cyan font-black'
                : 'bg-navy-800 hover:bg-slate-700 text-brand-cyan border-brand-cyan/40 hover:border-brand-cyan'
            }`}
            title={isFullScreen ? 'Exit Full-Screen (Esc)' : 'Enter Full-Screen Learning Mode'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          RICHER ROADMAP DETAILS METRICS STRIP (PERSONALIZED CAREER DETAILS)
         ========================================================================= */}
      <div className="px-4 py-2.5 bg-navy-950/98 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Welcome, <strong className="text-white">{profile?.display_name || 'Explorer'}</strong></span>
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target: <strong className="text-white">{targetWeeks} Wks</strong> ({weeklyHours} hrs/wk)</span>
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong className="text-brand-cyan">{completedCount}</strong> of <strong>{totalCount}</strong> Mastered ({completionPercentage}%)</span>
          </span>

          <span className="text-slate-600 hidden md:inline">•</span>

          <span className="hidden md:flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>~{remainingHours}h study remaining (~{completedHours}h done)</span>
          </span>

          <span className="text-slate-600 hidden lg:inline">•</span>

          <span className="hidden lg:flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>{skillsDevelopedCount} Skills Verified</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-brand-cyan font-bold">
            <Zap className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{readinessScore}% Career Readiness</span>
          </div>

          {/* Quick Progress Bar */}
          <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden shrink-0">
            <div
              className="bg-gradient-to-r from-brand-cyan to-emerald-400 h-2 rounded-full transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE PROMPT BANNER (VISIBLE IN STANDARD EMBEDDED MODE)
         ========================================================================= */}
      {!isFullScreen && (
        <div
          onClick={handleToggleFullScreen}
          className="cursor-pointer group flex items-center justify-between px-4 py-2 bg-gradient-to-r from-brand-cyan/15 via-navy-900/90 to-teal-500/15 border-b border-brand-cyan/30 hover:border-brand-cyan/60 text-xs transition-all z-20 shrink-0"
        >
          <div className="flex items-center gap-2 text-brand-cyan font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive {theme.name}: Click anywhere on this banner to enter 100% full-screen distraction-free mode.</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300 group-hover:text-brand-cyan transition-colors">
            <span>Expand Full Screen</span>
            <Maximize2 className="w-3.5 h-3.5 group-hover:scale-115 transition-transform" />
          </div>
        </div>
      )}

      {/* Specialization Branches Track Bar */}
      {specializationData?.branches && specializationData.branches.length > 0 && (
        <div className="px-4 py-2 bg-navy-950/95 border-b border-slate-800 flex items-center justify-between gap-3 text-xs z-20 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="font-mono text-[11px] text-slate-400">Specialization Track:</span>
            <span className="font-bold text-slate-100 font-mono text-xs">
              {activeSpecialization || 'Core Curriculum'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {specializationData.branches.map((b) => {
              const isCurrent =
                activeSpecialization === b.title ||
                (!activeSpecialization && b.id === specializationData.branches[0].id);
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBranch(b)}
                  disabled={isSwitchingBranch || isCurrent}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono transition-all flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-brand-cyan text-navy-950 font-extrabold shadow-sm'
                      : 'bg-navy-900 border border-slate-700 text-slate-300 hover:border-brand-cyan/50 hover:text-white'
                  }`}
                  title={`Focus: ${b.focus}`}
                >
                  <span>{b.title.split('&')[0].trim()}</span>
                  {isCurrent && <CheckCircle2 className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN INTERACTIVE ROADMAP CANVAS (RESPONSIVE VIEWPORT & PRESERVED ZOOM)
         ========================================================================= */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 select-none touch-pan-x touch-pan-y ${
          isFullScreen ? 'flex-1' : 'max-h-[800px]'
        }`}
      >
        {/* Atmospheric Background Motif Watermark */}
        {theme.visualMotif?.svgPattern && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 transition-opacity"
            style={{ backgroundImage: theme.visualMotif.svgPattern }}
          />
        )}

        {/* Watermark Tag */}
        {theme.visualMotif?.heroWatermark && (
          <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-slate-700 pointer-events-none select-none opacity-40 uppercase">
            {theme.visualMotif.heroWatermark}
          </div>
        )}

        {/* Subtle Ambient Background Gradient Glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 15%, ${
              theme.palette.glow || 'rgba(56, 189, 248, 0.35)'
            } 0%, transparent 55%), radial-gradient(circle at 50% 85%, rgba(15, 23, 42, 0.95) 0%, transparent 65%)`,
          }}
        />

        {/* Scalable Visual Path Canvas (800 viewBox width scales to 100% of container) */}
        <div
          className="w-full max-w-3xl mx-auto py-6 sm:py-8 transition-transform duration-200 origin-top px-2 sm:px-6"
          style={{ transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined }}
        >
          <div className="relative w-full" style={{ height: `${mapHeight}px` }}>
            {/* 1. Subtle 2D Scenery Backdrop Tailored to Career */}
            <SceneryRenderer sceneryType={theme.sceneryType} mapHeight={mapHeight} />

            {/* 2. Connected SVG Pathway */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 800 ${mapHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="journeyGlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor={theme.palette.pathStroke || theme.palette.primary}
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="50%"
                    stopColor={theme.palette.pathGlow || theme.palette.secondary}
                    stopOpacity="0.9"
                  />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
                </linearGradient>

                <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Full Base Track (Dark Road) */}
              <path
                d={pathD}
                fill="none"
                stroke="#0f172a"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Planned Route Dashed Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />

              {/* Conquered / Active Path Glow */}
              {completedPathD && (
                <>
                  <path
                    d={completedPathD}
                    fill="none"
                    stroke={theme.palette.pathStroke || theme.palette.primary}
                    strokeWidth="14"
                    strokeOpacity="0.22"
                    filter="url(#roadGlow)"
                  />
                  <path
                    d={completedPathD}
                    fill="none"
                    stroke="url(#journeyGlowGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>

            {/* 3. Stage Phase Banners: Positioned Responsively */}
            {phases.map((ph) => {
              const bannerY = ph.firstY - (isMobile ? 65 : 75);

              return (
                <div
                  key={ph.number}
                  className={`absolute z-10 flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-navy-900/90 backdrop-blur-md border shadow-lg transition-all ${
                    ph.isDone
                      ? 'border-emerald-500/40 text-emerald-300'
                      : ph.isActive
                      ? 'border-cyan-500/40 text-cyan-300'
                      : 'border-slate-800 text-slate-400'
                  }`}
                  style={{
                    top: `${bannerY}px`,
                    left: isMobile ? '50%' : '3%',
                    transform: isMobile ? 'translateX(-50%)' : 'none',
                  }}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-extrabold text-[11px] sm:text-xs shadow ${
                      ph.isDone
                        ? 'bg-emerald-400 text-navy-950'
                        : ph.isActive
                        ? 'bg-brand-cyan text-navy-950'
                        : 'bg-navy-800 text-slate-400'
                    }`}
                  >
                    {ph.isDone ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : ph.number}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5 leading-tight">
                      <span>{ph.name}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                      {ph.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* 4. Interactive Checkpoint Nodes */}
            {checkpoints.map((node) => {
              const isSelected = selectedCheckpointId === node.id;
              const env = getSkillEnvironment(node.skill_category);
              const isCompleted = node.status === 'completed';
              const isInProgress = node.status === 'in_progress';
              const isAvailable = node.status === 'available';

              // Positioning: percentage of 800 width ensures 100% responsive alignment
              const leftPercent = (node.x / 800) * 100;

              return (
                <div
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ left: `${leftPercent}%`, top: `${node.y}px` }}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Subtle Pulse Aura if Available / In Progress */}
                  {(isInProgress || isAvailable) && (
                    <div
                      className="absolute -inset-2.5 rounded-2xl opacity-60 animate-ping pointer-events-none"
                      style={{ backgroundColor: isAvailable ? theme.palette.primary : '#f59e0b' }}
                    />
                  )}

                  {/* Checkpoint Node Beacon */}
                  <div
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                      isCompleted
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                        : isInProgress
                        ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-amber-500/20 animate-pulse'
                        : isAvailable
                        ? 'bg-navy-900 border-cyan-400 text-cyan-300 shadow-cyan-500/30 ring-2 ring-cyan-500/30'
                        : 'bg-navy-950/90 border-slate-700/80 text-slate-500 opacity-80'
                    } ${
                      isSelected
                        ? 'scale-115 ring-4 ring-offset-2 ring-offset-navy-950 ring-brand-cyan'
                        : 'group-hover:scale-105'
                    }`}
                  >
                    <CheckpointIllustration
                      themeId={theme.id}
                      status={node.status}
                      size={24}
                    />

                    {/* Step Number Badge */}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-navy-800 border border-slate-700 text-[10px] font-mono font-bold flex items-center justify-center text-slate-300 shadow">
                      {node.checkpointIndex + 1}
                    </span>
                  </div>

                  {/* Tooltip Card */}
                  <div
                    className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 p-2 sm:p-2.5 rounded-xl bg-navy-900/95 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-none transition-all duration-200 text-center ${
                      isSelected
                        ? 'opacity-100 scale-100 ring-1 ring-brand-cyan'
                        : 'opacity-85 group-hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold border ${env.badgeClass}`}
                      >
                        {env.name}
                      </span>
                      {node.activity_method && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                          {node.activity_method.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-100 truncate">{node.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/80">
                      <span>~{node.estimated_hours}h</span>
                      <span
                        className={
                          isCompleted
                            ? 'text-emerald-400 font-bold'
                            : isAvailable
                            ? 'text-cyan-400 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {isCompleted ? 'Done' : isAvailable ? 'Ready' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 5. Career Mastery Destination Landmark */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-72 sm:w-80"
              style={{ left: '50%', top: `${landmarkCoord.y}px` }}
            >
              <div
                className={`p-5 rounded-3xl border-2 transition-all duration-500 shadow-2xl text-center backdrop-blur-xl ${
                  allCompleted
                    ? 'bg-gradient-to-b from-amber-950/80 via-navy-900/90 to-emerald-950/80 border-amber-400 shadow-amber-500/30'
                    : 'bg-navy-900/90 border-slate-700/80 shadow-slate-900/50'
                }`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto -mt-9 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
                    allCompleted
                      ? 'bg-amber-400 text-navy-950 border-amber-300 animate-bounce'
                      : 'bg-navy-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {allCompleted ? <Trophy className="w-8 h-8" /> : <Shield className="w-7 h-7" />}
                </div>

                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow"
                    style={{
                      backgroundColor: `${theme.palette.primary}15`,
                      borderColor: theme.palette.primary,
                      color: theme.palette.primary,
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{theme.landmark.badge}</span>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-100 mt-2">
                  {theme.landmark.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {theme.landmark.subtitle}
                </p>

                {/* Progress / Completion Call to Action */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  {allCompleted ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <span>All {totalCount} Checkpoints Mastered!</span>
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                      </div>
                      <button
                        onClick={handleLandmarkCelebration}
                        className="w-full py-2 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-emerald-400 text-navy-950 hover:brightness-110 shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Career Certificate</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                        <span>Career Progress</span>
                        <span className="text-brand-cyan font-bold">
                          {completedCount} / {totalCount} Mastered
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-brand-cyan to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Moving Character / Avatar Indicator */}
            {avatarPosition && (
              <motion.div
                className="absolute z-30 pointer-events-none flex flex-col items-center"
                initial={false}
                animate={{
                  left: `${(avatarPosition.x / 800) * 100}%`,
                  top: `${avatarPosition.y}px`,
                  x: '-50%',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 85,
                  damping: 15,
                  mass: 0.8,
                }}
              >
                {/* Floating Character Badge */}
                <div className="px-2.5 py-0.5 rounded-full bg-navy-900/95 border border-brand-cyan/60 text-[10px] font-mono font-bold text-brand-cyan shadow-glow-cyan mb-1 flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{avatarPosition.label}</span>
                </div>

                {/* 2D Animated Avatar Character */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="filter drop-shadow-[0_8px_16px_rgba(6,182,212,0.4)]"
                >
                  {avatarStyle.renderAvatar({ size: isMobile ? 40 : 48, isMoving: true })}
                </motion.div>

                {/* Direction Pointer */}
                <MapPin className="w-4 h-4 text-brand-cyan animate-bounce mt-0.5" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SUMMARY BAR
         ========================================================================= */}
      <div className="p-3.5 sm:p-4 bg-navy-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Mastered: {completedCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>
              In Progress: {checkpoints.filter((c) => c.status === 'in_progress').length}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>
              Ready: {checkpoints.filter((c) => c.status === 'available').length}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>
              Locked: {checkpoints.filter((c) => c.status === 'locked').length}
            </span>
          </span>
        </div>

        <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
          Click any checkpoint to open the 5-part learning workspace (Learn, Practice, AI Tutor, Build, Evaluate).
        </span>
      </div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSelectAvatar={(styleId) => setEquippedAvatar(styleId)}
      />
    </div>
  );
};

export default ThemedJourneyMap;
