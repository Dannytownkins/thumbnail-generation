import React from 'react';
import { THEMES, applyTheme } from '../utils/themes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const handleThemeSelect = (themeId: string) => {
    applyTheme(themeId);
    onThemeChange(themeId);
    // Optionally save to localStorage
    localStorage.setItem('selectedTheme', themeId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="text-2xl">🎨</span> Color Theme
      </h3>

      <p className="text-sm text-slate-400">
        Choose your preferred color scheme
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.values(THEMES).map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`relative p-4 rounded-lg text-left transition-all border-2 overflow-hidden ${
                isSelected
                  ? 'border-white shadow-lg scale-105'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-30`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>{theme.name}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-xs text-slate-300 mb-3">{theme.description}</div>

                {/* Color Palette Preview */}
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                  ></div>
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                  ></div>
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-slate-600"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                  ></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Theme Info */}
      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Active Theme Colors:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Primary:</span>{' '}
            <span className="text-slate-300 font-mono">{THEMES[currentTheme].colors.primary}</span>
          </div>
          <div>
            <span className="text-slate-500">Secondary:</span>{' '}
            <span className="text-slate-300 font-mono">{THEMES[currentTheme].colors.secondary}</span>
          </div>
          <div>
            <span className="text-slate-500">Accent:</span>{' '}
            <span className="text-slate-300 font-mono">{THEMES[currentTheme].colors.accent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
