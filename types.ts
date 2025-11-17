
export enum ImageModel {
  IMAGEN = 'imagen-4.0-generate-001',
  GEMINI_FLASH_IMAGE = 'gemini-2.5-flash-image',
}

export type GeneratedImage = {
  id: string;
  url: string;
  model: ImageModel;
};