import React from 'react';

const variantStyles = {
  // Difficulties
  easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/30',
  hard: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/30',

  // Contest States
  live: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 dark:text-emerald-400 animate-pulse',
  upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30',
  completed: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400 dark:border-slate-500/20',

  // Roles & Types
  purple: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400 dark:border-purple-500/30',
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30',
  default: 'bg-slate-500/10 text-theme-sub border-theme',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] font-bold rounded-md gap-1',
  md: 'px-2.5 py-1 text-xs font-bold rounded-lg gap-1.5',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) {
  const v = variantStyles[variant?.toLowerCase()] || variantStyles.default;
  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center border font-semibold tracking-wide uppercase ${v} ${s} ${className}`}
    >
      {icon && <span className="flex-shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
