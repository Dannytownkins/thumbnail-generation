import { create } from 'zustand';
import {
  GeneratedImage,
  GenerationSettings,
  ImageModel,
  SessionRun,
  StylePreset,
  VehicleType,
} from '../types';
import { personalProfile } from '../config/personalProfile';
import {
  loadLastSession,
  saveLastSession,
  getStylePresets,
  saveStylePresets,
} from '../utils/storage';

type ReferenceImageState = {
  preview: string;
  file?: File;
};

type AppState = {
  basePrompt: string;
  model: ImageModel;
  selectedVehicle: VehicleType | null;
  selectedMods: string[];
  generatedImages: GeneratedImage[];
  aspectRatio: string;
  numberOfImages: number;
  activeModules: string[];
  selectedScene: string | null;
  selectedNegatives: string[];
  zoomLevel: number;
  isGenerating: boolean;
  error: string | null;
  focusMode: boolean;
  sessionRuns: SessionRun[];
  retryStatus: string | null;
  referenceImage: ReferenceImageState | null;
  stylePresets: StylePreset[];
  lastPrompt: string;
  actions: {
    setBasePrompt: (value: string) => void;
    setModel: (value: ImageModel) => void;
    setSelectedVehicle: (vehicle: VehicleType | null) => void;
    setSelectedMods: (mods: string[]) => void;
    setGeneratedImages: (images: GeneratedImage[]) => void;
    addGeneratedImages: (images: GeneratedImage[]) => void;
    updateGeneratedImage: (id: string, patch: Partial<GeneratedImage>) => void;
    setAspectRatio: (ratio: string) => void;
    setNumberOfImages: (count: number) => void;
    setActiveModules: (modules: string[]) => void;
    setSelectedScene: (scene: string | null) => void;
    setSelectedNegatives: (negatives: string[]) => void;
    setZoomLevel: (level: number) => void;
    setIsGenerating: (value: boolean) => void;
    setError: (message: string | null) => void;
    toggleFocusMode: () => void;
    setFocusMode: (value: boolean) => void;
    addSessionRun: (run: SessionRun) => void;
    updateSessionRun: (id: string, patch: Partial<SessionRun>) => void;
    setRetryStatus: (status: string | null) => void;
    setReferenceImage: (payload: ReferenceImageState | null) => void;
    loadLastSessionSnapshot: () => void;
    persistSessionSnapshot: () => void;
    addStylePreset: (preset: StylePreset) => void;
    removeStylePreset: (id: string) => void;
    loadStylePresets: () => void;
    setLastPrompt: (prompt: string) => void;
  };
};

const initialSession = loadLastSession();

const createSnapshot = (state: AppState) => ({
  basePrompt: state.basePrompt,
  model: state.model,
  selectedVehicle: state.selectedVehicle,
  selectedMods: state.selectedMods,
  aspectRatio: state.aspectRatio,
  numberOfImages: state.numberOfImages,
  activeModules: state.activeModules,
  selectedScene: state.selectedScene,
  selectedNegatives: state.selectedNegatives,
  zoomLevel: state.zoomLevel,
  focusMode: state.focusMode,
});

export const useAppStore = create<AppState>((set, get) => ({
  basePrompt: initialSession?.basePrompt ?? '',
  model: initialSession?.model ?? personalProfile.defaultModel,
  selectedVehicle: initialSession?.selectedVehicle ?? null,
  selectedMods: initialSession?.selectedMods ?? [],
  generatedImages: [],
  aspectRatio: initialSession?.aspectRatio ?? personalProfile.defaultAspectRatio,
  numberOfImages: initialSession?.numberOfImages ?? personalProfile.defaultNumberOfImages,
  activeModules: initialSession?.activeModules ?? personalProfile.defaultModules,
  selectedScene: initialSession?.selectedScene ?? personalProfile.defaultScene,
  selectedNegatives: initialSession?.selectedNegatives ?? personalProfile.defaultNegatives,
  zoomLevel: initialSession?.zoomLevel ?? personalProfile.defaultZoom,
  isGenerating: false,
  error: null,
  focusMode: initialSession?.focusMode ?? false,
  sessionRuns: [],
  retryStatus: null,
  referenceImage: null,
  stylePresets: getStylePresets(),
  lastPrompt: '',
  actions: {
    setBasePrompt: (value) => set({ basePrompt: value }),
    setModel: (value) => set({ model: value }),
    setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
    setSelectedMods: (mods) => set({ selectedMods: mods }),
    setGeneratedImages: (images) => set({ generatedImages: images }),
    addGeneratedImages: (images) =>
      set((state) => ({ generatedImages: [...state.generatedImages, ...images] })),
    updateGeneratedImage: (id, patch) =>
      set((state) => ({
        generatedImages: state.generatedImages.map((img) =>
          img.id === id ? { ...img, ...patch } : img,
        ),
      })),
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    setNumberOfImages: (count) => set({ numberOfImages: count }),
    setActiveModules: (modules) => set({ activeModules: modules }),
    setSelectedScene: (scene) => set({ selectedScene: scene }),
    setSelectedNegatives: (negatives) => set({ selectedNegatives: negatives }),
    setZoomLevel: (level) => set({ zoomLevel: level }),
    setIsGenerating: (value) => set({ isGenerating: value }),
    setError: (message) => set({ error: message }),
    toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
    setFocusMode: (value) => set({ focusMode: value }),
    addSessionRun: (run) => set((state) => ({ sessionRuns: [run, ...state.sessionRuns] })),
    updateSessionRun: (id, patch) =>
      set((state) => ({
        sessionRuns: state.sessionRuns.map((run) =>
          run.id === id ? { ...run, ...patch } : run,
        ),
      })),
    setRetryStatus: (status) => set({ retryStatus: status }),
    setReferenceImage: (payload) => set({ referenceImage: payload }),
    loadLastSessionSnapshot: () => {
      const snapshot = loadLastSession();
      if (!snapshot) return;
      set({
        basePrompt: snapshot.basePrompt ?? '',
        model: snapshot.model ?? personalProfile.defaultModel,
        selectedVehicle: snapshot.selectedVehicle ?? null,
        selectedMods: snapshot.selectedMods ?? [],
        aspectRatio: snapshot.aspectRatio ?? personalProfile.defaultAspectRatio,
        numberOfImages: snapshot.numberOfImages ?? personalProfile.defaultNumberOfImages,
        activeModules: snapshot.activeModules ?? personalProfile.defaultModules,
        selectedScene: snapshot.selectedScene ?? personalProfile.defaultScene,
        selectedNegatives: snapshot.selectedNegatives ?? personalProfile.defaultNegatives,
        zoomLevel: snapshot.zoomLevel ?? personalProfile.defaultZoom,
        focusMode: snapshot.focusMode ?? false,
      });
    },
    persistSessionSnapshot: () => {
      const state = get();
      saveLastSession(createSnapshot(state));
    },
    addStylePreset: (preset) =>
      set((state) => {
        const next = [...state.stylePresets, preset];
        saveStylePresets(next);
        return { stylePresets: next };
      }),
    removeStylePreset: (id) =>
      set((state) => {
        const next = state.stylePresets.filter((preset) => preset.id !== id);
        saveStylePresets(next);
        return { stylePresets: next };
      }),
    loadStylePresets: () => set({ stylePresets: getStylePresets() }),
    setLastPrompt: (prompt) => set({ lastPrompt: prompt }),
  },
}));

export const selectGenerationSettings = (state: AppState): GenerationSettings => ({
  aspectRatio: state.aspectRatio,
  numberOfImages: state.numberOfImages,
  model: state.model,
});

