import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Award,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Heart,
  Skull,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { gamificationApi } from '../services/api';
import { useApp } from '../context/AppContext';

export default function BossBattlesPage() {
  const { userProfile, activeTheme, gamification, refreshGamification } = useApp();
  const [bosses, setBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Battle Modal
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBosses();
  }, []);

  const fetchBosses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gamificationApi.getBosses(userProfile?.id);
      setBosses(data || []);
    } catch (err) {
      console.error('Failed to fetch boss battles:', err);
      setError('Unable to summon boss encounters. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBattle = (boss) => {
    const playerLevel = gamification?.level || 1;
    if (playerLevel < boss.required_level) {
      alert(`Level ${boss.required_level} required to challenge this Titan! Your current level is ${playerLevel}. Complete quests in the Career Arena to level up.`);
      return;
    }
    setSelectedBoss(boss);
    setCurrentPhaseIndex(0);
    setAnswers({});
    setBattleResult(null);
  };

  const handleSelectAnswer = (phaseKey, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [phaseKey]: optionIdx,
    }));
  };

  const handleSubmitBattle = async () => {
    if (!selectedBoss) return;
    setSubmitting(true);
    try {
      const result = await gamificationApi.fightBoss(selectedBoss.id, {
        profile_id: userProfile?.id,
        answers: answers,
      });
      setBattleResult(result);
      refreshGamification();
      fetchBosses();
    } catch (err) {
      console.error('Failed fighting boss:', err);
      alert('Battle failed to evaluate: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const currentPhases = selectedBoss?.phases || [];
  const activePhase = currentPhases[currentPhaseIndex];
  const playerLevel = gamification?.level || 1;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: activeTheme?.palette?.cardBg || 'rgba(10, 15, 29, 0.85)',
          borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.6)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2 text-rose-400">
              <Skull className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Milestone Boss Raids & Technical Mastery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Boss <span className="text-rose-400">Battles</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Formidable multi-phase milestone assessments designed to pressure-test your architectural reasoning and foundational mastery. Passing score: 70%+ to shatter the boss barrier.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shrink-0">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-mono">Titans Defeated</div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <span>{bosses.filter((b) => b.is_defeated).length} / {bosses.length}</span>
                <span className="text-xs text-slate-400 font-normal">Shattered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bosses Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Summoning Titans...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bosses.map((boss) => {
            const isLocked = playerLevel < boss.required_level;
            const isDefeated = boss.is_defeated;

            return (
              <div
                key={boss.id}
                className={`group relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                  isDefeated
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : isLocked
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                      Req Lv. {boss.required_level}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        +{boss.xp_reward} XP
                      </span>
                      {isDefeated && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          Shattered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Boss Avatar & Name */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isDefeated
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : isLocked
                          ? 'bg-slate-800 border-slate-700 text-slate-500'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-md shadow-rose-500/20'
                      }`}
                    >
                      {isDefeated ? (
                        <Trophy className="w-7 h-7" />
                      ) : isLocked ? (
                        <Lock className="w-7 h-7" />
                      ) : (
                        <Skull className="w-7 h-7 animate-pulse" />
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                        {boss.category}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                        {boss.boss_name}
                      </h3>
                      <div className="text-xs text-rose-400/90 font-medium">
                        {boss.boss_title}
                      </div>
                    </div>
                  </div>

                  {/* Boss HP Bar */}
                  <div className="my-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        Titan Barrier
                      </span>
                      <span className="text-slate-300 font-bold">
                        {isDefeated ? '0 / 100 HP (Shattered)' : `${boss.health_points} / 100 HP`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isDefeated
                            ? 'w-0'
                            : 'w-full bg-gradient-to-r from-rose-500 to-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {boss.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    {boss.phases?.length || 3} Trial Phases
                  </div>

                  <button
                    onClick={() => handleStartBattle(boss)}
                    disabled={isLocked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isLocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isDefeated
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked (Lv. {boss.required_level})</span>
                      </>
                    ) : isDefeated ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-Challenge</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5" />
                        <span>Initiate Raid</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Battle Trial Modal */}
      {selectedBoss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-rose-500/40 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Skull className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono text-rose-400 uppercase tracking-widest">
                    TITAN RAID • PHASE {currentPhaseIndex + 1} OF {currentPhases.length}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedBoss.boss_name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedBoss(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Phase Stepper Pills */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4">
                {currentPhases.map((phase, idx) => {
                  const key = `phase_${idx + 1}`;
                  const isAnswered = answers[key] !== undefined;
                  const isCurrent = currentPhaseIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhaseIndex(idx)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all border ${
                        isCurrent
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md shadow-rose-500/10'
                          : isAnswered
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      Phase {idx + 1} {isAnswered ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Active Phase Question Card */}
              {activePhase && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold mb-2">
                      Trial Challenge {currentPhaseIndex + 1}
                    </h4>
                    <p className="text-base text-slate-100 font-medium leading-relaxed">
                      {activePhase.question}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {activePhase.options.map((option, optIdx) => {
                      const phaseKey = `phase_${currentPhaseIndex + 1}`;
                      const isSelected = answers[phaseKey] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(phaseKey, optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-sm font-medium flex items-center justify-between ${
                            isSelected
                              ? 'bg-rose-500/15 border-rose-400 text-white shadow-md shadow-rose-500/10'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-mono flex items-center justify-center font-bold border ${
                                isSelected
                                  ? 'bg-rose-500 text-white border-rose-400'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Battle Result Notification */}
              {battleResult && (
                <div
                  className={`p-5 rounded-2xl border animate-fadeIn ${
                    battleResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-base mb-1">
                    {battleResult.passed ? (
                      <>
                        <Trophy className="w-6 h-6 text-emerald-400" />
                        <span>Titan Shattered! Final Score: {battleResult.score_percentage}%</span>
                      </>
                    ) : (
                      <>
                        <Skull className="w-6 h-6 text-rose-400" />
                        <span>Titan Resisted — Score: {battleResult.score_percentage}% (Required: {selectedBoss.passing_score}%)</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mt-1 opacity-90">
                    {battleResult.feedback}
                  </p>
                  {battleResult.xp_awarded > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{battleResult.xp_awarded} Verified XP Added to Ledger
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentPhaseIndex > 0) setCurrentPhaseIndex(currentPhaseIndex - 1);
                }}
                disabled={currentPhaseIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30"
              >
                Previous Phase
              </button>

              <div className="flex items-center gap-3">
                {currentPhaseIndex < currentPhases.length - 1 ? (
                  <button
                    onClick={() => setCurrentPhaseIndex(currentPhaseIndex + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-800 hover:bg-slate-700"
                  >
                    <span>Next Phase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitBattle}
                    disabled={submitting || Object.keys(answers).length < currentPhases.length}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 transition-all shadow-lg shadow-rose-600/30"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Shattering Barrier...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        <span>Unleash Final Strike</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

