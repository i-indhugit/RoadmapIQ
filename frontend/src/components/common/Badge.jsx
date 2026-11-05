import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '', style }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] font-medium',
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  const isTheme = variant === 'primary' || variant === 'theme';

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700/80',
    primary: 'border font-medium',
    blue: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    indigo: 'bg-brand-indigo/15 text-indigo-300 border border-brand-indigo/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  };

  const themeStyle = isTheme
    ? {
        backgroundColor: 'var(--theme-badge-bg, rgba(0, 240, 255, 0.12))',
        borderColor: 'var(--theme-badge-border, rgba(0, 240, 255, 0.35))',
        color: 'var(--theme-badge-text, #00f0ff)',
        ...style,
      }
    : style;

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide ${sizeClasses[size] || sizeClasses.sm} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
      style={themeStyle}
    >
      {children}
    </span>
  );
};

export default Badge;

