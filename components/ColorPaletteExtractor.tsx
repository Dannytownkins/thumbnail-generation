import React, { useState, useEffect } from 'react';
import { extractColorsFromImage, ColorInfo, getContrastColor, copyToClipboard } from '../utils/colorExtractor';

interface ColorPaletteExtractorProps {
  imageUrl: string;
  onClose: () => void;
  onSelectColor?: (hex: string) => void;
}

const ColorPaletteExtractor: React.FC<ColorPaletteExtractorProps> = ({
  imageUrl,
  onClose,
  onSelectColor,
}) => {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [isExtracting, setIsExtracting] = useState(true);
  const [numColors, setNumColors] = useState(6);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  useEffect(() => {
    extractPalette();
  }, [imageUrl, numColors]);

  const extractPalette = async () => {
    setIsExtracting(true);
    try {
      const palette = await extractColorsFromImage(imageUrl, numColors);
      setColors(palette);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyColor = async (hex: string) => {
    await copyToClipboard(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🎨 Color Palette Extractor</h2>
              <p className="text-slate-400">Extract dominant colors from your thumbnail</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Source Image</h3>
              <img
                src={imageUrl}
                alt="Source"
                className="w-full rounded-lg border border-slate-700"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Colors: {numColors}
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={numColors}
                  onChange={(e) => setNumColors(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-canam-orange"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Extracted Palette</h3>

              {isExtracting ? (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-canam-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Analyzing colors...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {colors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      color={color}
                      index={index}
                      isCopied={copiedColor === color.hex}
                      onCopy={handleCopyColor}
                      onSelect={onSelectColor}
                    />
                  ))}
                </div>
              )}

              {colors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">All Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => handleCopyColor(color.hex)}
                        className="w-12 h-12 rounded-lg border-2 border-slate-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">💡 Pro Tip</h4>
                  <p className="text-xs text-slate-400">
                    Use these colors in your text overlays to create cohesive, professional-looking
                    thumbnails that match your content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ColorSwatchProps {
  color: ColorInfo;
  index: number;
  isCopied: boolean;
  onCopy: (hex: string) => void;
  onSelect?: (hex: string) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, index, isCopied, onCopy, onSelect }) => {
  const textColor = getContrastColor(color.hex);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex">
      {/* Color Preview */}
      <div
        className="w-24 flex-shrink-0 flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: color.hex,
          color: textColor,
        }}
      >
        #{index + 1}
      </div>

      {/* Color Info */}
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-sm text-white">{color.hex}</span>
          <span className="text-xs text-slate-400">{color.percentage.toFixed(1)}%</span>
        </div>
        <div className="text-xs text-slate-500">
          RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col border-l border-slate-700">
        <button
          onClick={() => onCopy(color.hex)}
          className="flex-1 px-4 hover:bg-slate-700 transition-colors flex items-center justify-center"
          title="Copy hex code"
        >
          {isCopied ? (
            <span className="text-green-400">✓</span>
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
        {onSelect && (
          <button
            onClick={() => onSelect(color.hex)}
            className="flex-1 px-4 border-t border-slate-700 hover:bg-electric-blue hover:text-white transition-colors flex items-center justify-center"
            title="Use this color"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteExtractor;
