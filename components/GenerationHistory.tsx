import React, { useState, useEffect } from 'react';
import { GeneratedImage, VehicleType } from '../types';
import { getHistory, clearHistory, deleteFromHistory } from '../utils/storage';
import { downloadImage, downloadMultipleImages, generateFilename } from '../utils/download';

interface GenerationHistoryProps {
  onLoadPrompt?: (prompt: string) => void;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ onLoadPrompt }) => {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState<VehicleType | 'all'>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadHistory();
    const handler = () => loadHistory();
    window.addEventListener('history:refresh', handler);
    return () => window.removeEventListener('history:refresh', handler);
  }, []);

  const loadHistory = async () => {
    setHistory(await getHistory());
  };

  const handleClearHistory = async () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      await clearHistory();
      await loadHistory();
      setSelectedImages(new Set());
    }
  };

  const handleDeleteImage = async (id: string) => {
    await deleteFromHistory(id);
    await loadHistory();
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDownloadSelected = () => {
    const imagesToDownload = history
      .filter((img) => selectedImages.has(img.id))
      .map((img) => ({
        url: img.url,
        name: generateFilename(img.vehicle, img.prompt),
      }));

    downloadMultipleImages(imagesToDownload);
  };

  const filteredHistory = history.filter((img) => {
    if (filterVehicle === 'all') return true;
    return img.vehicle === filterVehicle;
  });

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
      >
        🖼️ {isOpen ? 'Hide' : 'Show'} Generation History ({history.length})
      </button>

      {isOpen && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value as VehicleType | 'all')}
              className="flex-1 min-w-[150px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Vehicles</option>
              {Object.values(VehicleType).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {selectedImages.size > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="px-4 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-all"
              >
                Download Selected ({selectedImages.size})
              </button>
            )}

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500 hover:text-white transition-all"
              >
                Clear All
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No images in history</p>
              <p className="text-sm mt-1">Generated images will appear here</p>
            </div>
          ) : (
            <div className={`max-h-[600px] overflow-y-auto ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
              {filteredHistory.map((image) => (
                <HistoryImageCard
                  key={image.id}
                  image={image}
                  isSelected={selectedImages.has(image.id)}
                  onToggleSelect={handleToggleSelect}
                  onDelete={handleDeleteImage}
                  onLoadPrompt={onLoadPrompt}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface HistoryImageCardProps {
  image: GeneratedImage;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadPrompt?: (prompt: string) => void;
  viewMode: 'grid' | 'list';
}

const HistoryImageCard: React.FC<HistoryImageCardProps> = ({
  image,
  isSelected,
  onToggleSelect,
  onDelete,
  onLoadPrompt,
  viewMode,
}) => {
  const handleDownload = () => {
    const filename = generateFilename(image.vehicle, image.prompt);
    downloadImage(image.url, filename);
  };

  const formattedDate = image.timestamp
    ? new Date(image.timestamp).toLocaleString()
    : 'Unknown date';

  if (viewMode === 'list') {
    return (
      <div className={`bg-slate-900 border rounded-lg p-3 flex gap-3 transition-all ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-slate-700 hover:border-purple-500/50'}`}>
        <div className="relative flex-shrink-0">
          <img src={image.url} alt="Generated" className="w-24 h-24 object-cover rounded" />
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(image.id)}
            className="absolute top-1 left-1 w-5 h-5 rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1">{formattedDate}</p>
          {image.prompt && (
            <p className="text-sm text-slate-300 line-clamp-2 mb-2">{image.prompt}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {image.vehicle && (
              <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                {image.vehicle}
              </span>
            )}
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
              {image.model.includes('imagen') ? 'Imagen' : 'Gemini'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={handleDownload} className="px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600">DL</button>
          {image.prompt && onLoadPrompt && (
            <button onClick={() => onLoadPrompt(image.prompt!)} className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600">Load</button>
          )}
          <button onClick={() => onDelete(image.id)} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500 hover:text-white">Del</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group bg-slate-900 border rounded-lg overflow-hidden transition-all ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-slate-700 hover:border-purple-500/50'}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(image.id)}
        className="absolute top-2 left-2 w-5 h-5 z-10 rounded"
      />
      <img src={image.url} alt="Generated" className="w-full aspect-video object-cover" />
      <div className="p-2">
        <p className="text-xs text-slate-400 mb-1">{formattedDate}</p>
        {image.prompt && (
          <p className="text-xs text-slate-300 line-clamp-2 mb-2">{image.prompt}</p>
        )}
        <div className="flex gap-1">
          <button onClick={handleDownload} className="flex-1 px-2 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 transition-all">Download</button>
          {image.prompt && onLoadPrompt && (
            <button onClick={() => onLoadPrompt(image.prompt!)} className="flex-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-all">Load</button>
          )}
          <button onClick={() => onDelete(image.id)} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500 hover:text-white transition-all">×</button>
        </div>
      </div>
    </div>
  );
};

export default GenerationHistory;
