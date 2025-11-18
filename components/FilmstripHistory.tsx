import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { getHistory, clearHistory } from '../utils/storage';
import { downloadImage, generateFilename } from '../utils/download';

interface FilmstripHistoryProps {
  onImageSelect: (imageUrl: string) => void;
}

const FilmstripHistory: React.FC<FilmstripHistoryProps> = ({ onImageSelect }) => {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
      setSelectedIndex(null);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    onImageSelect(history[index].url);
  };

  const selectedImage = selectedIndex !== null ? history[selectedIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎞️</span> Filmstrip History
          <span className="ml-2 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
            {history.length} images
          </span>
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-4xl mb-2">📽️</div>
          <p className="text-sm">No history yet. Start generating!</p>
        </div>
      ) : (
        <>
          {/* Filmstrip Thumbnails */}
          <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(index)}
                  className={`relative flex-shrink-0 group transition-all ${
                    selectedIndex === index
                      ? 'ring-2 ring-canam-orange ring-offset-2 ring-offset-slate-900 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ width: '120px' }}
                >
                  <img
                    src={image.url}
                    alt={`History ${index}`}
                    className="w-full aspect-video object-cover rounded border-2 border-slate-700 group-hover:border-slate-500"
                  />
                  {/* Frame number overlay */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded font-mono">
                    #{history.length - index}
                  </div>
                  {/* Selected indicator */}
                  {selectedIndex === index && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-canam-orange rounded-full border-2 border-white"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Film strip perforations effect */}
            <div className="absolute top-2 left-0 right-0 h-1 flex gap-2 px-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-2 h-1 bg-slate-700 rounded-full"></div>
              ))}
            </div>
            <div className="absolute bottom-2 left-0 right-0 h-1 flex gap-2 px-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-2 h-1 bg-slate-700 rounded-full"></div>
              ))}
            </div>
          </div>

          {/* Selected Image Details */}
          {selectedImage && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Image #{history.length - selectedIndex!}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedImage.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const filename = generateFilename(selectedImage.vehicle, selectedImage.prompt);
                    downloadImage(selectedImage.url, filename);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-electric-blue to-cyan-600 text-white text-xs font-medium rounded hover:from-electric-blue hover:to-cyan-700 transition-all"
                >
                  💾 Download
                </button>
              </div>

              {selectedImage.vehicle && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="px-2 py-1 bg-slate-700 text-slate-200 rounded">
                    {selectedImage.vehicle}
                  </span>
                </div>
              )}

              {selectedImage.prompt && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Prompt:</div>
                  <div className="text-xs text-slate-300 bg-slate-900/50 rounded p-2 max-h-20 overflow-y-auto">
                    {selectedImage.prompt}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Model: {selectedImage.model}</span>
                <span>•</span>
                <span>Ratio: {selectedImage.settings?.aspectRatio || 'N/A'}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilmstripHistory;
