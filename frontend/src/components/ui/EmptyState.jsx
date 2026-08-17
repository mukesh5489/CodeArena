import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon,
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`text-center py-16 px-4 rounded-2xl border border-theme bg-theme-card space-y-4 animate-fade-in ${className}`}
    >
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-surface border border-theme text-theme-muted mx-auto shadow-sm">
        {icon || <PackageOpen size={28} />}
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-theme-main">{title}</h3>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
