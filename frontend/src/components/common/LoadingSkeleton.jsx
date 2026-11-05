import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 animate-pulse ${className}`}>
    <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="h-6 bg-slate-800 rounded w-3/4 mb-3"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-800/80 rounded w-full"></div>
      <div className="h-3 bg-slate-800/80 rounded w-5/6"></div>
      <div className="h-3 bg-slate-800/80 rounded w-2/3"></div>
    </div>
  </div>
);

export const SkeletonLine = ({ className = '' }) => (
  <div className={`h-4 bg-slate-800 rounded animate-pulse ${className}`} />
);

export const SkeletonStat = () => (
  <div className="glass-panel p-5 animate-pulse">
    <div className="h-3 bg-slate-800 rounded w-1/2 mb-3"></div>
    <div className="h-7 bg-slate-800 rounded w-1/3 mb-2"></div>
    <div className="h-2 bg-slate-800/60 rounded w-3/4"></div>
  </div>
);

export default SkeletonCard;

