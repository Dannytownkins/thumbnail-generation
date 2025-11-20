import React from 'react';
import { PROMPT_MODULES } from '../utils/promptModules';
import { SCENE_LIBRARY } from '../utils/sceneLibrary';

interface InteractivePromptPreviewProps {
  basePrompt: string;
  activeModules: string[];
  selectedScene: string | null;
  selectedNegatives: string[];
  vehicle?: string | null;
  previousPrompt?: string | null;
}

const InteractivePromptPreview: React.FC<InteractivePromptPreviewProps> = ({
  basePrompt,
  activeModules,
  selectedScene,
  selectedNegatives,
  vehicle,
  previousPrompt,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Build the full prompt
  const buildFullPrompt = () => {
    let parts: Array<{ text: string; type: 'base' | 'vehicle' | 'scene' | 'module' }> = [];

    // Base prompt
    if (basePrompt) {
      parts.push({ text: basePrompt, type: 'base' });
    }

    // Vehicle
    if (vehicle) {
      parts.push({ text: vehicle, type: 'vehicle' });
    }

    // Scene keywords
    if (selectedScene) {
      const scene = SCENE_LIBRARY.find((s) => s.id === selectedScene);
      if (scene) {
        parts.push({ text: scene.keywords, type: 'scene' });
      }
    }

    // Module keywords
    activeModules.forEach((moduleId) => {
      const module = PROMPT_MODULES.find((m) => m.id === moduleId);
      if (module) {
        parts.push({ text: module.keywords, type: 'module' });
      }
    });

    return parts;
  };

  const promptParts = buildFullPrompt();
  const fullPromptText = promptParts.map((p) => p.text).join(', ');
  const diffSegments = React.useMemo(() => {
    if (!previousPrompt) return null;
    const prevWords = previousPrompt.split(/\s+/).filter(Boolean);
    const currentWords = fullPromptText.split(/\s+/).filter(Boolean);
    const seen = new Set(prevWords);
    return currentWords.map((word) => ({
      word,
      added: !seen.has(word),
    }));
  }, [previousPrompt, fullPromptText]);
  const characterCount = fullPromptText.length;
  const wordCount = fullPromptText.split(/\s+/).filter(Boolean).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'base':
        return 'text-white bg-slate-700';
      case 'vehicle':
        return 'text-white bg-purple-600';
      case 'scene':
        return 'text-white bg-electric-blue';
      case 'module':
        return 'text-white bg-canam-orange';
      default:
        return 'text-slate-300 bg-slate-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'base':
        return '📝 Base';
      case 'vehicle':
        return '🏍️ Vehicle';
      case 'scene':
        return '🎬 Scene';
      case 'module':
        return '🎛️ Module';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🔍</span> Prompt Preview
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-400">
        <div>
          <span className="font-medium">{wordCount}</span> words
        </div>
        <div>
          <span className="font-medium">{characterCount}</span> characters
        </div>
        <div>
          <span className="font-medium">{promptParts.length}</span> components
        </div>
      </div>

      {/* Preview */}
      {isExpanded ? (
        <div className="space-y-2 max-h-64 overflow-y-auto bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          {promptParts.map((part, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs text-slate-500">{getTypeLabel(part.type)}</div>
              <div className={`text-sm px-3 py-2 rounded ${getTypeColor(part.type)}`}>
                {part.text}
              </div>
            </div>
          ))}

          {selectedNegatives.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-700">
              <div className="text-xs text-red-400">🚫 Negative Prompts</div>
              <div className="text-sm px-3 py-2 rounded bg-red-900/30 text-red-200 border border-red-700/50">
                {selectedNegatives.join(', ')}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-slate-300 line-clamp-2">
            {fullPromptText || (
              <span className="text-slate-500 italic">Start building your prompt...</span>
            )}
          </div>
          {selectedNegatives.length > 0 && (
            <div className="text-xs text-red-300 mt-2 line-clamp-1">
              🚫 {selectedNegatives.join(', ')}
            </div>
          )}
        </div>
      )}

      {diffSegments && diffSegments.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1">
          <div className="text-slate-400 font-semibold">Prompt delta vs previous run</div>
          <p className="leading-5">
            {diffSegments.map((segment, index) => (
              <span
                key={`${segment.word}-${index}`}
                className={segment.added ? 'text-green-300 font-semibold' : 'text-slate-400'}
              >
                {segment.word}{' '}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Legend */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-slate-700"></div>
            <span className="text-slate-400">Base</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-purple-600"></div>
            <span className="text-slate-400">Vehicle</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-electric-blue"></div>
            <span className="text-slate-400">Scene</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-canam-orange"></div>
            <span className="text-slate-400">Module</span>
          </div>
          {selectedNegatives.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-red-600"></div>
              <span className="text-slate-400">Negative</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractivePromptPreview;
