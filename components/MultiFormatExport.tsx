import React, { useState, useRef, useEffect } from 'react';
import { ExportFormat } from '../types';
import { downloadMultipleImages } from '../utils/download';

const EXPORT_FORMATS: ExportFormat[] = [
  { name: 'YouTube Thumbnail', width: 1280, height: 720, platform: 'YouTube' },
  { name: 'YouTube Banner', width: 2560, height: 1440, platform: 'YouTube' },
  { name: 'Instagram Post', width: 1080, height: 1080, platform: 'Instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, platform: 'Instagram' },
  { name: 'Instagram Reel', width: 1080, height: 1920, platform: 'Instagram' },
  { name: 'TikTok', width: 1080, height: 1920, platform: 'TikTok' },
  { name: 'Facebook Post', width: 1200, height: 630, platform: 'Facebook' },
  { name: 'Facebook Cover', width: 820, height: 312, platform: 'Facebook' },
  { name: 'Twitter Post', width: 1200, height: 675, platform: 'Twitter' },
  { name: 'Twitter Header', width: 1500, height: 500, platform: 'Twitter' },
  { name: 'LinkedIn Post', width: 1200, height: 627, platform: 'LinkedIn' },
  { name: 'Pinterest Pin', width: 1000, height: 1500, platform: 'Pinterest' },
];

// New quick presets for one-click actions
const QUICK_PRESETS = {
  'Social Bundle': ['Instagram Post', 'Instagram Story', 'Facebook Post'],
  'YouTube Kit': ['YouTube Thumbnail', 'YouTube Banner', 'Twitter Post'],
  'Ad Campaign': ['Facebook Post', 'Instagram Story', 'LinkedIn Post'],
};

interface MultiFormatExportProps {
  imageUrl: string;
  onClose: () => void;
  imageName?: string;
}

const MultiFormatExport: React.FC<MultiFormatExportProps> = ({ imageUrl, onClose, imageName = 'export' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<Set<number>>(new Set([0])); // YouTube Thumbnail selected by default
  const [cropMode, setCropMode] = useState<'fill' | 'fit' | 'center'>('center');
  const [quality, setQuality] = useState(95);
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      generatePreviews();
    }
  }, [imageLoaded, selectedFormats, cropMode]);

  const generatePreviews = () => {
    const newPreviews: { [key: number]: string } = {};
    selectedFormats.forEach((index) => {
      const format = EXPORT_FORMATS[index];
      const dataUrl = renderToFormat(format);
      if (dataUrl) {
        newPreviews[index] = dataUrl;
      }
    });
    setPreviews(newPreviews);
  };

  const renderToFormat = (format: ExportFormat): string | null => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = format.width;
    canvas.height = format.height;

    const imgAspect = img.width / img.height;
    const formatAspect = format.width / format.height;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    let dx = 0, dy = 0, dw = format.width, dh = format.height;

    if (cropMode === 'fill') {
      // Fill entire canvas, crop if needed
      if (imgAspect > formatAspect) {
        // Image is wider
        sw = img.height * formatAspect;
        sx = (img.width - sw) / 2;
      } else {
        // Image is taller
        sh = img.width / formatAspect;
        sy = (img.height - sh) / 2;
      }
    } else if (cropMode === 'fit') {
      // Fit entire image, may have bars
      if (imgAspect > formatAspect) {
        // Image is wider
        dh = format.width / imgAspect;
        dy = (format.height - dh) / 2;
      } else {
        // Image is taller
        dw = format.height * imgAspect;
        dx = (format.width - dw) / 2;
      }
      // Fill background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, format.width, format.height);
    } else {
      // center - smart crop keeping center
      if (imgAspect > formatAspect) {
        sw = img.height * formatAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / formatAspect;
        sy = (img.height - sh) / 2;
      }
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return canvas.toDataURL('image/jpeg', quality / 100);
  };

  const toggleFormat = (index: number) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFormats(newSelected);
  };

  const selectAllByPlatform = (platform: string) => {
    const indices = EXPORT_FORMATS
      .map((f, i) => (f.platform === platform ? i : -1))
      .filter((i) => i !== -1);
    const newSelected = new Set(selectedFormats);
    indices.forEach((i) => newSelected.add(i));
    setSelectedFormats(newSelected);
  };

  const handleExportAll = () => {
    const exports = Array.from(selectedFormats).map((index) => {
      const format = EXPORT_FORMATS[index];
      const dataUrl = renderToFormat(format);
      return {
        url: dataUrl || '',
        name: `${imageName}_${format.platform}_${format.name.replace(/\s+/g, '_')}.jpg`,
      };
    }).filter((e) => e.url);

    downloadMultipleImages(exports);
  };

  const groupedFormats = EXPORT_FORMATS.reduce((acc, format, index) => {
    if (!acc[format.platform]) {
      acc[format.platform] = [];
    }
    acc[format.platform].push({ ...format, index });
    return acc;
  }, {} as { [key: string]: (ExportFormat & { index: number })[] });

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">📱 Multi-Format Export</h2>
            <p className="text-slate-400">Export your thumbnail to multiple social media formats</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            Close
          </button>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Format Selection */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Select Formats ({selectedFormats.size})</h3>

            <div className="space-y-4">
              {Object.entries(groupedFormats).map(([platform, formats]) => (
                <div key={platform} className="border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{platform}</h4>
                    <button
                      onClick={() => selectAllByPlatform(platform)}
                      className="text-xs text-electric-blue hover:text-cyan-400 transition-colors"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formats.map((format) => (
                      <label
                        key={format.index}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                          selectedFormats.has(format.index)
                            ? 'bg-canam-orange/20 border border-canam-orange'
                            : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormats.has(format.index)}
                          onChange={() => toggleFormat(format.index)}
                          className="w-4 h-4 accent-canam-orange"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{format.name}</div>
                          <div className="text-xs text-slate-400">
                            {format.width} × {format.height}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview & Settings */}
          <div className="col-span-8 flex flex-col">
            {/* Settings */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-4">
              <h4 className="text-sm font-semibold text-white mb-3">⚡ Quick Bundles</h4>
              <div className="flex gap-3">
                {Object.entries(QUICK_PRESETS).map(([name, formatNames]) => (
                  <button
                    key={name}
                    onClick={() => {
                       const indices = formatNames.map(name => EXPORT_FORMATS.findIndex(f => f.name === name)).filter(i => i !== -1);
                       setSelectedFormats(new Set(indices));
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Crop Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setCropMode('fill')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        cropMode === 'fill'
                          ? 'bg-canam-orange text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Fill
                    </button>
                    <button
                      onClick={() => setCropMode('center')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        cropMode === 'center'
                          ? 'bg-canam-orange text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => setCropMode('fit')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        cropMode === 'fit'
                          ? 'bg-canam-orange text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Fit
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-canam-orange"
                  />
                </div>
              </div>
            </div>

            {/* Previews */}
            <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 p-6 overflow-y-auto">
              {selectedFormats.size === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <p className="text-lg font-medium">No formats selected</p>
                    <p className="text-sm mt-1">Select at least one format to preview</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from(selectedFormats).map((index) => {
                    const format = EXPORT_FORMATS[index];
                    const preview = previews[index];
                    return (
                      <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <div className="aspect-video bg-slate-950 flex items-center justify-center p-4">
                          {preview ? (
                            <img
                              src={preview}
                              alt={format.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-slate-600">Loading...</div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="font-medium text-white text-sm">{format.name}</div>
                          <div className="text-xs text-slate-400">
                            {format.width} × {format.height}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportAll}
              disabled={selectedFormats.size === 0}
              className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold text-lg rounded-lg hover:from-canam-orange hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              💾 Export {selectedFormats.size} Format{selectedFormats.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MultiFormatExport;
