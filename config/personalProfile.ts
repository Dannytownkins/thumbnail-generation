import { ImageModel } from '../types';

export const personalProfile = {
  defaultModel: ImageModel.GEMINI_FLASH_IMAGE,
  defaultAspectRatio: '16:9',
  defaultNumberOfImages: 2,
  defaultZoom: 100,
  defaultModules: [] as string[],
  defaultScene: null as string | null,
  defaultNegatives: [
    'motion blur',
    'low contrast',
    'cropped vehicle',
    'text artifacts',
  ],
  cacheLimit: 100,
};

export type PersonalProfile = typeof personalProfile;

