
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