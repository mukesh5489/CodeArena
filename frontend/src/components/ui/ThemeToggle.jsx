import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-theme hover:border-blue-500/50 bg-theme-surface text-theme-sub hover:text-theme-main transition-all duration-200 cursor-pointer shadow-sm ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={iconSize} className="text-amber-400 animate-fade-in" />
      ) : (
        <Moon size={iconSize} className="text-indigo-600 animate-fade-in" />
      )}
    </button>
  );
}
