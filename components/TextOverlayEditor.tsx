import React, { useState, useRef, useEffect } from 'react';
import { TextOverlay } from '../types';
import { downloadImage, generateFilename } from '../utils/download';

interface TextOverlayEditorProps {
  imageUrl: string;
  onClose: () => void;
  originalPrompt?: string;
  copyIdeas?: string[];
}

const FONT_FAMILIES = [
  'Arial Black',
  'Impact',
  'Anton',
  'Bebas Neue',
  'Roboto Condensed',
  'Oswald',
  'Montserrat',
];

const BRAND_PALETTES = [
  { name: 'SlingMods Core', colors: ['#FF4400', '#000000', '#FFFFFF'] },
  { name: 'Electric Night', colors: ['#00F0FF', '#7000FF', '#000000'] },
  { name: 'Toxic Sale', colors: ['#CCFF00', '#000000', '#FF0000'] },
  { name: 'Clean White', colors: ['#FFFFFF', '#000000', '#333333'] },
];

const TEXT_PRESETS = [
  { text: 'NEW!', fontSize: 120, color: '#FFFFFF', strokeColor: '#FF0000', strokeWidth: 8 },
  { text: 'EPIC', fontSize: 140, color: '#FFD700', strokeColor: '#000000', strokeWidth: 10 },
  { text: 'INSANE!', fontSize: 110, color: '#00FF00', strokeColor: '#000000', strokeWidth: 8 },
  { text: 'MUST WATCH', fontSize: 90, color: '#FFFFFF', strokeColor: '#FF6B00', strokeWidth: 7 },
  { text: 'EXCLUSIVE', fontSize: 100, color: '#FF00FF', strokeColor: '#000000', strokeWidth: 8 },
];

const TextOverlayEditor: React.FC<TextOverlayEditorProps> = ({
  imageUrl,
  onClose,
  originalPrompt,
  copyIdeas,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      redrawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [overlays, imageLoaded]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw all overlays
    overlays.forEach((overlay, index) => {
      ctx.save();
      ctx.translate(overlay.x, overlay.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);

      ctx.font = `bold ${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw stroke
      if (overlay.strokeWidth > 0) {
        ctx.strokeStyle = overlay.strokeColor;
        ctx.lineWidth = overlay.strokeWidth;
        ctx.strokeText(overlay.text, 0, 0);
      }

      // Draw fill
      ctx.fillStyle = overlay.color;
      ctx.fillText(overlay.text, 0, 0);

      // Draw selection box
      if (index === selectedOverlay) {
        const metrics = ctx.measureText(overlay.text);
        const width = metrics.width;
        const height = overlay.fontSize;
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(-width / 2 - 10, -height / 2 - 10, width + 20, height + 20);
      }

      ctx.restore();
    });
  };

  const addTextOverlay = (preset?: typeof TEXT_PRESETS[0]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newOverlay: TextOverlay = {
      text: preset?.text || 'NEW TEXT',
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize: preset?.fontSize || 100,
      fontFamily: 'Impact',
      color: preset?.color || '#FFFFFF',
      strokeColor: preset?.strokeColor || '#000000',
      strokeWidth: preset?.strokeWidth || 8,
      rotation: 0,
    };

    setOverlays([...overlays, newOverlay]);
    setSelectedOverlay(overlays.length);
  };

  const updateSelectedOverlay = (updates: Partial<TextOverlay>) => {
    if (selectedOverlay === null) return;

    setOverlays(
      overlays.map((overlay, index) =>
        index === selectedOverlay ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const deleteSelectedOverlay = () => {
    if (selectedOverlay === null) return;

    setOverlays(overlays.filter((_, index) => index !== selectedOverlay));
    setSelectedOverlay(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on an overlay
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      const distance = Math.sqrt(Math.pow(x - overlay.x, 2) + Math.pow(y - overlay.y, 2));
      if (distance < overlay.fontSize) {
        setSelectedOverlay(i);
        setIsDragging(true);
        return;
      }
    }

    setSelectedOverlay(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedOverlay === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    updateSelectedOverlay({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const filename = generateFilename(undefined, originalPrompt, 'jpg');
    downloadImage(dataUrl, filename);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className="max-w-full max-h-full border-2 border-slate-700 cursor-move"
        />
      </div>

      {/* Control Panel */}
      <div className="w-96 bg-slate-900 border-l border-slate-700 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Text Editor</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => addTextOverlay()}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              ➕ Add Custom Text
            </button>

            {copyIdeas && copyIdeas.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">AI Copy Ideas</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {copyIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        addTextOverlay({
                          text: idea.toUpperCase(),
                          fontSize: 96,
                          color: '#FFFFFF',
                          strokeColor: '#000000',
                          strokeWidth: 10,
                        })
                      }
                      className="w-full text-left px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 hover:border-canam-orange transition-colors"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Brand Palettes</label>
              <div className="grid grid-cols-2 gap-2">
                {BRAND_PALETTES.map((palette, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                       if (selectedOverlay !== null) {
                         updateSelectedOverlay({ color: palette.colors[0], strokeColor: palette.colors[1] });
                       } else {
                         // Add new text with this palette
                         addTextOverlay({
                           text: 'SLINGMODS',
                           fontSize: 100,
                           color: palette.colors[0],
                           strokeColor: palette.colors[1],
                           strokeWidth: 8,
                         });
                       }
                    }}
                    className="h-8 rounded-lg border border-slate-600 flex overflow-hidden hover:border-white transition-all"
                    title={palette.name}
                  >
                    <div className="h-full w-1/3" style={{ backgroundColor: palette.colors[0] }} />
                    <div className="h-full w-1/3" style={{ backgroundColor: palette.colors[1] }} />
                    <div className="h-full w-1/3" style={{ backgroundColor: palette.colors[2] }} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {TEXT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => addTextOverlay(preset)}
                    className="px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-orange-500 transition-all border border-slate-700"
                  >
                    {preset.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedOverlay !== null && overlays[selectedOverlay] && (
            <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Edit Text</h3>
                <button
                  onClick={deleteSelectedOverlay}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
                <input
                  type="text"
                  value={overlays[selectedOverlay].text}
                  onChange={(e) => updateSelectedOverlay({ text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Font Size: {overlays[selectedOverlay].fontSize}px</label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={overlays[selectedOverlay].fontSize}
                  onChange={(e) => updateSelectedOverlay({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Font Family</label>
                <select
                  value={overlays[selectedOverlay].fontFamily}
                  onChange={(e) => updateSelectedOverlay({ fontFamily: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={overlays[selectedOverlay].color}
                    onChange={(e) => updateSelectedOverlay({ color: e.target.value })}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Stroke Color</label>
                  <input
                    type="color"
                    value={overlays[selectedOverlay].strokeColor}
                    onChange={(e) => updateSelectedOverlay({ strokeColor: e.target.value })}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stroke Width: {overlays[selectedOverlay].strokeWidth}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={overlays[selectedOverlay].strokeWidth}
                  onChange={(e) => updateSelectedOverlay({ strokeWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rotation: {overlays[selectedOverlay].rotation}°</label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={overlays[selectedOverlay].rotation}
                  onChange={(e) => updateSelectedOverlay({ rotation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
          >
            💾 Download with Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextOverlayEditor;
