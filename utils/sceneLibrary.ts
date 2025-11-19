export interface Scene {
  id: string;
  name: string;
  description: string;
  keywords: string;
  thumbnail: string;
  category: 'road' | 'studio' | 'urban' | 'nature' | 'track';
}

export const SCENE_LIBRARY: Scene[] = [
  // Road Scenes
  {
    id: 'mountain-pass',
    name: 'Mountain Pass',
    description: 'Winding mountain road with scenic views',
    keywords: 'winding mountain pass road, scenic alpine curves, dramatic elevation, mountain backdrop',
    thumbnail: '🏔️',
    category: 'road',
  },
  {
    id: 'coastal-highway',
    name: 'Coastal Highway',
    description: 'Pacific coast highway with ocean views',
    keywords: 'coastal highway along ocean, dramatic cliffs, blue water, palm trees, sunset sky',
    thumbnail: '🌊',
    category: 'road',
  },
  {
    id: 'desert-highway',
    name: 'Desert Highway',
    description: 'Empty desert road with endless horizon',
    keywords: 'empty desert highway, endless horizon, heat haze, dramatic sky, southwestern landscape',
    thumbnail: '🏜️',
    category: 'road',
  },
  {
    id: 'forest-road',
    name: 'Forest Road',
    description: 'Tree-lined road through dense forest',
    keywords: 'tree-lined forest road, dappled sunlight, green canopy, winding path through woods',
    thumbnail: '🌲',
    category: 'road',
  },
  {
    id: 'canyon-road',
    name: 'Canyon Road',
    description: 'Road through dramatic red rock canyons',
    keywords: 'red rock canyon road, dramatic geological formations, southwestern desert, towering cliffs',
    thumbnail: '🪨',
    category: 'road',
  },

  // Urban Scenes
  {
    id: 'city-night',
    name: 'City Night',
    description: 'Downtown city at night with lights',
    keywords: 'neon-lit city streets at night, glowing buildings, urban downtown, light trails',
    thumbnail: '🌃',
    category: 'urban',
  },
  {
    id: 'industrial',
    name: 'Industrial District',
    description: 'Gritty industrial warehouse area',
    keywords: 'industrial warehouse district, urban grit, concrete and steel, dramatic shadows',
    thumbnail: '🏭',
    category: 'urban',
  },
  {
    id: 'parking-garage',
    name: 'Parking Garage',
    description: 'Underground parking structure',
    keywords: 'underground parking garage, concrete pillars, dramatic lighting, urban atmosphere',
    thumbnail: '🅿️',
    category: 'urban',
  },
  {
    id: 'city-overlook',
    name: 'City Overlook',
    description: 'Hilltop overlooking the city',
    keywords: 'city overlook viewpoint, panoramic cityscape, elevated perspective, dramatic vista',
    thumbnail: '🏙️',
    category: 'urban',
  },

  // Studio & Clean
  {
    id: 'white-studio',
    name: 'White Studio',
    description: 'Clean white studio background',
    keywords: 'professional white studio background, clean minimalist, seamless backdrop, studio lighting',
    thumbnail: '⬜',
    category: 'studio',
  },
  {
    id: 'black-studio',
    name: 'Black Studio',
    description: 'Dramatic black studio background',
    keywords: 'dramatic black studio background, moody atmosphere, rim lighting, professional setup',
    thumbnail: '⬛',
    category: 'studio',
  },
  {
    id: 'gradient-studio',
    name: 'Gradient Studio',
    description: 'Modern gradient studio background',
    keywords: 'modern gradient studio background, vibrant color fade, contemporary aesthetic',
    thumbnail: '🎨',
    category: 'studio',
  },
  {
    id: 'showroom',
    name: 'Showroom',
    description: 'Luxury automotive showroom',
    keywords: 'luxury automotive showroom, polished floors, spotlights, premium display space',
    thumbnail: '✨',
    category: 'studio',
  },
  {
    id: 'green-screen',
    name: 'Green Screen',
    description: 'Pure chroma green background',
    keywords: 'pure chroma green background, solid #00b140 background, even lighting, no shadows, chroma key ready',
    thumbnail: '🟩',
    category: 'studio',
  },

  // Nature
  {
    id: 'sunset-field',
    name: 'Sunset Field',
    description: 'Open field at golden hour',
    keywords: 'open field at golden hour sunset, warm glow, dramatic sky, natural landscape',
    thumbnail: '🌾',
    category: 'nature',
  },
  {
    id: 'lakeside',
    name: 'Lakeside',
    description: 'Scenic lake with mountain reflection',
    keywords: 'scenic lakeside setting, mountain reflections, calm water, pristine nature',
    thumbnail: '🏞️',
    category: 'nature',
  },
  {
    id: 'autumn-road',
    name: 'Autumn Road',
    description: 'Road lined with fall colors',
    keywords: 'autumn road with fall colors, golden leaves, seasonal beauty, warm tones',
    thumbnail: '🍂',
    category: 'nature',
  },

  // Track & Performance
  {
    id: 'race-track',
    name: 'Race Track',
    description: 'Professional racing circuit',
    keywords: 'professional race track circuit, racing stripes, grandstands, performance venue',
    thumbnail: '🏁',
    category: 'track',
  },
  {
    id: 'drift-pad',
    name: 'Drift Pad',
    description: 'Dedicated drifting area',
    keywords: 'drift pad with tire marks, burnout area, performance driving surface',
    thumbnail: '💨',
    category: 'track',
  },
  {
    id: 'drag-strip',
    name: 'Drag Strip',
    description: 'Quarter mile drag racing strip',
    keywords: 'drag racing strip, starting line, straight acceleration track, racing venue',
    thumbnail: '🚦',
    category: 'track',
  },
];

export const getScenesByCategory = (category: Scene['category']): Scene[] => {
  return SCENE_LIBRARY.filter((s) => s.category === category);
};

export const getNegativePrompts = (): string[] => {
  return [
    'warped wheels',
    'deformed vehicle',
    'extra wheels',
    'wrong number of wheels',
    'smudged text',
    'blurry faces',
    'extra people',
    'distorted background',
    'fake logos',
    'wrong vehicle type',
    'alien headlights',
    'unrealistic proportions',
    'bad anatomy',
    'low quality',
    'pixelated',
    'watermark',
    'text artifacts',
    'duplicate elements',
    'merged objects',
    'floating parts',
  ];
};
