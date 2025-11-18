import { VehicleType } from '../types';

export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateFilename = (
  vehicle?: VehicleType,
  concept?: string,
  extension: string = 'jpg'
): string => {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const vehicleName = vehicle ? vehicle.replace(/[^a-zA-Z0-9]/g, '_') : 'Thumbnail';
  const conceptName = concept
    ? concept.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
    : 'Generated';

  return `${vehicleName}_${conceptName}_${timestamp}.${extension}`;
};

export const downloadMultipleImages = (images: { url: string; name: string }[]): void => {
  images.forEach((img, index) => {
    setTimeout(() => {
      downloadImage(img.url, img.name);
    }, index * 300); // Stagger downloads to avoid browser blocking
  });
};

export const dataURLtoBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
