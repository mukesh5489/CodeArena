import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary:
    'bg-[#4F7CFF] hover:bg-[#3B6BF6] text-white shadow-md shadow-blue-500/20 active:translate-y-0.5 border border-transparent',
  secondary:
    'bg-[#111827] dark:bg-[#111827] light:bg-[#F1F5F9] text-theme-main border border-theme hover:border-blue-500/40 hover:bg-theme-surface',
  outline:
    'bg-transparent border border-theme hover:border-blue-500/50 text-theme-main hover:bg-blue-500/5',
  ghost:
    'bg-transparent text-theme-sub hover:text-theme-main hover:bg-theme-surface border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:translate-y-0.5 border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:translate-y-0.5 border border-transparent',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base font-bold rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${v} ${s} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 13 : 16} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
