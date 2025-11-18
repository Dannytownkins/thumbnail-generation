import React from 'react';

interface StickyGenerateBarProps {
  prompt: string;
  isLoading: boolean;
  isDisabled: boolean;
  onGenerate: () => void;
  activeModulesCount: number;
  selectedScene: string | null;
  selectedNegativesCount: number;
}

const StickyGenerateBar: React.FC<StickyGenerateBarProps> = ({
  prompt,
  isLoading,
  isDisabled,
  onGenerate,
  activeModulesCount,
  selectedScene,
  selectedNegativesCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent backdrop-blur-sm border-t border-slate-800 shadow-2xl">
      <div className="max-w-[1800px] mx-auto px-8 py-4">
        <div className="flex items-center gap-4">
          {/* Prompt Preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-400">Current Prompt:</span>
              {activeModulesCount > 0 && (
                <span className="px-2 py-0.5 bg-canam-orange text-white text-xs rounded-full font-bold">
                  {activeModulesCount} modules
                </span>
              )}
              {selectedScene && (
                <span className="px-2 py-0.5 bg-electric-blue text-white text-xs rounded-full font-bold">
                  Scene
                </span>
              )}
              {selectedNegativesCount > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold">
                  {selectedNegativesCount} negatives
                </span>
              )}
            </div>
            <div className="text-sm text-slate-300 truncate max-w-3xl">
              {prompt || <span className="text-slate-500 italic">Enter a prompt to get started...</span>}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={isDisabled}
            className={`flex-shrink-0 px-8 py-3 rounded-xl text-base font-bold text-white transition-all transform shadow-lg ${
              isDisabled
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-canam-orange via-red-600 to-canam-orange hover:scale-105 active:scale-95 shadow-canam-orange/50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span>Generate Thumbnail</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyGenerateBar;
