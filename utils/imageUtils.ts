/**
 * Generates a compressed thumbnail from an image URL
 * @param imageUrl - Full-size image data URL or regular URL
 * @param maxWidth - Maximum width of thumbnail (default 320px)
 * @param quality - JPEG quality 0-1 (default 0.6)
 * @returns Promise resolving to thumbnail data URL
 */
export const generateThumbnail = async (
  imageUrl: string,
  maxWidth: number = 320,
  quality: number = 0.6
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate scaled dimensions
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to compressed JPEG
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(thumbnailDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail generation'));
    };

    img.src = imageUrl;
  });
};

/**
 * Estimates the size of a JSON object in bytes
 */
export const getJsonSizeInBytes = (obj: any): number => {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
};

/**
 * Checks if localStorage has enough space
 */
export const hasStorageSpace = (data: any, maxSizeBytes: number = 4 * 1024 * 1024): boolean => {
  const size = getJsonSizeInBytes(data);
  return size < maxSizeBytes;
};

/**
 * Compresses an image data URL by reducing quality
 */
export const compressImageDataUrl = async (
  dataUrl: string,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};
