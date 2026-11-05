import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { gamificationApi } from '../services/api';
import { useApp } from '../context/AppContext';

export default function LeaderboardPage() {
  const { userProfile, activeTheme, gamification, refreshGamification } = useApp();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOptedIn, setIsOptedIn] = useState(true);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gamificationApi.getLeaderboard();
      setLeaderboard(data || []);
      // Check current user opt-in from profile
      if (userProfile) {
        setIsOptedIn(userProfile.leaderboard_opt_in ?? true);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Unable to load leaderboard ranking at this moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    setTogglingPrivacy(true);
    try {
      const res = await gamificationApi.toggleLeaderboardPrivacy(userProfile?.id);
      setIsOptedIn(res.opt_in);
      await fetchLeaderboard();
      refreshGamification();
    } catch (err) {
      console.error('Failed to toggle leaderboard privacy:', err);
      alert('Error updating privacy preference: ' + (err.message || 'Unknown error'));
    } finally {
      setTogglingPrivacy(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: activeTheme?.palette?.cardBg || 'rgba(10, 15, 29, 0.85)',
          borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.6)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2 text-amber-400">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Verified XP Honor Roll</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Global <span className="text-amber-400">Leaderboard</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Rankings reflect verified XP earned exclusively from completed roadmap checkpoints, arena challenges, and boss triumphs. No XP is granted for passive browsing.
            </p>
          </div>

          {/* Privacy Opt-in Switch */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                {isOptedIn ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                <span>Leaderboard Visibility</span>
              </div>
              <button
                onClick={handleTogglePrivacy}
                disabled={togglingPrivacy}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isOptedIn
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {togglingPrivacy ? 'Updating...' : isOptedIn ? 'Opted In' : 'Private (Opted Out)'}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 leading-tight">
              {isOptedIn ? 'Your gamer handle is visible on the board.' : 'Your profile is hidden from the public board.'}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {topThree.map((entry) => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            const podiumBorder = isFirst
              ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-slate-900/90 shadow-xl shadow-amber-500/10'
              : isSecond
              ? 'border-slate-300/40 bg-gradient-to-b from-slate-400/10 to-slate-900/90 shadow-lg'
              : 'border-amber-700/40 bg-gradient-to-b from-amber-800/10 to-slate-900/90 shadow-lg';

            const crownColor = isFirst
              ? 'text-amber-400 bg-amber-500/20 border-amber-400/50'
              : isSecond
              ? 'text-slate-300 bg-slate-400/20 border-slate-400/50'
              : 'text-amber-600 bg-amber-700/20 border-amber-600/50';

            return (
              <div
                key={entry.rank}
                className={`relative rounded-3xl border p-6 flex flex-col items-center text-center ${podiumBorder} ${
                  isFirst ? 'md:-translate-y-2' : ''
                }`}
              >
                {/* Crown / Rank Badge */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-mono font-bold text-lg mb-3 ${crownColor}`}>
                  {isFirst ? <Crown className="w-6 h-6 animate-bounce" /> : `#${entry.rank}`}
                </div>

                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-1">
                  {entry.level_title}
                </div>
                <h3 className="text-lg font-bold text-white truncate max-w-full">
                  {entry.gamer_handle}
                </h3>

                {/* Total XP Highlight */}
                <div className="mt-3 py-1.5 px-4 rounded-xl bg-slate-950/70 border border-slate-800 text-amber-300 font-mono font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{entry.total_xp.toLocaleString()} XP</span>
                </div>

                {/* Streak & Badges Meta */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3 w-full">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Flame className="w-3.5 h-3.5" />
                    {entry.streak_days}d Streak
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Award className="w-3.5 h-3.5" />
                    {entry.badges_count} Badges
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Complete Rankings</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Top 50 Verified Candidates
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            Loading candidate ranking matrix...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400 font-mono text-xs">
            {error}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((player) => {
              const isCurrentUser = player.is_current_user;
              return (
                <div
                  key={player.rank}
                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-cyan-500/10 border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & Handle */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span
                      className={`w-7 text-center font-mono font-bold text-sm ${
                        player.rank <= 3 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      #{player.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {player.gamer_handle}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Lv. {player.level} • {player.level_title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges, Streak, XP */}
                  <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{player.streak_days}d</span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-cyan-400 text-sm">
                        {player.total_xp.toLocaleString()} XP
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        verified
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

