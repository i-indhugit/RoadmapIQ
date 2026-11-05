import React from 'react';
import { Award, CheckCircle2, Star, Sparkles, X, Compass, ExternalLink } from 'lucide-react';

const CareerCompletionModal = ({ isOpen, onClose, roadmap, theme, profile }) => {
  if (!isOpen || !roadmap) return null;

  const totalTasks = roadmap.tasks?.length || 0;
  const totalHours = roadmap.total_estimated_hours || 40;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-navy-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-navy-900 to-emerald-950/60 border-b border-emerald-500/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-navy-950 flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Career Track Completed
              </span>
              <h2 className="text-xl font-extrabold text-slate-100">
                {theme?.landmark?.badge || 'Career Certified'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-5 text-center">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">This certifies that</p>
            <h3 className="text-2xl font-black text-brand-cyan">
              {profile?.display_name || 'Ambitious Learner'}
            </h3>
            <p className="text-xs text-slate-300">
              has successfully mastered all curriculum phases for
            </p>
            <p className="text-base font-bold text-emerald-400">
              {roadmap.role_title}
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-xl font-black text-emerald-400">100%</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Readiness Score</p>
            </div>
            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-xl font-black text-brand-cyan">{totalTasks}</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Skills Mastered</p>
            </div>
            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-xl font-black text-amber-400">~{totalHours}h</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Practical Hours</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed bg-navy-950/60 p-3.5 rounded-2xl border border-slate-800">
            {theme?.landmark?.subtitle ||
              'You have completed all prerequisite foundations, core methodologies, and capstone milestones for this career track.'}
          </p>
        </div>

        {/* Footer */}
        <div className="p-5 bg-navy-950/90 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continue Exploring Roadmaps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerCompletionModal;

