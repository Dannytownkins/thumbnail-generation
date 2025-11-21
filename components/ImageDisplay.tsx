import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { downloadImage, generateFilename } from '../utils/download';
import Loader from './Loader';

interface ImageDisplayProps {
  isLoading: boolean;
  generatedImages: GeneratedImage[];
  zoomLevel: number;
  onAddText: (imageUrl: string, prompt?: string, copyIdeas?: string[]) => void;
  onFilter: (imageUrl: string) => void;
  onExport: (image: GeneratedImage) => void;
  onExtractColors: (imageUrl: string) => void;
  onUpdateNote: (imageId: string, note: string) => void;
  onReferenceDrop: (file: File) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  isLoading,
  generatedImages,
  zoomLevel,
  onAddText,
  onFilter,
  onExport,
  onExtractColors,
  onUpdateNote,
  onReferenceDrop,
}) => {
  const scaleMultiplier = zoomLevel / 100;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>('');

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onReferenceDrop(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const startEditing = (image: GeneratedImage) => {
    setEditingId(image.id);
    setDraft(image.note ?? '');
  };

  const saveNote = (imageId: string) => {
    onUpdateNote(imageId, draft.trim());
    setEditingId(null);
    setDraft('');
  };

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6 flex items-center justify-center min-h-[600px] relative overflow-auto"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-canam-orange rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute top-6 right-6 text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700">
        📎 Drag & drop a reference image to pair it with the next run
      </div>

      <div className="relative z-10 w-full mt-6">
        {isLoading ? (
          <Loader />
        ) : generatedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full" style={{ transform: `scale(${scaleMultiplier})`, transformOrigin: 'top center' }}>
            {generatedImages.map((image) => (
              <div key={image.id} className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-canam-orange transition-all shadow-2xl hover:shadow-canam-orange/20">
                <img
                  src={image.url}
                  alt={`Generated Thumbnail ${image.id}`}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => {
                        const filename = generateFilename(image.vehicle, image.prompt);
                        downloadImage(image.url, filename);
                      }}
                      className="bg-gradient-to-r from-electric-blue to-cyan-600 text-white font-bold py-2 px-3 rounded-lg hover:from-electric-blue hover:to-cyan-700 transition-all shadow-lg text-sm"
                    >
                      💾 Download
                    </button>
                    <button
                      onClick={() => onAddText(image.url, image.prompt, image.copyIdeas)}
                      className="bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold py-2 px-3 rounded-lg hover:from-canam-orange hover:to-red-700 transition-all shadow-lg text-sm"
                    >
                      ✏️ Add Text
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onFilter(image.url)}
                      className="bg-slate-700 text-white font-medium py-1.5 px-2 rounded hover:bg-purple-600 transition-all text-xs"
                    >
                      🎨 Filters
                    </button>
                    <button
                      onClick={() => onExport(image)}
                      className="bg-slate-700 text-white font-medium py-1.5 px-2 rounded hover:bg-green-600 transition-all text-xs"
                    >
                      📱 Export
                    </button>
                    <button
                      onClick={() => onExtractColors(image.url)}
                      className="bg-slate-700 text-white font-medium py-1.5 px-2 rounded hover:bg-pink-600 transition-all text-xs"
                    >
                      🎨 Colors
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/70 backdrop-blur-sm border-t border-slate-700 p-3">
                  {editingId === image.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange"
                        placeholder="Add quick notes about this thumbnail"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDraft('');
                          }}
                          className="px-3 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveNote(image.id)}
                          className="px-3 py-1 rounded bg-canam-orange text-white font-semibold hover:opacity-90"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(image)}
                      className="w-full text-left text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span>📝</span>
                      <span>{image.note?.length ? image.note : 'Add inline notes for future reference'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <div className="inline-block p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-24 w-24 mb-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Create</h3>
              <p className="text-slate-400">Your masterpiece will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
