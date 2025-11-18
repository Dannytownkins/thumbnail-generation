import React, { useState } from 'react';
import { SCENE_LIBRARY, getScenesByCategory, Scene } from '../utils/sceneLibrary';

interface SceneLibrarySelectorProps {
  selectedScene: string | null;
  onSceneSelect: (sceneId: string | null) => void;
}

const SceneLibrarySelector: React.FC<SceneLibrarySelectorProps> = ({
  selectedScene,
  onSceneSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<Scene['category'] | 'all'>('all');

  const categories: Array<{ id: Scene['category'] | 'all'; name: string; icon: string }> = [
    { id: 'all', name: 'All Scenes', icon: '🌟' },
    { id: 'road', name: 'Roads', icon: '🛣️' },
    { id: 'urban', name: 'Urban', icon: '🏙️' },
    { id: 'studio', name: 'Studio', icon: '🎬' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'track', name: 'Track', icon: '🏁' },
  ];

  const displayedScenes = activeCategory === 'all'
    ? SCENE_LIBRARY
    : getScenesByCategory(activeCategory);

  const handleSceneClick = (sceneId: string) => {
    if (selectedScene === sceneId) {
      onSceneSelect(null);
    } else {
      onSceneSelect(sceneId);
    }
  };

  const selectedSceneData = SCENE_LIBRARY.find((s) => s.id === selectedScene);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎬</span> Background Scenes
          {selectedScene && (
            <span className="ml-2 px-2 py-1 bg-electric-blue text-white text-xs rounded-full font-bold">
              Scene Active
            </span>
          )}
        </h3>
        {selectedScene && (
          <button
            onClick={() => onSceneSelect(null)}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Choose a preset background scene for your thumbnail
      </p>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-electric-blue to-cyan-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Scene Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {displayedScenes.map((scene) => {
          const isSelected = selectedScene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => handleSceneClick(scene.id)}
              className={`p-4 rounded-lg text-left transition-all border-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-electric-blue/20 to-cyan-600/20 border-electric-blue shadow-lg shadow-electric-blue/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{scene.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm mb-1 flex items-center justify-between">
                    <span className="truncate">{scene.name}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-electric-blue flex-shrink-0 ml-2"
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
                  <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {scene.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scene Preview */}
      {selectedSceneData && (
        <div className="p-4 bg-gradient-to-br from-electric-blue/10 to-cyan-600/10 border border-electric-blue/50 rounded-lg">
          <h4 className="text-xs font-medium text-electric-blue mb-2">Scene Keywords:</h4>
          <div className="text-sm text-slate-300 italic">
            "{selectedSceneData.keywords}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneLibrarySelector;
