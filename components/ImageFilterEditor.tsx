import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFilters } from '../types';
import { downloadImage, generateFilename } from '../utils/download';

interface ImageFilterEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (filteredImageUrl: string) => void;
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sharpen: 0,
  hue: 0,
};

const FILTER_PRESETS = {
  'Vibrant': { brightness: 110, contrast: 120, saturation: 130, blur: 0, sharpen: 0, hue: 0 },
  'Dramatic': { brightness: 95, contrast: 140, saturation: 110, blur: 0, sharpen: 0, hue: 0 },
  'Soft': { brightness: 105, contrast: 90, saturation: 90, blur: 1, sharpen: 0, hue: 0 },
  'B&W': { brightness: 100, contrast: 110, saturation: 0, blur: 0, sharpen: 0, hue: 0 },
  'Sunset': { brightness: 105, contrast: 105, saturation: 120, blur: 0, sharpen: 0, hue: 15 },
  'Cool': { brightness: 100, contrast: 105, saturation: 110, blur: 0, sharpen: 0, hue: -15 },
};

const ImageFilterEditor: React.FC<ImageFilterEditorProps> = ({ imageUrl, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [history, setHistory] = useState<ImageFilters[]>([DEFAULT_FILTERS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      applyFilters(DEFAULT_FILTERS);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const applyFilters = useCallback((filterValues: ImageFilters) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Apply CSS filters
    ctx.filter = `
      brightness(${filterValues.brightness}%)
      contrast(${filterValues.contrast}%)
      saturate(${filterValues.saturation}%)
      blur(${filterValues.blur}px)
      hue-rotate(${filterValues.hue}deg)
    `;

    ctx.drawImage(img, 0, 0);

    // Reset filter for any additional operations
    ctx.filter = 'none';
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      applyFilters(filters);
    }
  }, [filters, imageLoaded, applyFilters]);

  const updateFilter = (key: keyof ImageFilters, value: number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newFilters);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const applyPreset = (presetName: keyof typeof FILTER_PRESETS) => {
    const preset = FILTER_PRESETS[presetName];
    setFilters(preset);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(preset);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFilters(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFilters(history[historyIndex + 1]);
    }
  };

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    setHistory([DEFAULT_FILTERS]);
    setHistoryIndex(0);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    downloadImage(dataUrl, generateFilename(undefined, 'filtered'));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onSave(dataUrl);
    onClose();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="relative max-w-full max-h-full group">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full border-2 border-slate-700 rounded-lg shadow-2xl"
          />
          
          {/* Comparison Toggle */}
          <button
            onMouseDown={() => {
                setShowComparison(true);
                applyFilters(DEFAULT_FILTERS); // Show original
            }}
            onMouseUp={() => {
                setShowComparison(false);
                applyFilters(filters); // Restore filters
            }}
            onMouseLeave={() => {
                if (showComparison) {
                    setShowComparison(false);
                    applyFilters(filters);
                }
            }}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-bold text-sm select-none"
          >
            👁️ Hold to Compare
          </button>

          {showComparison && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-xs font-bold border border-white/20">
                ORIGINAL
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-96 bg-slate-900 border-l border-slate-700 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Image Filters</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ↷ Redo
            </button>
            <button
              onClick={reset}
              className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            >
              Reset
            </button>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(FILTER_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => applyPreset(presetName as keyof typeof FILTER_PRESETS)}
                  className="px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-canam-orange transition-all"
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="space-y-4">
            <FilterSlider
              label="Brightness"
              value={filters.brightness}
              onChange={(val) => updateFilter('brightness', val)}
              min={0}
              max={200}
              default={100}
              unit="%"
            />
            <FilterSlider
              label="Contrast"
              value={filters.contrast}
              onChange={(val) => updateFilter('contrast', val)}
              min={0}
              max={200}
              default={100}
              unit="%"
            />
            <FilterSlider
              label="Saturation"
              value={filters.saturation}
              onChange={(val) => updateFilter('saturation', val)}
              min={0}
              max={200}
              default={100}
              unit="%"
            />
            <FilterSlider
              label="Hue Shift"
              value={filters.hue}
              onChange={(val) => updateFilter('hue', val)}
              min={-180}
              max={180}
              default={0}
              unit="°"
            />
            <FilterSlider
              label="Blur"
              value={filters.blur}
              onChange={(val) => updateFilter('blur', val)}
              min={0}
              max={10}
              default={0}
              unit="px"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full px-4 py-3 bg-gradient-to-r from-electric-blue to-cyan-600 text-white font-bold rounded-lg hover:from-electric-blue hover:to-cyan-700 transition-all shadow-lg"
            >
              💾 Download Filtered Image
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="w-full px-4 py-3 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold rounded-lg hover:from-canam-orange hover:to-red-700 transition-all shadow-lg"
              >
                ✓ Save & Close
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 text-center">
            Tip: Use Ctrl+Z to undo, Ctrl+Shift+Z to redo
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  default: number;
  unit: string;
}

const FilterSlider: React.FC<FilterSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  default: defaultValue,
  unit,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-canam-orange font-bold">
            {value}
            {unit}
          </span>
          <button
            onClick={() => onChange(defaultValue)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-canam-orange"
      />
    </div>
  );
};

export default ImageFilterEditor;
