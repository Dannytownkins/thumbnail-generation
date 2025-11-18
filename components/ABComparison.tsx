import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { downloadImage, generateFilename } from '../utils/download';

interface ABComparisonProps {
  images: GeneratedImage[];
  onClose: () => void;
}

const ABComparison: React.FC<ABComparisonProps> = ({ images, onClose }) => {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sidebyside' | 'slider' | 'grid'>('sidebyside');
  const [sliderPosition, setSliderPosition] = useState(50);

  if (images.length < 2) {
    return null;
  }

  const handleMarkWinner = (imageId: string) => {
    setSelectedWinner(imageId);
    // Could save this to analytics/history
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">⚔️ A/B Comparison</h2>
              <p className="text-slate-400">Compare thumbnails side-by-side to pick the winner</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('sidebyside')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'sidebyside'
                  ? 'bg-canam-orange text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'slider'
                  ? 'bg-canam-orange text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Slider Compare
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-canam-orange text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'sidebyside' && (
            <div className="grid grid-cols-2 gap-6">
              {images.slice(0, 2).map((image) => (
                <ComparisonCard
                  key={image.id}
                  image={image}
                  isWinner={selectedWinner === image.id}
                  onMarkWinner={handleMarkWinner}
                />
              ))}
            </div>
          )}

          {viewMode === 'slider' && images.length >= 2 && (
            <div className="relative max-w-4xl mx-auto">
              <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-slate-700">
                {/* Image A */}
                <img
                  src={images[0].url}
                  alt="Option A"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Image B with clip */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={images[1].url}
                    alt="Option B"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Slider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Interactive overlay */}
                <div
                  className="absolute inset-0 cursor-ew-resize"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
                  }}
                  onTouchMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.touches[0].clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
                  }}
                />

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Option A
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Option B
                </div>
              </div>

              {/* Slider Info */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <ComparisonCard
                  image={images[0]}
                  isWinner={selectedWinner === images[0].id}
                  onMarkWinner={handleMarkWinner}
                  compact
                />
                <ComparisonCard
                  image={images[1]}
                  isWinner={selectedWinner === images[1].id}
                  onMarkWinner={handleMarkWinner}
                  compact
                />
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <ComparisonCard
                  key={image.id}
                  image={image}
                  isWinner={selectedWinner === image.id}
                  onMarkWinner={handleMarkWinner}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winner Summary */}
      {selectedWinner && (
        <div className="p-6 border-t border-slate-700 bg-slate-900">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <p className="text-lg font-bold text-white">
                🏆 Winner selected! This choice has been noted.
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Use this winning style for future thumbnails
              </p>
            </div>
            <button
              onClick={() => setSelectedWinner(null)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ComparisonCardProps {
  image: GeneratedImage;
  isWinner: boolean;
  onMarkWinner: (imageId: string) => void;
  compact?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ image, isWinner, onMarkWinner, compact }) => {
  return (
    <div
      className={`relative bg-slate-800 rounded-xl border-2 overflow-hidden transition-all ${
        isWinner ? 'border-green-500 ring-4 ring-green-500/30' : 'border-slate-700'
      }`}
    >
      {!compact && (
        <img src={image.url} alt="Comparison option" className="w-full aspect-video object-cover" />
      )}

      <div className="p-4">
        {compact && (
          <img
            src={image.url}
            alt="Comparison option"
            className="w-full aspect-video object-cover rounded-lg mb-3"
          />
        )}

        {image.prompt && (
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">{image.prompt}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onMarkWinner(image.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              isWinner
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-white hover:bg-green-500/20 hover:text-green-400'
            }`}
          >
            {isWinner ? '✓ Winner' : 'Pick This'}
          </button>
          <button
            onClick={() => downloadImage(image.url, generateFilename(image.vehicle, image.prompt))}
            className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-cyan-600 transition-all"
          >
            💾
          </button>
        </div>

        {image.vehicle && (
          <div className="mt-2 text-xs text-slate-500">
            <span className="bg-slate-700 px-2 py-1 rounded">{image.vehicle}</span>
          </div>
        )}
      </div>

      {isWinner && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg font-bold shadow-lg">
          🏆 Winner
        </div>
      )}
    </div>
  );
};

export default ABComparison;
