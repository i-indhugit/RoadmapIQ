import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { healthApi, aiApi, profileApi, API_BASE_URL } from '../services/api';
import {
  Settings,
  Server,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Palette,
  Bell,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Badge from '../components/common/Badge';

const SETTINGS_TABS = [
  { id: 'preferences', label: 'Learning Preferences', icon: Sliders },
  { id: 'theme', label: 'Theme & Environment', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account & Diagnostics', icon: Server },
];

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'preferences';

  const {
    profile,
    setProfile,
    backendOnline,
    aiStatus,
    checkHealth,
    refreshProfile,
    refreshRoadmap,
    activeTheme,
    activeRole,
    addToast
  } = useApp();

  const [testingConnection, setTestingConnection] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_study_hours || 15);
  const [targetWeeks, setTargetWeeks] = useState(profile?.target_duration_weeks || 12);

  // Notification toggles
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [dailyTaskReminders, setDailyTaskReminders] = useState(true);
  const [weeklyReviewAlerts, setWeeklyReviewAlerts] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  const apiBaseUrl = API_BASE_URL || '/api';

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await checkHealth();
      addToast('success', 'Backend connection verified and healthy!', 'Connection OK');
    } catch {
      addToast('error', 'Could not establish connection with FastAPI backend.', 'Connection Error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await aiApi.testGemini();
      setGeminiTestResult(res);
      if (res.status === 'ok') {
        addToast('success', `Gemini inference succeeded in ${res.latency_ms}ms!`, 'Gemini Live');
      } else {
        addToast('info', res.message, 'Gemini Status');
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to reach Gemini endpoint.', 'Gemini Error');
      setGeminiTestResult({
        status: 'error',
        message: err.message,
        model: 'gemini-2.5-flash',
        api_key_configured: false,
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!profile?.id) {
      addToast('warning', 'Please set up your profile first.', 'Notice');
      return;
    }

    setSavingPreferences(true);
    try {
      const updated = await profileApi.update(profile.id, {
        weekly_study_hours: parseInt(weeklyHours, 10),
        target_duration_weeks: parseInt(targetWeeks, 10),
      });
      setProfile(updated);
      addToast('success', 'Preferences updated in backend!', 'Saved');
    } catch (err) {
      addToast('error', err.message || 'Failed to update preferences.', 'Error');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleResetLocalStorage = () => {
    localStorage.removeItem('roadmapiq_profile_id');
    localStorage.removeItem('roadmapiq_roadmap_id');
    refreshProfile();
    refreshRoadmap();
    addToast('info', 'Local storage identifiers cleared. Re-syncing with backend...', 'Reset');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="primary" className="mb-2">System & Preferences</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>Settings</span>
          <Settings className="w-6 h-6 text-brand-cyan" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Customize your learning environment, study pace, notifications, and inspect cloud diagnostics.
        </p>
      </div>

      {/* Progressive Disclosure Sub-Option Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-cyan text-navy-950 shadow-glow font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Learning Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="glass-panel p-6 space-y-5 animate-fadeIn">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Curriculum Pacing Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-300">
                <span>Weekly Dedicated Hours</span>
                <span className="text-brand-cyan font-mono font-bold">{weeklyHours} hrs/week</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>3 hrs (Light)</span>
                <span>15 hrs (Recommended)</span>
                <span>40+ hrs (Intensive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-300">
                <span>Target Duration (Weeks)</span>
                <span className="text-sky-400 font-mono font-bold">{targetWeeks} weeks</span>
              </div>
              <input
                type="range"
                min="4"
                max="26"
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(e.target.value)}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>4 wks (Sprint)</span>
                <span>12 wks (Standard)</span>
                <span>24+ wks (Mastery)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPreferences}
              className="btn-primary text-xs py-2 px-5"
            >
              <span>{savingPreferences ? 'Saving...' : 'Update Preferences'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Theme & Visual Environment */}
      {activeTab === 'theme' && (
        <div className="glass-panel p-6 space-y-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-brand-cyan" />
            <span>Theme & Visual Environment Calibration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400">Current Career Environment:</span>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
                <span>{activeRole?.title || 'Default Modern Cyber'}</span>
              </div>
              <p className="text-xs text-slate-400">
                Visual world adapts dynamically to your selected career track.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400">Audio Feedback Effects:</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-200">Milestone unlock and streak sound effects</span>
                <button
                  type="button"
                  onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
                    soundEffectsEnabled
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {soundEffectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEffectsEnabled ? 'Enabled' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-6 space-y-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notification & Habit Reminders</span>
          </h2>

          <div className="space-y-3">
            {[
              {
                id: 'daily',
                title: 'Daily Streak Preservation Alert',
                desc: 'Notifies you if your daily task has not been completed by 8:00 PM.',
                state: streakAlerts,
                setter: setStreakAlerts,
              },
              {
                id: 'weekly',
                title: 'Sunday Weekly Review Reminder',
                desc: 'Prompts you on Sundays to complete your weekly assessment and plan the next sprint.',
                state: weeklyReviewAlerts,
                setter: setWeeklyReviewAlerts,
              },
              {
                id: 'tasks',
                title: 'Curated Resource Recommendations',
                desc: 'Highlights newly matched free learning materials for your weak skills.',
                state: dailyTaskReminders,
                setter: setDailyTaskReminders,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>

                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-navy-900 text-brand-cyan focus:ring-brand-cyan cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Account & Diagnostics */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Backend Diagnostics */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-cyan" />
                <span>FastAPI Backend Diagnostics</span>
              </h2>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>Check Connectivity</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
                <span className="text-slate-400 block mb-1">Configured Base URL</span>
                <span className="text-brand-cyan font-bold">{apiBaseUrl}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
                <span className="text-slate-400 block mb-1">Backend Online Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}
                  />
                  <span className={backendOnline ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {backendOnline ? 'Connected & Healthy (200 OK)' : 'Unreachable / Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Provider Status */}
            <div className="p-4 rounded-xl bg-navy-850/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  AI Cloud Provider: Google Gemini API
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={aiStatus?.available ? 'success' : 'primary'} size="xs">
                    {aiStatus?.provider || 'Google Gemini API (Cloud)'}
                  </Badge>
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={testingGemini}
                    className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Sparkles className={`w-3 h-3 ${testingGemini ? 'animate-spin' : ''}`} />
                    <span>{testingGemini ? 'Testing...' : 'Test Gemini API'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-mono">
                Model: <strong className="text-brand-cyan">{aiStatus?.model || 'gemini-2.5-flash'}</strong>
                <span className="ml-3 text-slate-400">SDK: <code className="text-emerald-400">google-genai</code></span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {aiStatus?.message || 'Google Gemini API is configured for cloud inference across all RoadmapIQ features.'}
              </p>

              {geminiTestResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 mt-2 ${
                  geminiTestResult.status === 'ok'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Status: {geminiTestResult.status.toUpperCase()}</span>
                    {geminiTestResult.latency_ms && (
                      <span>Latency: {geminiTestResult.latency_ms} ms</span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-slate-300">{geminiTestResult.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Storage & Local Cache Controls */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Architecture & Storage Persistence</span>
            </h2>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Leaked Secrets:</strong> All AI provider endpoints and API keys are held strictly on the Python FastAPI backend. No credentials exist in the client.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Relational Persistence:</strong> All progress, tasks, and profiles are authoritatively persisted in the SQLite database.
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">Need to reset local cache keys?</span>
              <button
                type="button"
                onClick={handleResetLocalStorage}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Clear Local Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;


