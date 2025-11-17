
import React, { useState, useCallback } from 'react';
import { ImageModel, GeneratedImage } from './types';
import { generateThumbnail } from './services/geminiService';
import Loader from './components/Loader';

const Header: React.FC = () => (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="text-sky-400">SlingMods</span> Thumbnail AI
        </h1>
        <p className="mt-2 text-lg text-slate-400">
            Generate stunning YouTube thumbnails for your favorite rides.
        </p>
    </header>
);

const ImageUploader: React.FC<{
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    imagePreview: string | null;
    setImagePreview: (url: string | null) => void;
}> = ({ imageFile, setImageFile, imagePreview, setImagePreview }) => {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    }

    return (
        <div className="w-full">
            <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-2">
                Upload Reference Image (Optional for Gemini Flash)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
                            <button onClick={handleClearImage} className="mt-2 text-sm text-red-400 hover:text-red-300">Remove Image</button>
                        </>
                    ) : (
                        <>
                            <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-slate-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-sky-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ImageDisplay: React.FC<{
    isLoading: boolean;
    generatedImages: GeneratedImage[];
    imagePreview: string | null;
}> = ({ isLoading, generatedImages, imagePreview }) => {
    return (
        <div className="w-full h-full bg-slate-800/50 rounded-lg p-4 flex items-center justify-center border border-slate-700 min-h-[400px]">
            {isLoading ? (
                <Loader />
            ) : generatedImages.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {generatedImages.map((image) => (
                        <div key={image.id} className="text-center group relative">
                            <img 
                                src={image.url} 
                                alt={`Generated Thumbnail ${image.id}`} 
                                className="w-full object-contain rounded-lg shadow-2xl" 
                            />
                            <a
                                href={image.url}
                                download={`thumbnail-${image.model}-${Date.now()}.jpg`}
                                className="absolute bottom-2 right-2 bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-all opacity-0 group-hover:opacity-100"
                            >
                                Download
                            </a>
                        </div>
                    ))}
                </div>
            ) : imagePreview ? (
                <div className="text-center">
                    <img src={imagePreview} alt="Uploaded reference" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
                    <p className="text-slate-400 mt-2 text-sm">Reference image loaded. Now write a prompt and generate!</p>
                </div>
            ) : (
                <div className="text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3.5 3.5" /><path d="M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" /><path d="M19 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M17 21l4 -4" /></svg>
                    <h3 className="mt-2 text-lg font-medium">Your generated thumbnail will appear here</h3>
                    <p className="mt-1 text-sm">Upload an image and write a prompt to get started.</p>
                </div>
            )}
        </div>
    );
};

const PROMPT_PRESETS = [
    'Dynamic action shot',
    'Extreme close-up on [PART]',
    'Vibrant, eye-catching colors',
    'Epic cinematic lighting',
    'High speed with motion blur',
    'Photorealistic, 8K resolution',
    'Unreal Engine 5 render',
    'Explosion in the background',
    'On a winding mountain pass at sunset',
    'Drifting through a neon-lit city',
    '"Before vs After" style shot',
    'Clean studio background',
];

const PromptPresets: React.FC<{ onSelect: (preset: string) => void }> = ({ onSelect }) => (
    <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
            {PROMPT_PRESETS.map((preset) => (
                <button
                    key={preset}
                    type="button"
                    onClick={() => onSelect(preset)}
                    className="bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-sky-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                >
                    {preset}
                </button>
            ))}
        </div>
    </div>
);


const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [model, setModel] = useState<ImageModel>(ImageModel.GEMINI_FLASH_IMAGE);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>('16:9');
    const [numberOfImages, setNumberOfImages] = useState<number>(1);

    const isGenerateDisabled = !prompt.trim() || isLoading;

    const handleGenerate = useCallback(async () => {
        if (isGenerateDisabled) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const resultUrls = await generateThumbnail(prompt, model, { 
                imageFile: imageFile || undefined,
                aspectRatio,
                numberOfImages
            });
            const images = resultUrls.map((url, index) => ({
                id: `${Date.now()}-${index}`,
                url,
                model
            }));
            setGeneratedImages(images);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, model, imageFile, isGenerateDisabled, aspectRatio, numberOfImages]);

    const handlePresetSelect = useCallback((preset: string) => {
        setPrompt(prev => {
            const trimmedPrev = prev.trim();
            if (trimmedPrev === '') return preset;
            return `${trimmedPrev}, ${preset.toLowerCase()}`;
        });
    }, []);


    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls Column */}
                    <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                        <ImageUploader 
                            imageFile={imageFile} 
                            setImageFile={setImageFile}
                            imagePreview={imagePreview}
                            setImagePreview={setImagePreview}
                        />

                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-slate-300">Select AI Model</label>
                            <select
                                id="model"
                                name="model"
                                value={model}
                                onChange={(e) => setModel(e.target.value as ImageModel)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-800 border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            >
                                <option value={ImageModel.GEMINI_FLASH_IMAGE}>Gemini Flash (Generate/Edit)</option>
                                <option value={ImageModel.IMAGEN}>Imagen (Generate from Text)</option>
                            </select>
                            {model === ImageModel.GEMINI_FLASH_IMAGE && !imageFile && (
                                <p className="mt-2 text-xs text-sky-400">Optional: Upload an image to edit it with your prompt.</p>
                            )}
                        </div>
                        
                        {model === ImageModel.IMAGEN && (
                            <>
                                <div>
                                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300">Aspect Ratio</label>
                                    <select
                                        id="aspectRatio"
                                        name="aspectRatio"
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-800 border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                    >
                                        <option value="16:9">16:9 (Widescreen)</option>
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="9:16">9:16 (Vertical)</option>
                                        <option value="4:3">4:3 (Standard)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-300">Number of Images: <span className="font-bold text-sky-400">{numberOfImages}</span></label>
                                    <input
                                        id="numberOfImages"
                                        type="range"
                                        min="1"
                                        max="4"
                                        step="1"
                                        value={numberOfImages}
                                        onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"
                                    />
                                </div>
                            </>
                        )}


                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
                                Prompt
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="prompt"
                                    name="prompt"
                                    rows={6}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="shadow-sm bg-slate-800 focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-slate-600 rounded-md"
                                    placeholder="e.g., A Polaris Slingshot drifting on a mountain road at sunset, cinematic lighting, hyperrealistic..."
                                />
                            </div>
                            <div className="mt-4">
                                <PromptPresets onSelect={handlePresetSelect} />
                            </div>
                             <p className="mt-4 text-sm text-slate-500">
                                Be descriptive! Mention vehicle, action, setting, and style.
                             </p>
                        </div>
                        
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
                                <p><span className="font-bold">Error:</span> {error}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                                isGenerateDisabled
                                    ? 'bg-slate-600 cursor-not-allowed'
                                    : 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500'
                            } transition-colors`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate Thumbnail'
                            )}
                        </button>
                    </div>

                    {/* Image Display Column */}
                    <div className="flex-grow">
                       <ImageDisplay isLoading={isLoading} generatedImages={generatedImages} imagePreview={imagePreview} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
