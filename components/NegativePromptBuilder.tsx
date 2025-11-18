import React, { useState } from 'react';
import { getNegativePrompts } from '../utils/sceneLibrary';

interface NegativePromptBuilderProps {
  selectedNegatives: string[];
  onNegativesChange: (negatives: string[]) => void;
}

const NegativePromptBuilder: React.FC<NegativePromptBuilderProps> = ({
  selectedNegatives,
  onNegativesChange,
}) => {
  const allNegatives = getNegativePrompts();
  const [searchTerm, setSearchTerm] = useState('');

  const toggleNegative = (negative: string) => {
    if (selectedNegatives.includes(negative)) {
      onNegativesChange(selectedNegatives.filter((n) => n !== negative));
    } else {
      onNegativesChange([...selectedNegatives, negative]);
    }
  };

  const clearAll = () => {
    onNegativesChange([]);
  };

  const addCustomNegative = () => {
    if (searchTerm.trim() && !allNegatives.includes(searchTerm.trim())) {
      onNegativesChange([...selectedNegatives, searchTerm.trim()]);
      setSearchTerm('');
    }
  };

  const filteredNegatives = allNegatives.filter((negative) =>
    negative.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = selectedNegatives.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🚫</span> Negative Prompts
          {activeCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full font-bold">
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
        Select issues to avoid in your generated images
      </p>

      {/* Search/Add Custom */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCustomNegative()}
          placeholder="Search or add custom..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
        {searchTerm.trim() && !allNegatives.includes(searchTerm.trim()) && (
          <button
            onClick={addCustomNegative}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
          >
            Add
          </button>
        )}
      </div>

      {/* Available Negatives */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Common Issues:</h4>
        <div className="grid grid-cols-2 gap-2">
          {filteredNegatives.map((negative) => {
            const isSelected = selectedNegatives.includes(negative);
            return (
              <button
                key={negative}
                onClick={() => toggleNegative(negative)}
                className={`px-3 py-2 rounded-lg text-left text-sm transition-all border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{negative}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
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
      </div>

      {/* Selected Negatives Display */}
      {activeCount > 0 && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <h4 className="text-xs font-medium text-red-400 mb-2">Will Avoid:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedNegatives.map((negative) => (
              <div
                key={negative}
                className="group px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center gap-1"
              >
                <span>{negative}</span>
                <button
                  onClick={() => toggleNegative(negative)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NegativePromptBuilder;
