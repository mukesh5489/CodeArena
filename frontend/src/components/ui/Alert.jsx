import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const alertConfig = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  const config = alertConfig[variant] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-xs sm:text-sm font-medium ${config.classes} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <Icon size={18} className="flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          {title && <h4 className="font-bold">{title}</h4>}
          <div className="leading-relaxed opacity-95">{children}</div>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
