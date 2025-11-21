import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { ImageModel, GeneratedImage, VehicleType, Template, StylePreset } from './types';
import { generateThumbnail, generateCopySuggestions } from './services/geminiService';
import { saveManyToHistory } from './utils/storage';
import { buildModularPrompt } from './utils/promptModules';
import { SCENE_LIBRARY } from './utils/sceneLibrary';
import Loader from './components/Loader';
import VehicleSelector from './components/VehicleSelector';
import SmartPromptBuilder from './components/SmartPromptBuilder';
import TemplateLibrary from './components/TemplateLibrary';
import TextOverlayEditor from './components/TextOverlayEditor';
import ImageFilterEditor from './components/ImageFilterEditor';
import MultiFormatExport from './components/MultiFormatExport';
import ColorPaletteExtractor from './components/ColorPaletteExtractor';
import PromptModuleSelector from './components/PromptModuleSelector';
import SceneLibrarySelector from './components/SceneLibrarySelector';
import NegativePromptBuilder from './components/NegativePromptBuilder';
import FilmstripHistory from './components/FilmstripHistory';
import ZoomControls from './components/ZoomControls';
import StickyGenerateBar from './components/StickyGenerateBar';
import InteractivePromptPreview from './components/InteractivePromptPreview';
import SessionTimeline from './components/SessionTimeline';
import ImageDisplay from './components/ImageDisplay';
import { useAppStore } from './store/useAppStore';
import { computeCacheKey } from './utils/cacheKey';
import { getImagesByCacheKey, updateHistoryImage } from './utils/historyStore';

const LazyVideoFrameExtractor = React.lazy(() => import('./components/VideoFrameExtractor'));
const LazyBrandAssetLibrary = React.lazy(() => import('./components/BrandAssetLibrary'));
const LazyBatchGenerationQueue = React.lazy(() => import('./components/BatchGenerationQueue'));
const LazyABComparison = React.lazy(() => import('./components/ABComparison'));

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

const App: React.FC = () => {
  const {
    basePrompt,
    model,
    selectedVehicle,
    selectedMods,
    generatedImages,
    aspectRatio,
    numberOfImages,
    activeModules,
    selectedScene,
    selectedNegatives,
    zoomLevel,
    isGenerating,
    error,
    focusMode,
    sessionRuns,
    retryStatus,
    referenceImage,
    stylePresets,
    lastPrompt,
    actions,
  } = useAppStore();

  const {
    setBasePrompt,
    setModel,
    setSelectedVehicle,
    setSelectedMods,
    setGeneratedImages,
    setAspectRatio,
    setNumberOfImages,
    setActiveModules,
    setSelectedScene,
    setSelectedNegatives,
    setZoomLevel,
    setIsGenerating,
    setError,
    toggleFocusMode,
    addSessionRun,
    updateSessionRun,
    setRetryStatus,
    setReferenceImage,
    loadLastSessionSnapshot,
    persistSessionSnapshot,
    addStylePreset,
    removeStylePreset,
    setLastPrompt,
    updateGeneratedImage,
  } = actions;

  const [textEditorImage, setTextEditorImage] = useState<{ url: string; prompt?: string; copyIdeas?: string[] } | null>(null);
  const [filterEditorImage, setFilterEditorImage] = useState<string | null>(null);
  const [exportImage, setExportImage] = useState<GeneratedImage | null>(null);
  const [colorExtractorImage, setColorExtractorImage] = useState<string | null>(null);
  const [showVideoExtractor, setShowVideoExtractor] = useState(false);
  const [showBrandLibrary, setShowBrandLibrary] = useState(false);
  const [showBatchQueue, setShowBatchQueue] = useState(false);
  const [showABComparison, setShowABComparison] = useState(false);
  const [cacheHit, setCacheHit] = useState(false);

  const buildFinalPrompt = useCallback(() => {
    let prompt = basePrompt.trim();
    if (selectedVehicle) {
      prompt = `${selectedVehicle} ${prompt}`;
    }
    if (selectedMods.length > 0) {
      prompt = `${prompt}, equipped with ${selectedMods.join(', ')}`;
    }
    if (selectedScene) {
      const scene = SCENE_LIBRARY.find((s) => s.id === selectedScene);
      if (scene) {
        prompt = `${prompt}, ${scene.keywords}`;
      }
    }
    const negativePrompt = selectedNegatives.join(', ');
    const { enhancedPrompt } = buildModularPrompt(prompt, activeModules, negativePrompt);
    return negativePrompt ? `${enhancedPrompt} --no ${negativePrompt}` : enhancedPrompt;
  }, [basePrompt, selectedVehicle, selectedMods, selectedScene, selectedNegatives, activeModules]);

  const finalPrompt = useMemo(() => buildFinalPrompt(), [buildFinalPrompt]);
  const isGenerateDisabled = !finalPrompt.trim() || isGenerating;

  const handleGenerate = useCallback(async () => {
    if (isGenerateDisabled) return;
    persistSessionSnapshot();
    setIsGenerating(true);
    setError(null);
    setRetryStatus(null);
    setCacheHit(false);
    setGeneratedImages([]);

    const cacheKey = await computeCacheKey({
      prompt: finalPrompt,
      model,
      aspectRatio,
      numberOfImages,
      selectedVehicle,
      selectedMods,
      activeModules,
      selectedScene,
      selectedNegatives,
    });

    const sessionId = `${Date.now()}`;
    const sessionRecord = {
      id: sessionId,
      prompt: finalPrompt,
      cacheKey,
      timestamp: Date.now(),
      status: 'pending' as const,
    };
    addSessionRun(sessionRecord);

    const cached = await getImagesByCacheKey(cacheKey);
    if (cached.length > 0) {
      setGeneratedImages(cached);
      setCacheHit(true);
      updateSessionRun(sessionId, { status: 'cached' });
      setIsGenerating(false);
      return;
    }

    try {
      let resultUrls: string[] = [];
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          resultUrls = await generateThumbnail(finalPrompt, model, {
            aspectRatio,
            numberOfImages,
            imageFile: referenceImage?.file,
          });
          break;
        } catch (err) {
          if (attempt === maxAttempts) throw err;
          setRetryStatus(`Retrying... (${attempt + 1}/${maxAttempts})`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        }
      }

      const copyIdeas = await generateCopySuggestions(finalPrompt).catch(() => []);
      const timestamp = Date.now();
      const images: GeneratedImage[] = resultUrls.map((url, index) => ({
        id: `${timestamp}-${index}`,
        url,
        model,
        prompt: finalPrompt,
        vehicle: selectedVehicle || undefined,
        timestamp,
        settings: { aspectRatio, numberOfImages, model },
        cacheKey,
        referenceImage: referenceImage?.preview,
        sessionId,
        copyIdeas,
      }));

      setGeneratedImages(images);
      await saveManyToHistory(images);
      window.dispatchEvent(new CustomEvent('history:refresh'));
      setLastPrompt(finalPrompt);
      updateSessionRun(sessionId, { status: 'completed' });
      setReferenceImage(null);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      updateSessionRun(sessionId, { status: 'failed' });
    } finally {
      setRetryStatus(null);
      setIsGenerating(false);
    }
  }, [
    isGenerateDisabled,
    persistSessionSnapshot,
    setIsGenerating,
    setError,
    setRetryStatus,
    setGeneratedImages,
    addSessionRun,
    setCacheHit,
    finalPrompt,
    model,
    aspectRatio,
    numberOfImages,
    selectedVehicle,
    selectedMods,
    activeModules,
    selectedScene,
    selectedNegatives,
    referenceImage,
    updateSessionRun,
    setLastPrompt,
    setReferenceImage,
  ]);

  const handleLoadTemplate = useCallback(
    (template: Template) => {
      setBasePrompt(template.prompt);
      setModel(template.model);
      setSelectedVehicle(template.vehicle || null);
      setAspectRatio(template.settings.aspectRatio);
      setNumberOfImages(template.settings.numberOfImages);
    },
    [setBasePrompt, setModel, setSelectedVehicle, setAspectRatio, setNumberOfImages],
  );

  const handleVideoFrameSelect = useCallback((frameDataUrl: string) => {
    setShowVideoExtractor(false);
    setFilterEditorImage(frameDataUrl);
  }, []);

  const handleReferenceDrop = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        setReferenceImage({ preview: reader.result as string, file });
      };
      reader.readAsDataURL(file);
    },
    [setReferenceImage],
  );

  const handleUpdateNote = useCallback(
    async (imageId: string, note: string) => {
      updateGeneratedImage(imageId, { note });
      try {
        await updateHistoryImage(imageId, { note });
        window.dispatchEvent(new CustomEvent('history:refresh'));
      } catch (error) {
        console.warn('Failed to persist note to history', error);
      }
    },
    [updateGeneratedImage],
  );

  const handleSaveStylePreset = useCallback(
    (name: string) => {
      if (!name.trim() || activeModules.length === 0) return;
      const preset: StylePreset = {
        id: `${Date.now()}`,
        name: name.trim(),
        modules: activeModules,
        sceneId: selectedScene,
        createdAt: Date.now(),
      };
      addStylePreset(preset);
    },
    [activeModules, selectedScene, addStylePreset],
  );

  const handleApplyStylePreset = useCallback(
    (preset: StylePreset) => {
      setActiveModules(preset.modules);
      setSelectedScene(preset.sceneId);
    },
    [setActiveModules, setSelectedScene],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleGenerate();
      }
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key === '[') {
          setZoomLevel(Math.max(25, zoomLevel - 5));
        }
        if (event.key === ']') {
          setZoomLevel(Math.min(200, zoomLevel + 5));
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (generatedImages.length > 0) {
          setExportImage(generatedImages[generatedImages.length - 1]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGenerate, zoomLevel, setZoomLevel, generatedImages]);

  const leftColumnClasses = focusMode
    ? 'hidden space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2'
    : 'col-span-12 lg:col-span-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2';

  const rightColumnClasses = focusMode ? 'col-span-12 space-y-4' : 'col-span-12 lg:col-span-7 space-y-4';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 pb-32">
      <Header />

      <main className="max-w-[2000px] mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadLastSessionSnapshot}
              className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-white hover:border-canam-orange transition-colors"
            >
              ♻️ Load yesterday&apos;s setup
            </button>
            <button
              onClick={toggleFocusMode}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                focusMode ? 'bg-canam-orange text-white' : 'border border-slate-700 text-white'
              }`}
            >
              {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            </button>
          </div>
          {referenceImage?.preview && (
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2">
              <img src={referenceImage.preview} alt="Reference" className="w-14 h-14 object-cover rounded-lg border border-slate-600" />
              <div>
                <p className="text-xs text-slate-400">Reference pairing ready</p>
                <button
                  onClick={() => setReferenceImage(null)}
                  className="text-xs text-red-400 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className={leftColumnClasses}>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <VehicleSelector
                selectedVehicle={selectedVehicle}
                onSelectVehicle={setSelectedVehicle}
                selectedMods={selectedMods}
                onSelectMods={setSelectedMods}
              />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <SmartPromptBuilder vehicle={selectedVehicle} onPromptChange={setBasePrompt} initialPrompt={basePrompt} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <PromptModuleSelector
                activeModules={activeModules}
                onModulesChange={setActiveModules}
                stylePresets={stylePresets}
                onSavePreset={handleSaveStylePreset}
                onApplyPreset={handleApplyStylePreset}
                onDeletePreset={removeStylePreset}
              />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <SceneLibrarySelector selectedScene={selectedScene} onSceneSelect={setSelectedScene} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <NegativePromptBuilder selectedNegatives={selectedNegatives} onNegativesChange={setSelectedNegatives} />
            </div>

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
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <TemplateLibrary
                onLoadTemplate={handleLoadTemplate}
                currentPrompt={basePrompt}
                currentModel={model}
                currentSettings={{ aspectRatio, numberOfImages, model }}
                currentVehicle={selectedVehicle}
              />
            </div>

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

          <div className={rightColumnClasses}>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <InteractivePromptPreview
                basePrompt={basePrompt}
                activeModules={activeModules}
                selectedScene={selectedScene}
                selectedNegatives={selectedNegatives}
                vehicle={selectedVehicle}
                previousPrompt={lastPrompt}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border-2 border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                <p className="font-bold">⚠️ Error:</p>
                <p>{error}</p>
              </div>
            )}

            {retryStatus && (
              <div className="bg-slate-800/70 border border-slate-700 text-slate-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span>🔁</span>
                <span>{retryStatus}</span>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="flex justify-end">
                <ZoomControls zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />
              </div>
            )}

            <ImageDisplay
              isLoading={isGenerating}
              generatedImages={generatedImages}
              zoomLevel={zoomLevel}
              onAddText={(url, promptText, copyIdeas) => setTextEditorImage({ url, prompt: promptText, copyIdeas })}
              onFilter={setFilterEditorImage}
              onExport={setExportImage}
              onExtractColors={setColorExtractorImage}
              onUpdateNote={handleUpdateNote}
              onReferenceDrop={handleReferenceDrop}
            />

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>🕒</span> Session Timeline
              </h3>
              <SessionTimeline runs={sessionRuns} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-xl">
              <FilmstripHistory onImageSelect={setFilterEditorImage} />
            </div>
          </div>
        </div>
      </main>

      <StickyGenerateBar
        prompt={finalPrompt}
        isLoading={isGenerating}
        isDisabled={isGenerateDisabled}
        onGenerate={handleGenerate}
        activeModulesCount={activeModules.length}
        selectedScene={selectedScene}
        selectedNegativesCount={selectedNegatives.length}
        cacheHit={cacheHit}
        retryStatus={retryStatus}
      />

      {textEditorImage && (
        <TextOverlayEditor
          imageUrl={textEditorImage.url}
          originalPrompt={textEditorImage.prompt}
          copyIdeas={textEditorImage.copyIdeas}
          onClose={() => setTextEditorImage(null)}
        />
      )}

      {filterEditorImage && <ImageFilterEditor imageUrl={filterEditorImage} onClose={() => setFilterEditorImage(null)} />}

      {exportImage && (
        <MultiFormatExport
          image={exportImage}
          onClose={() => setExportImage(null)}
        />
      )}

      {colorExtractorImage && <ColorPaletteExtractor imageUrl={colorExtractorImage} onClose={() => setColorExtractorImage(null)} />}

      {showVideoExtractor && (
        <Suspense fallback={<Loader />}>
          <LazyVideoFrameExtractor onFrameSelect={handleVideoFrameSelect} onClose={() => setShowVideoExtractor(false)} />
        </Suspense>
      )}

      {showBrandLibrary && (
        <Suspense fallback={<Loader />}>
          <LazyBrandAssetLibrary isOpen={showBrandLibrary} onClose={() => setShowBrandLibrary(false)} />
        </Suspense>
      )}

      {showBatchQueue && (
        <Suspense fallback={<Loader />}>
          <LazyBatchGenerationQueue
            isOpen={showBatchQueue}
            onClose={() => setShowBatchQueue(false)}
            defaultSettings={{ aspectRatio, numberOfImages, model }}
          />
        </Suspense>
      )}

      {showABComparison && (
        <Suspense fallback={<Loader />}>
          <LazyABComparison images={generatedImages} onClose={() => setShowABComparison(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default App;
