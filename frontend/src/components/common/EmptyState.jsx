import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There is currently no data matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="glass-panel p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-navy-800 border border-slate-700/80 flex items-center justify-center mb-4 text-brand-cyan shadow-glow-cyan/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

