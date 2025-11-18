import React, { useState, useCallback, useEffect } from 'react';
import { ImageModel, GeneratedImage, VehicleType, Template } from './types';
import { generateThumbnail } from './services/geminiService';
import { saveToHistory, saveLastRide, saveLastModel, getLastRide, getLastModel } from './utils/storage';
import { downloadImage, generateFilename } from './utils/download';
import { buildModularPrompt } from './utils/promptModules';
import { SCENE_LIBRARY } from './utils/sceneLibrary';
import { useToast } from './components/ToastContainer';
import Loader from './components/Loader';
import VehicleSelector from './components/VehicleSelector';
import SmartPromptBuilder from './components/SmartPromptBuilder';
import TemplateLibrary from './components/TemplateLibrary';
import TextOverlayEditor from './components/TextOverlayEditor';
import ImageFilterEditor from './components/ImageFilterEditor';
import VideoFrameExtractor from './components/VideoFrameExtractor';
import BrandAssetLibrary from './components/BrandAssetLibrary';
import MultiFormatExport from './components/MultiFormatExport';
import BatchGenerationQueue from './components/BatchGenerationQueue';
import ABComparison from './components/ABComparison';
import ColorPaletteExtractor from './components/ColorPaletteExtractor';
import PromptModuleSelector from './components/PromptModuleSelector';
import SceneLibrarySelector from './components/SceneLibrarySelector';
import NegativePromptBuilder from './components/NegativePromptBuilder';
import ThemeSelector from './components/ThemeSelector';
import FilmstripHistory from './components/FilmstripHistory';
import ZoomControls from './components/ZoomControls';
import StickyGenerateBar from './components/StickyGenerateBar';
import CollapsibleSection from './components/CollapsibleSection';
import InteractivePromptPreview from './components/InteractivePromptPreview';

const Header: React.FC = () => (
  <header className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-canam-orange via-red-600 to-canam-orange animate-gradient opacity-20"></div>
    <div className="relative py-6 px-8">
      <div className="max-w-[2000px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-1">
          <span className="bg-gradient-to-r from-canam-orange to-electric-blue bg-clip-text text-transparent">
            SlingMods
          </span>
          <span className="text-white"> Thumbnail AI</span>
          <span className="ml-3 text-xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">PRO</span>
        </h1>
        <p className="text-sm text-slate-300 font-medium">
          Professional thumbnail generation with modular prompts & AI-powered tools
        </p>
      </div>
    </div>
  </header>
);

interface ImageDisplayProps {
  isLoading: boolean;
  generatedImages: GeneratedImage[];
  zoomLevel: number;
  onAddText: (imageUrl: string, prompt?: string) => void;
  onFilter: (imageUrl: string) => void;
  onExport: (imageUrl: string) => void;
  onExtractColors: (imageUrl: string) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  isLoading,
  generatedImages,
  zoomLevel,
  onAddText,
  onFilter,
  onExport,
  onExtractColors,
}) => {
  const scaleMultiplier = zoomLevel / 100;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6 flex items-center justify-center min-h-[600px] relative overflow-auto">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-canam-orange rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full">
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
                      onClick={() => onAddText(image.url, image.prompt)}
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
                      onClick={() => onExport(image.url)}
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

const App: React.FC = () => {
  const { showToast } = useToast();

  const [basePrompt, setBasePrompt] = useState<string>('');
  const [model, setModel] = useState<ImageModel>(ImageModel.GEMINI_FLASH_IMAGE);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [numberOfImages, setNumberOfImages] = useState<number>(2);

  // New modular prompt states
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('carbon');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modal states
  const [textEditorImage, setTextEditorImage] = useState<{ url: string; prompt?: string } | null>(null);
  const [filterEditorImage, setFilterEditorImage] = useState<string | null>(null);
  const [exportImage, setExportImage] = useState<string | null>(null);
  const [colorExtractorImage, setColorExtractorImage] = useState<string | null>(null);
  const [showVideoExtractor, setShowVideoExtractor] = useState(false);
  const [showBrandLibrary, setShowBrandLibrary] = useState(false);
  const [showBatchQueue, setShowBatchQueue] = useState(false);
  const [showABComparison, setShowABComparison] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    const lastRide = getLastRide();
    if (lastRide) {
      setSelectedVehicle(lastRide as VehicleType);
    }

    const lastModel = getLastModel();
    if (lastModel) {
      setModel(lastModel as ImageModel);
    }
  }, []);

  // Persist ride and model selections
  useEffect(() => {
    if (selectedVehicle) {
      saveLastRide(selectedVehicle);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    saveLastModel(model);
  }, [model]);

  // Build the final prompt
  const buildFinalPrompt = useCallback(() => {
    let prompt = basePrompt;

    // Add vehicle
    if (selectedVehicle) {
      prompt = `${selectedVehicle} ${prompt}`;
    }

    // Add scene
    if (selectedScene) {
      const scene = SCENE_LIBRARY.find((s) => s.id === selectedScene);
      if (scene) {
        prompt = `${prompt}, ${scene.keywords}`;
      }
    }

    // Add modules
    const { enhancedPrompt } = buildModularPrompt(prompt, activeModules);

    return enhancedPrompt;
  }, [basePrompt, selectedVehicle, selectedScene, activeModules]);

  const finalPrompt = buildFinalPrompt();
  const isGenerateDisabled = !finalPrompt.trim() || isLoading;

  const handleGenerate = useCallback(async () => {
    if (isGenerateDisabled) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const resultUrls = await generateThumbnail(finalPrompt, model, {
        aspectRatio,
        numberOfImages,
      });

      const images: GeneratedImage[] = resultUrls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        model,
        prompt: finalPrompt,
        vehicle: selectedVehicle || undefined,
        timestamp: Date.now(),
        settings: {
          aspectRatio,
          numberOfImages,
          model,
        },
      }));

      setGeneratedImages(images);

      // Save to history (async with error handling)
      for (const img of images) {
        try {
          await saveToHistory(img);
        } catch (historyError) {
          console.warn('Failed to save to history:', historyError);
          showToast(
            historyError instanceof Error ? historyError.message : 'Failed to save to history',
            'warning'
          );
        }
      }

      showToast(`Generated ${images.length} thumbnail${images.length > 1 ? 's' : ''} successfully!`, 'success', 3000);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [finalPrompt, model, aspectRatio, numberOfImages, selectedVehicle, isGenerateDisabled]);

  const handleLoadTemplate = useCallback((template: Template) => {
    setBasePrompt(template.prompt);
    setModel(template.model);
    setSelectedVehicle(template.vehicle || null);
    setAspectRatio(template.settings.aspectRatio);
    setNumberOfImages(template.settings.numberOfImages);
  }, []);

  const handleVideoFrameSelect = useCallback((frameDataUrl: string) => {
    setShowVideoExtractor(false);
    setFilterEditorImage(frameDataUrl);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 pb-32">
      <Header />

      <main className="max-w-[2000px] mx-auto px-6 py-6">
        {/* True 2-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN - Input & Controls */}
          <div className="col-span-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Vehicle Selection */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <VehicleSelector
                selectedVehicle={selectedVehicle}
                onSelectVehicle={setSelectedVehicle}
              />
            </div>

            {/* Base Prompt Builder */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <SmartPromptBuilder
                vehicle={selectedVehicle}
                onPromptChange={setBasePrompt}
                initialPrompt={basePrompt}
              />
            </div>

            {/* Prompt Modules */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <PromptModuleSelector
                activeModules={activeModules}
                onModulesChange={setActiveModules}
              />
            </div>

            {/* Scene Library */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <SceneLibrarySelector
                selectedScene={selectedScene}
                onSceneSelect={setSelectedScene}
              />
            </div>

            {/* Negative Prompts */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <NegativePromptBuilder
                selectedNegatives={selectedNegatives}
                onNegativesChange={setSelectedNegatives}
              />
            </div>

            {/* Generation Settings */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Generation Settings
              </h3>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-2">
                  AI Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value as ImageModel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange focus:border-transparent text-sm"
                >
                  <option value={ImageModel.GEMINI_FLASH_IMAGE}>⚡ Gemini Flash (Fast)</option>
                  <option value={ImageModel.IMAGEN}>🎨 Imagen 4.0 (Text-to-Image)</option>
                </select>
              </div>

              {model === ImageModel.IMAGEN && (
                <>
                  <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-2">
                      Aspect Ratio
                    </label>
                    <select
                      id="aspectRatio"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange text-sm"
                    >
                      <option value="16:9">📺 16:9 (YouTube Standard)</option>
                      <option value="1:1">⬛ 1:1 (Square)</option>
                      <option value="9:16">📱 9:16 (Vertical)</option>
                      <option value="4:3">🖼️ 4:3 (Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Images: <span className="text-canam-orange font-bold">{numberOfImages}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={numberOfImages}
                      onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-canam-orange"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Selector */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
            </div>

            {/* Template Library */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <TemplateLibrary
                onLoadTemplate={handleLoadTemplate}
                currentPrompt={basePrompt}
                currentModel={model}
                currentSettings={{ aspectRatio, numberOfImages, model }}
                currentVehicle={selectedVehicle}
              />
            </div>

            {/* Pro Tools */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Pro Tools
              </h3>

              <button
                onClick={() => setShowVideoExtractor(true)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-sm"
              >
                📹 Video Frame Extractor
              </button>

              <button
                onClick={() => setShowBrandLibrary(true)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-sm"
              >
                🎨 Brand Asset Library
              </button>

              <button
                onClick={() => setShowBatchQueue(true)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg text-sm"
              >
                ⚡ Batch Generation Queue
              </button>

              {generatedImages.length >= 2 && (
                <button
                  onClick={() => setShowABComparison(true)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg text-sm"
                >
                  ⚔️ A/B Comparison
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Output & Preview */}
          <div className="col-span-7 space-y-4">
            {/* Interactive Prompt Preview */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <InteractivePromptPreview
                basePrompt={basePrompt}
                activeModules={activeModules}
                selectedScene={selectedScene}
                selectedNegatives={selectedNegatives}
                vehicle={selectedVehicle}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/30 border-2 border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                <p className="font-bold">⚠️ Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Zoom Controls (only show when images exist) */}
            {generatedImages.length > 0 && (
              <div className="flex justify-end">
                <ZoomControls zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />
              </div>
            )}

            {/* Image Display */}
            <ImageDisplay
              isLoading={isLoading}
              generatedImages={generatedImages}
              zoomLevel={zoomLevel}
              onAddText={(url, promptText) => setTextEditorImage({ url, prompt: promptText })}
              onFilter={setFilterEditorImage}
              onExport={setExportImage}
              onExtractColors={setColorExtractorImage}
            />

            {/* Filmstrip History */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <FilmstripHistory onImageSelect={setFilterEditorImage} />
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Generate Bar */}
      <StickyGenerateBar
        prompt={finalPrompt}
        isLoading={isLoading}
        isDisabled={isGenerateDisabled}
        onGenerate={handleGenerate}
        activeModulesCount={activeModules.length}
        selectedScene={selectedScene}
        selectedNegativesCount={selectedNegatives.length}
      />

      {/* Modals */}
      {textEditorImage && (
        <TextOverlayEditor
          imageUrl={textEditorImage.url}
          originalPrompt={textEditorImage.prompt}
          onClose={() => setTextEditorImage(null)}
        />
      )}

      {filterEditorImage && (
        <ImageFilterEditor
          imageUrl={filterEditorImage}
          onClose={() => setFilterEditorImage(null)}
        />
      )}

      {exportImage && (
        <MultiFormatExport
          imageUrl={exportImage}
          onClose={() => setExportImage(null)}
          imageName="thumbnail"
        />
      )}

      {colorExtractorImage && (
        <ColorPaletteExtractor
          imageUrl={colorExtractorImage}
          onClose={() => setColorExtractorImage(null)}
        />
      )}

      {showVideoExtractor && (
        <VideoFrameExtractor
          onFrameSelect={handleVideoFrameSelect}
          onClose={() => setShowVideoExtractor(false)}
        />
      )}

      {showBrandLibrary && (
        <BrandAssetLibrary
          isOpen={showBrandLibrary}
          onClose={() => setShowBrandLibrary(false)}
        />
      )}

      {showBatchQueue && (
        <BatchGenerationQueue
          isOpen={showBatchQueue}
          onClose={() => setShowBatchQueue(false)}
          defaultSettings={{ aspectRatio, numberOfImages, model }}
        />
      )}

      {showABComparison && (
        <ABComparison
          images={generatedImages}
          onClose={() => setShowABComparison(false)}
        />
      )}
    </div>
  );
};

export default App;
