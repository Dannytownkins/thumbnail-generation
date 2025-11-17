
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageModel } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateThumbnail = async (
  prompt: string,
  model: ImageModel,
  options: {
    aspectRatio?: string;
    numberOfImages?: number;
    imageFile?: File;
  }
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (model === ImageModel.IMAGEN) {
    const response = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: options.numberOfImages || 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: options.aspectRatio || '16:9',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    }
    throw new Error("Image generation failed with Imagen.");

  } else if (model === ImageModel.GEMINI_FLASH_IMAGE) {
    const parts = [];
    if (options.imageFile) {
        const imagePart = await fileToGenerativePart(options.imageFile);
        parts.push(imagePart);
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return [`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`];
      }
    }
    throw new Error("Image generation failed with Gemini Flash Image.");
  }

  throw new Error("Invalid model selected.");
};
