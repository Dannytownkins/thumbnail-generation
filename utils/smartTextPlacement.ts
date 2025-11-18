export interface ColorRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  brightness: number;
}

export interface TextPlacementSuggestion {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  recommendedColor: 'light' | 'dark';
}

/**
 * Analyzes an image and suggests optimal text placement areas
 */
export const analyzeImageForTextPlacement = async (
  imageUrl: string,
  gridSize: number = 8
): Promise<TextPlacementSuggestion[]> => {
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

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const suggestions = findClearAreas(canvas, gridSize);
      resolve(suggestions);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Divides image into grid and analyzes each cell for clarity and brightness
 */
const findClearAreas = (canvas: HTMLCanvasElement, gridSize: number): TextPlacementSuggestion[] => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const cellWidth = canvas.width / gridSize;
  const cellHeight = canvas.height / gridSize;
  const regions: ColorRegion[] = [];

  // Analyze each grid cell
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;

      const imageData = ctx.getImageData(x, y, cellWidth, cellHeight);
      const brightness = calculateAverageBrightness(imageData.data);

      regions.push({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        brightness,
      });
    }
  }

  // Find 2x2 regions with consistent brightness (good for text)
  const suggestions: TextPlacementSuggestion[] = [];

  // Common text placement positions
  const positions = [
    { name: 'top-left' as const, rows: [0, 1], cols: [0, 1, 2] },
    { name: 'top-right' as const, rows: [0, 1], cols: [gridSize - 3, gridSize - 2, gridSize - 1] },
    { name: 'bottom-left' as const, rows: [gridSize - 2, gridSize - 1], cols: [0, 1, 2] },
    { name: 'bottom-right' as const, rows: [gridSize - 2, gridSize - 1], cols: [gridSize - 3, gridSize - 2, gridSize - 1] },
    { name: 'center' as const, rows: [Math.floor(gridSize / 2) - 1, Math.floor(gridSize / 2)], cols: [Math.floor(gridSize / 2) - 1, Math.floor(gridSize / 2), Math.floor(gridSize / 2) + 1] },
  ];

  positions.forEach((position) => {
    let totalBrightness = 0;
    let cellCount = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = 0;
    let maxY = 0;

    position.rows.forEach((row) => {
      position.cols.forEach((col) => {
        const index = row * gridSize + col;
        if (regions[index]) {
          totalBrightness += regions[index].brightness;
          cellCount++;
          minX = Math.min(minX, regions[index].x);
          minY = Math.min(minY, regions[index].y);
          maxX = Math.max(maxX, regions[index].x + regions[index].width);
          maxY = Math.max(maxY, regions[index].y + regions[index].height);
        }
      });
    });

    const avgBrightness = totalBrightness / cellCount;
    const variance = calculateBrightnessVariance(position, regions, gridSize);

    // Score based on uniformity (low variance) and not being mid-brightness
    const uniformityScore = 1 - Math.min(variance / 100, 1);
    const contrastScore = avgBrightness < 100 || avgBrightness > 180 ? 1 : 0.5;
    const score = (uniformityScore * 0.7 + contrastScore * 0.3) * 100;

    suggestions.push({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      score,
      position: position.name,
      recommendedColor: avgBrightness < 128 ? 'light' : 'dark',
    });
  });

  // Sort by score (best first)
  return suggestions.sort((a, b) => b.score - a.score);
};

const calculateAverageBrightness = (pixels: Uint8ClampedArray): number => {
  let totalBrightness = 0;
  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a > 128) {
      // Use perceived brightness formula
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;
      count++;
    }
  }

  return count > 0 ? totalBrightness / count : 0;
};

const calculateBrightnessVariance = (
  position: { rows: number[]; cols: number[] },
  regions: ColorRegion[],
  gridSize: number
): number => {
  const brightnesses: number[] = [];

  position.rows.forEach((row) => {
    position.cols.forEach((col) => {
      const index = row * gridSize + col;
      if (regions[index]) {
        brightnesses.push(regions[index].brightness);
      }
    });
  });

  const mean = brightnesses.reduce((sum, b) => sum + b, 0) / brightnesses.length;
  const variance = brightnesses.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) / brightnesses.length;

  return Math.sqrt(variance);
};

/**
 * Gets a simple recommendation without full analysis
 */
export const getQuickTextPlacement = (
  imageAspectRatio: number = 16 / 9
): TextPlacementSuggestion => {
  // Default to bottom-left for most thumbnails
  return {
    x: 0,
    y: 0.65, // 65% down
    width: 0.5, // 50% width
    height: 0.3, // 30% height
    score: 70,
    position: 'bottom-left',
    recommendedColor: 'light',
  };
};
