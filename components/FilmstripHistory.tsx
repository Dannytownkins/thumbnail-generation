import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedImage } from '../types';
import { getHistory, clearHistory } from '../utils/storage';
import { downloadImage, generateFilename } from '../utils/download';
import { updateHistoryImage } from '../utils/historyStore';

interface FilmstripHistoryProps {
  onImageSelect: (imageUrl: string) => void;
}

const FilmstripHistory: React.FC<FilmstripHistoryProps> = ({ onImageSelect }) => {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'shipped'>('all');

  useEffect(() => {
    loadHistory();
    const handler = () => loadHistory();
    window.addEventListener('history:refresh', handler);
    return () => window.removeEventListener('history:refresh', handler);
  }, []);

  const loadHistory = async () => {
    const historyData = await getHistory();
    setHistory(historyData);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      await clearHistory();
      setHistory([]);
      setSelectedId(null);
    }
  };

  const filteredHistory = useMemo(() => {
    if (filter === 'favorites') return history.filter((img) => img.favorite);
    if (filter === 'shipped') return history.filter((img) => img.shipped);
    return history;
  }, [history, filter]);

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedId(image.id);
    onImageSelect(image.url);
  };

  const selectedImage =
    history.find((img) => img.id === selectedId) ?? filteredHistory[0] ?? null;

  const toggleFlag = async (image: GeneratedImage, field: 'favorite' | 'shipped') => {
    const updatedValue = !image[field];
    await updateHistoryImage(image.id, { [field]: updatedValue });
    setHistory((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, [field]: updatedValue } : img)),
    );
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyFavorites = history.filter(
    (img) => img.favorite && (img.timestamp ?? 0) >= weekAgo,
  ).length;
  const weeklyShipped = history.filter(
    (img) => img.shipped && (img.timestamp ?? 0) >= weekAgo,
  ).length;

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

      <div className="flex flex-wrap gap-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full border ${
            filter === 'all' ? 'border-canam-orange text-white' : 'border-slate-700 text-slate-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`px-3 py-1 rounded-full border ${
            filter === 'favorites' ? 'border-canam-orange text-white' : 'border-slate-700 text-slate-400'
          }`}
        >
          Favorites ({history.filter((img) => img.favorite).length})
        </button>
        <button
          onClick={() => setFilter('shipped')}
          className={`px-3 py-1 rounded-full border ${
            filter === 'shipped' ? 'border-canam-orange text-white' : 'border-slate-700 text-slate-400'
          }`}
        >
          Shipped ({history.filter((img) => img.shipped).length})
        </button>
      </div>

      <div className="flex gap-4 text-xs text-slate-400">
        <span>⭐ Favorites this week: {weeklyFavorites}</span>
        <span>🚀 Shipped this week: {weeklyShipped}</span>
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
              {filteredHistory.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className={`relative flex-shrink-0 group transition-all ${
                    selectedId === image.id
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
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded font-mono flex items-center gap-1">
                    <span>#{history.length - index}</span>
                    {image.favorite && <span>⭐</span>}
                    {image.shipped && <span>🚀</span>}
                  </div>
                  {/* Selected indicator */}
                  {selectedId === image.id && (
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
                    {(() => {
                      const overallIndex = history.findIndex((img) => img.id === selectedImage.id);
                      const displayNumber =
                        overallIndex === -1 ? '?' : history.length - overallIndex;
                      return `Image #${displayNumber}`;
                    })()}
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

              <div className="flex gap-2">
                <button
                  onClick={() => toggleFlag(selectedImage, 'favorite')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold border ${
                    selectedImage.favorite ? 'border-yellow-400 text-yellow-200' : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {selectedImage.favorite ? '⭐ Favorite' : '☆ Mark favorite'}
                </button>
                <button
                  onClick={() => toggleFlag(selectedImage, 'shipped')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold border ${
                    selectedImage.shipped ? 'border-green-400 text-green-200' : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {selectedImage.shipped ? '🚀 Shipped' : '🚀 Mark shipped'}
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

              {selectedImage.note && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Notes:</div>
                  <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                    {selectedImage.note}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Model: {selectedImage.model}</span>
                <span>•</span>
                <span>Ratio: {selectedImage.settings?.aspectRatio || 'N/A'}</span>
              </div>

              {selectedImage.exportLogs && selectedImage.exportLogs.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-slate-500 mb-1">Export log</div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {selectedImage.exportLogs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs text-slate-300 flex justify-between"
                      >
                        <span>
                          {log.format} ({log.width}×{log.height})
                        </span>
                        <span className="text-slate-500">
                          {new Date(log.exportedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilmstripHistory;
