import React, { useState } from 'react';
import { PROMPT_MODULES, getModulesByCategory, PromptModule } from '../utils/promptModules';
import { StylePreset } from '../types';

interface PromptModuleSelectorProps {
  activeModules: string[];
  onModulesChange: (modules: string[]) => void;
  stylePresets?: StylePreset[];
  onSavePreset?: (name: string) => void;
  onApplyPreset?: (preset: StylePreset) => void;
  onDeletePreset?: (id: string) => void;
}

const PromptModuleSelector: React.FC<PromptModuleSelectorProps> = ({
  activeModules,
  onModulesChange,
  stylePresets = [],
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('motion');
  const [presetName, setPresetName] = useState('');

  const categories: Array<{ id: PromptModule['category']; name: string; icon: string }> = [
    { id: 'motion', name: 'Motion & Speed', icon: '💨' },
    { id: 'lighting', name: 'Expert Lighting', icon: '💡' },
    { id: 'angle', name: 'Hero Angles', icon: '📐' },
    { id: 'quality', name: 'Quality & Detail', icon: '🔍' },
    { id: 'style', name: 'Style', icon: '🎨' },
    { id: 'atmosphere', name: 'Atmosphere', icon: '✨' },
  ];

  const toggleModule = (moduleId: string) => {
    if (activeModules.includes(moduleId)) {
      onModulesChange(activeModules.filter((id) => id !== moduleId));
    } else {
      onModulesChange([...activeModules, moduleId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const clearAll = () => {
    onModulesChange([]);
  };

  const activeCount = activeModules.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎛️</span> Prompt Modules
          {activeCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-canam-orange text-white text-xs rounded-full font-bold">
              {activeCount} active
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Toggle modules to stack effects into your prompt. Mix and match for unique results!
      </p>

      <div className="flex flex-col gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Name this style DNA..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-canam-orange"
          />
          <button
            onClick={() => {
              onSavePreset?.(presetName);
              setPresetName('');
            }}
            disabled={!presetName.trim() || activeModules.length === 0}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-canam-orange to-red-600 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>

        {stylePresets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stylePresets.map((preset) => (
              <div
                key={preset.id}
                className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-2"
              >
                <button
                  onClick={() => onApplyPreset?.(preset)}
                  className="hover:text-canam-orange transition-colors"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => onDeletePreset?.(preset.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const modules = getModulesByCategory(category.id);
          const categoryActiveCount = modules.filter((m) => activeModules.includes(m.id)).length;
          const isExpanded = expandedCategory === category.id;

          return (
            <div
              key={category.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-white">{category.name}</span>
                  {categoryActiveCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-canam-orange text-white text-xs rounded-full">
                      {categoryActiveCount}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Module List */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                  {modules.map((module) => {
                    const isActive = activeModules.includes(module.id);
                    return (
                      <button
                        key={module.id}
                        onClick={() => toggleModule(module.id)}
                        className={`w-full px-3 py-2 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-canam-orange to-red-600 text-white shadow-lg'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{module.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{module.name}</div>
                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                              {module.description}
                            </div>
                          </div>
                          {isActive && (
                            <svg
                              className="w-5 h-5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Modules Preview */}
      {activeCount > 0 && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Active Effects:</h4>
          <div className="flex flex-wrap gap-2">
            {activeModules.map((moduleId) => {
              const module = PROMPT_MODULES.find((m) => m.id === moduleId);
              if (!module) return null;
              return (
                <div
                  key={moduleId}
                  className="px-2 py-1 bg-gradient-to-r from-canam-orange to-red-600 text-white text-xs rounded-full flex items-center gap-1"
                >
                  <span>{module.icon}</span>
                  <span>{module.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptModuleSelector;
