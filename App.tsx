import React, { useState, useCallback } from 'react';
import { ImageModel, GeneratedImage, VehicleType, Template } from './types';
import { generateThumbnail } from './services/geminiService';
import { saveToHistory } from './utils/storage';
import { downloadImage, generateFilename } from './utils/download';
import Loader from './components/Loader';
import VehicleSelector from './components/VehicleSelector';
import SmartPromptBuilder from './components/SmartPromptBuilder';
import TemplateLibrary from './components/TemplateLibrary';
import GenerationHistory from './components/GenerationHistory';
import TextOverlayEditor from './components/TextOverlayEditor';

const Header: React.FC = () => (
  <header className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-canam-orange via-red-600 to-canam-orange animate-gradient opacity-20"></div>
    <div className="relative py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-white mb-2">
          <span className="bg-gradient-to-r from-canam-orange to-electric-blue bg-clip-text text-transparent">
            SlingMods
          </span>
          <span className="text-white"> Thumbnail AI</span>
        </h1>
        <p className="text-lg text-slate-300 font-medium">
          Professional thumbnail generation for Can-Am & Polaris content
        </p>
        <div className="mt-4 flex gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Gemini AI Powered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></span>
            High Resolution 16:9
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-canam-orange rounded-full animate-pulse"></span>
            Pro Features
          </span>
        </div>
      </div>
    </div>
  </header>
);

const ImageDisplay: React.FC<{
  isLoading: boolean;
  generatedImages: GeneratedImage[];
  onAddText: (imageUrl: string, prompt?: string) => void;
}> = ({ isLoading, generatedImages, onAddText }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6 flex items-center justify-center min-h-[600px] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-canam-orange rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full">
        {isLoading ? (
          <Loader />
        ) : generatedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {generatedImages.map((image) => (
              <div key={image.id} className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-canam-orange transition-all shadow-2xl hover:shadow-canam-orange/20">
                <img
                  src={image.url}
                  alt={`Generated Thumbnail ${image.id}`}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={() => {
                      const filename = generateFilename(image.vehicle, image.prompt);
                      downloadImage(image.url, filename);
                    }}
                    className="flex-1 bg-gradient-to-r from-electric-blue to-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:from-electric-blue hover:to-cyan-700 transition-all shadow-lg"
                  >
                    💾 Download
                  </button>
                  <button
                    onClick={() => onAddText(image.url, image.prompt)}
                    className="flex-1 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold py-2 px-4 rounded-lg hover:from-canam-orange hover:to-red-700 transition-all shadow-lg"
                  >
                    ✏️ Add Text
                  </button>
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
  const [prompt, setPrompt] = useState<string>('');
  const [model, setModel] = useState<ImageModel>(ImageModel.IMAGEN);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [numberOfImages, setNumberOfImages] = useState<number>(2);
  const [textEditorImage, setTextEditorImage] = useState<{ url: string; prompt?: string } | null>(null);

  const isGenerateDisabled = !prompt.trim() || isLoading;

  const handleGenerate = useCallback(async () => {
    if (isGenerateDisabled) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const resultUrls = await generateThumbnail(prompt, model, {
        aspectRatio,
        numberOfImages,
      });

      const images: GeneratedImage[] = resultUrls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        model,
        prompt,
        vehicle: selectedVehicle || undefined,
        timestamp: Date.now(),
        settings: {
          aspectRatio,
          numberOfImages,
          model,
        },
      }));

      setGeneratedImages(images);

      // Save to history
      images.forEach((img) => saveToHistory(img));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, model, aspectRatio, numberOfImages, selectedVehicle, isGenerateDisabled]);

  const handleLoadTemplate = useCallback((template: Template) => {
    setPrompt(template.prompt);
    setModel(template.model);
    setSelectedVehicle(template.vehicle || null);
    setAspectRatio(template.settings.aspectRatio);
    setNumberOfImages(template.settings.numberOfImages);
  }, []);

  const handleLoadPromptFromHistory = useCallback((historyPrompt: string) => {
    setPrompt(historyPrompt);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <Header />

      <main className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Control Panel */}
          <div className="col-span-4 space-y-6">
            {/* Vehicle Selection */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-2xl">
              <VehicleSelector
                selectedVehicle={selectedVehicle}
                onSelectVehicle={setSelectedVehicle}
              />
            </div>

            {/* Model & Settings */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange focus:border-transparent"
                >
                  <option value={ImageModel.IMAGEN}>🎨 Imagen 4.0 (Text-to-Image)</option>
                  <option value={ImageModel.GEMINI_FLASH_IMAGE}>⚡ Gemini Flash (Fast)</option>
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange"
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
                      className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-canam-orange"
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

            {/* Template Library */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-2xl">
              <TemplateLibrary
                onLoadTemplate={handleLoadTemplate}
                currentPrompt={prompt}
                currentModel={model}
                currentSettings={{ aspectRatio, numberOfImages, model }}
                currentVehicle={selectedVehicle}
              />
            </div>

            {/* Generation History */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-2xl">
              <GenerationHistory onLoadPrompt={handleLoadPromptFromHistory} />
            </div>
          </div>

          {/* Center - Prompt Builder & Preview */}
          <div className="col-span-8 space-y-6">
            {/* Prompt Builder */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-2xl">
              <SmartPromptBuilder
                vehicle={selectedVehicle}
                onPromptChange={setPrompt}
                initialPrompt={prompt}
              />

              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  📝 Final Prompt Preview
                </label>
                <div className="text-sm text-slate-300 max-h-24 overflow-y-auto">
                  {prompt || <span className="text-slate-500 italic">Your prompt will appear here...</span>}
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-900/30 border-2 border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  <p className="font-bold">⚠️ Error:</p>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`w-full mt-6 flex justify-center items-center py-4 px-6 border-2 border-transparent rounded-xl shadow-2xl text-lg font-bold text-white transition-all transform ${
                  isGenerateDisabled
                    ? 'bg-slate-700 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-canam-orange via-red-600 to-canam-orange bg-size-200 hover:bg-right-center active:scale-95 shadow-canam-orange/50'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    ✨ Generate Thumbnail
                  </>
                )}
              </button>
            </div>

            {/* Image Display */}
            <ImageDisplay
              isLoading={isLoading}
              generatedImages={generatedImages}
              onAddText={(url, promptText) => setTextEditorImage({ url, prompt: promptText })}
            />
          </div>
        </div>
      </main>

      {/* Text Overlay Editor Modal */}
      {textEditorImage && (
        <TextOverlayEditor
          imageUrl={textEditorImage.url}
          originalPrompt={textEditorImage.prompt}
          onClose={() => setTextEditorImage(null)}
        />
      )}
    </div>
  );
};

export default App;
