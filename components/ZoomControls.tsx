import React from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomChange }) => {
  const zoomLevels = [25, 50, 100, 200];

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      onZoomChange(zoomLevels[currentIndex - 1]);
    }
  };

  const handleFitToScreen = () => {
    onZoomChange(100);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        disabled={zoomLevel === zoomLevels[0]}
        className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Zoom Out"
      >
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>

      {/* Zoom Level Selector */}
      <div className="flex gap-1">
        {zoomLevels.map((level) => (
          <button
            key={level}
            onClick={() => onZoomChange(level)}
            className={`px-2 py-1 text-xs font-medium rounded transition-all ${
              zoomLevel === level
                ? 'bg-canam-orange text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {level}%
          </button>
        ))}
      </div>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        disabled={zoomLevel === zoomLevels[zoomLevels.length - 1]}
        className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Zoom In"
      >
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-600"></div>

      {/* Fit to Screen */}
      <button
        onClick={handleFitToScreen}
        className="px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded transition-colors"
        title="Fit to Screen (100%)"
      >
        Fit
      </button>

      {/* Actual Zoom Level Display */}
      <div className="px-2 py-1 bg-slate-900 rounded text-xs font-mono text-slate-300 min-w-[50px] text-center">
        {zoomLevel}%
      </div>
    </div>
  );
};

export default ZoomControls;
