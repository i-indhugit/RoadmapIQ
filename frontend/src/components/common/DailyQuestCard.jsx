import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gamificationApi } from '../../services/api';
import {
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  HelpCircle,
  Code2,
  ChevronRight,
} from 'lucide-react';

const DailyQuestCard = () => {
  const { profile, gamification, refreshGamification, triggerCelebration, addToast } = useApp();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadChallenge = async () => {
    try {
      const data = await gamificationApi.getDailyChallenge();
      setChallenge(data);
    } catch (err) {
      console.warn('Daily challenge fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challenge || !solution.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await gamificationApi.submitDailyChallenge({
        challenge_id: challenge.id,
        solution_text: solution.trim(),
        profile_id: profile?.id,
      });

      setFeedback(res.feedback);
      if (res.success && res.xp_earned > 0) {
        triggerCelebration();
        await refreshGamification();
        addToast('success', res.feedback, 'Quest Conquered!');
      } else {
        addToast('info', res.feedback, 'Daily Quest');
      }
      setChallenge((prev) => (prev ? { ...prev, is_completed_today: true } : prev));
    } catch (err) {
      addToast('error', err.message || 'Failed to submit daily quest.', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !challenge) return null;

  return (
    <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-slate-800 shadow-xl">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Daily Skill Quest
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-navy-800 border border-slate-700 text-slate-300">
                {challenge.category}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">{challenge.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Zap className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP
          </span>
        </div>
      </div>

      {/* Description & Instructions */}
      <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
        {challenge.description}
      </p>

      {challenge.instructions && (
        <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800/80 mb-4 text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-brand-cyan">Quest Objective:</span>{' '}
          {challenge.instructions}
        </div>
      )}

      {/* Starter Prompt / Code Snippet */}
      {challenge.starter_prompt && (
        <div className="mb-4">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-brand-cyan" />
            Starter Template:
          </div>
          <pre className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {challenge.starter_prompt}
          </pre>
        </div>
      )}

      {/* Interactive Submission Form or Completed State */}
      {challenge.is_completed_today ? (
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-200">Daily Quest Conquered!</p>
              <p className="text-emerald-300/80">
                {feedback || "You've earned today's XP and advanced your learning streak."}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Done for Today
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Type your solution, code, query, or explanation here to claim +75 XP..."
            rows={3}
            className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Est. {challenge.time_estimate_mins || 15} mins
            </span>
            <button
              type="submit"
              disabled={!solution.trim() || submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-navy-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Verifying Quest...' : 'Submit & Claim XP'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DailyQuestCard;

