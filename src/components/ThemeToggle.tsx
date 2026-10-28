import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  variant?: 'button' | 'icon' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
  variant = 'button'
}) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div 
        role="group" 
        aria-label="Pilih Mode Tampilan"
        className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-medium transition-colors ${
          isDark 
            ? 'bg-slate-950 border-slate-700' 
            : 'bg-slate-100 border-slate-200'
        } ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={!isDark}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
            !isDark 
              ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Gunakan Mode Terang (Light Mode)"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Terang</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
            isDark 
              ? 'bg-slate-900 text-slate-200 shadow-2xs font-semibold border border-slate-700' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Gunakan Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-slate-200" />
          <span>Gelap</span>
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Dark Mode'}
        title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Dark Mode'}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
          isDark
            ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45 text-slate-200" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
        isDark
          ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 shadow-2xs'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Ganti ke Tampilan Mode Terang (Light Mode)' : 'Ganti ke Tampilan Mode Gelap (Dark Mode)'}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  );
};
