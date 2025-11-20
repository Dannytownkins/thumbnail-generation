
import { GoogleGenAI, Modality } from '@google/genai';
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

const getApiKey = () => {
  const apiKey =
    import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY;
  if (!apiKey) {
    throw new Error(
      'API key not found. Please set VITE_API_KEY or VITE_GEMINI_API_KEY in your .env.local file.',
    );
  }
  return apiKey;
};

const getClient = () => new GoogleGenAI({ apiKey: getApiKey() });

export const generateThumbnail = async (
  prompt: string,
  model: ImageModel,
  options: {
    aspectRatio?: string;
    numberOfImages?: number;
    imageFile?: File;
  },
): Promise<string[]> => {
  const ai = getClient();

  if (model === ImageModel.IMAGEN) {
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: options.numberOfImages || 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: options.aspectRatio || '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map((img) => `data:image/jpeg;base64,${img.image.imageBytes}`);
    }
    throw new Error('Image generation failed with Imagen.');
  }

  if (model === ImageModel.GEMINI_FLASH_IMAGE) {
    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];
    if (options.imageFile) {
      const imagePart = await fileToGenerativePart(options.imageFile);
      parts.push(imagePart);
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content.parts ?? []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return [`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`];
      }
    }
    throw new Error('Image generation failed with Gemini Flash Image.');
  }

  throw new Error('Invalid model selected.');
};

export const generateCopySuggestions = async (prompt: string): Promise<string[]> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an advertising copywriter. Suggest 5 short, punchy thumbnail text ideas (max 4 words each) for this prompt:\n"${prompt}"\nReturn them as a simple numbered list.`,
            },
          ],
        },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts
        ?.map((part) => ('text' in part ? part.text : ''))
        .join('\n') ?? '';

    return text
      .split('\n')
      .map((line) => line.replace(/^\d+[\).\s-]*/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch (error) {
    console.error('Failed to generate copy suggestions', error);
    return [];
  }
};
