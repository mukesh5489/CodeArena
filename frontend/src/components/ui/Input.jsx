import React from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  helperText,
  error,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-theme-main">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-theme-muted pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border bg-theme-surface text-theme-main placeholder-theme-muted text-xs sm:text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'
          } ${error ? 'border-rose-500' : 'border-theme'}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-theme-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
