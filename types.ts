
export enum ImageModel {
  IMAGEN = 'imagen-4.0-generate-001',
  GEMINI_FLASH_IMAGE = 'gemini-2.5-flash-image',
}

export enum VehicleType {
  RYKER = 'Can-Am Ryker',
  SPYDER_F3 = 'Can-Am Spyder F3',
  SPYDER_RT = 'Can-Am Spyder RT',
  SLINGSHOT = 'Polaris Slingshot',
}

export type GeneratedImage = {
  id: string;
  url: string;
  model: ImageModel;
  prompt?: string;
  vehicle?: VehicleType;
  timestamp?: number;
  settings?: GenerationSettings;
  cacheKey?: string;
  note?: string;
  favorite?: boolean;
  shipped?: boolean;
  referenceImage?: string;
  copyIdeas?: string[];
  exportLogs?: ExportLog[];
  sessionId?: string;
};

export type GenerationSettings = {
  aspectRatio: string;
  numberOfImages: number;
  model: ImageModel;
};

export type Template = {
  id: string;
  name: string;
  prompt: string;
  vehicle?: VehicleType;
  model: ImageModel;
  settings: GenerationSettings;
  isFavorite: boolean;
  createdAt: number;
};

export type TextOverlay = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
};

export type PromptComponent = {
  vehicle?: VehicleType;
  action?: string;
  setting?: string;
  style?: string;
  lighting?: string;
  additional?: string;
};

export type ImageFilters = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  hue: number;
};

export type CompositionLayer = {
  id: string;
  imageUrl: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  DARKEN = 'darken',
  LIGHTEN = 'lighten',
}

export type BrandAsset = {
  id: string;
  name: string;
  imageUrl: string;
  type: 'logo' | 'watermark' | 'sticker' | 'other';
  createdAt: number;
};

export type ExportFormat = {
  name: string;
  width: number;
  height: number;
  platform: string;
};

export type BatchJob = {
  id: string;
  prompt: string;
  vehicle?: VehicleType;
  model: ImageModel;
  settings: GenerationSettings;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  result?: GeneratedImage[];
  error?: string;
  overrides?: Partial<GenerationSettings>;
  note?: string;
};

export type VideoFrame = {
  id: string;
  dataUrl: string;
  timestamp: number;
  index: number;
};

export type ExportLog = {
  id: string;
  imageId: string;
  format: string;
  width: number;
  height: number;
  destination?: string;
  exportedAt: number;
};

export type SessionRun = {
  id: string;
  prompt: string;
  cacheKey: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'cached' | 'failed';
  note?: string;
};

export type StylePreset = {
  id: string;
  name: string;
  modules: string[];
  sceneId: string | null;
  createdAt: number;
};