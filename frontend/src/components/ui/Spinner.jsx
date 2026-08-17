import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', className = '', label }) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 p-4 ${className}`}>
      <Loader2
        size={sizeMap[size] || 24}
        className="animate-spin text-blue-500"
      />
      {label && <p className="text-xs text-theme-muted font-medium">{label}</p>}
    </div>
  );
}

export default Spinner;
