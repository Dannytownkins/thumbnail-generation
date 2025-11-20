export interface PromptModule {
  id: string;
  name: string;
  category: 'motion' | 'lighting' | 'angle' | 'quality' | 'style' | 'atmosphere';
  keywords: string;
  description: string;
  icon: string;
}

export const PROMPT_MODULES: PromptModule[] = [
  // Motion & Speed
  {
    id: 'motion-blur',
    name: 'Motion Blur',
    category: 'motion',
    keywords: 'dynamic motion blur, speed lines, sense of velocity',
    description: 'Adds motion blur and speed effects',
    icon: '💨',
  },
  {
    id: 'high-speed',
    name: 'High Speed',
    category: 'motion',
    keywords: 'high speed action, fast movement, dynamic energy',
    description: 'Emphasizes speed and action',
    icon: '⚡',
  },
  {
    id: 'drifting',
    name: 'Drifting',
    category: 'motion',
    keywords: 'drifting with tire smoke, controlled slide, aggressive cornering',
    description: 'Adds drifting effects',
    icon: '🌪️',
  },
  {
    id: 'static-power',
    name: 'Static Power',
    category: 'motion',
    keywords: 'powerful stance, stationary but aggressive, ready to launch',
    description: 'Powerful but still',
    icon: '💪',
  },

  // Expert Lighting
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'lighting',
    keywords: 'golden hour lighting, warm sunset glow, dramatic backlighting',
    description: 'Warm sunset lighting',
    icon: '🌅',
  },
  {
    id: 'studio-lighting',
    name: 'Studio Lighting',
    category: 'lighting',
    keywords: 'professional studio lighting, rim lights, key light with fill',
    description: 'Professional studio setup',
    icon: '💡',
  },
  {
    id: 'dramatic-shadows',
    name: 'Dramatic Shadows',
    category: 'lighting',
    keywords: 'high contrast dramatic shadows, moody lighting, chiaroscuro',
    description: 'High contrast shadows',
    icon: '🌑',
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    category: 'lighting',
    keywords: 'neon lights, vibrant glow, electric atmosphere, cyberpunk lighting',
    description: 'Neon and glow effects',
    icon: '🌈',
  },

  // Hero Angles
  {
    id: 'low-angle',
    name: 'Low Angle Hero',
    category: 'angle',
    keywords: 'low angle hero shot, dramatic perspective, looking up at vehicle',
    description: 'Dramatic low angle',
    icon: '📐',
  },
  {
    id: 'three-quarter',
    name: '3/4 View',
    category: 'angle',
    keywords: 'three-quarter view, dynamic angle, showing front and side',
    description: 'Classic 3/4 perspective',
    icon: '📸',
  },
  {
    id: 'aerial-view',
    name: 'Aerial View',
    category: 'angle',
    keywords: 'aerial view, top-down perspective, bird\'s eye view',
    description: 'Overhead shot',
    icon: '🚁',
  },
  {
    id: 'action-tracking',
    name: 'Action Tracking',
    category: 'angle',
    keywords: 'dynamic tracking shot, following the action, motion camera',
    description: 'Following the movement',
    icon: '🎥',
  },

  // Quality & Detail
  {
    id: 'hyperrealistic',
    name: 'Hyperrealistic',
    category: 'quality',
    keywords: 'hyperrealistic 8K photography, extreme detail, photorealistic',
    description: 'Maximum realism',
    icon: '🔍',
  },
  {
    id: 'sharp-focus',
    name: 'Sharp Focus',
    category: 'quality',
    keywords: 'tack sharp focus on subject, crystal clear details, no blur',
    description: 'Ultra sharp vehicle',
    icon: '🎯',
  },
  {
    id: 'bokeh-background',
    name: 'Bokeh Background',
    category: 'quality',
    keywords: 'sharp foreground with soft bokeh background, depth of field',
    description: 'Blurred background',
    icon: '⭕',
  },
  {
    id: 'cinematic-grain',
    name: 'Cinematic Grain',
    category: 'quality',
    keywords: 'cinematic film grain, professional movie aesthetic',
    description: 'Film-like quality',
    icon: '🎬',
  },

  // Style
  {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    category: 'style',
    keywords: 'magazine cover quality, professional editorial photography',
    description: 'Editorial style',
    icon: '📰',
  },
  {
    id: 'epic-cinematic',
    name: 'Epic Cinematic',
    category: 'style',
    keywords: 'epic cinematic composition, movie poster aesthetic, dramatic',
    description: 'Movie poster feel',
    icon: '🎭',
  },
  {
    id: 'unreal-engine',
    name: 'Unreal Engine',
    category: 'style',
    keywords: 'Unreal Engine 5 render quality, CGI perfection, ray tracing',
    description: 'Video game quality',
    icon: '🎮',
  },
  {
    id: 'gta-style',
    name: 'GTA Style',
    category: 'style',
    keywords: 'GTA loading screen style, stylized realism, saturated colors',
    description: 'Grand Theft Auto look',
    icon: '🕹️',
  },

  // Atmosphere
  {
    id: 'explosive',
    name: 'Explosive',
    category: 'atmosphere',
    keywords: 'explosion in background, dramatic fire effects, action movie',
    description: 'Add explosions',
    icon: '💥',
  },
  {
    id: 'rain-wet',
    name: 'Rain & Wet',
    category: 'atmosphere',
    keywords: 'wet surface reflections, rain atmosphere, dramatic weather',
    description: 'Wet and rainy',
    icon: '🌧️',
  },
  {
    id: 'dust-particles',
    name: 'Dust & Particles',
    category: 'atmosphere',
    keywords: 'atmospheric dust particles, light rays through mist',
    description: 'Atmospheric particles',
    icon: '✨',
  },
  {
    id: 'smoke-fog',
    name: 'Smoke & Fog',
    category: 'atmosphere',
    keywords: 'dramatic smoke and fog, atmospheric haze, moody environment',
    description: 'Fog effects',
    icon: '🌫️',
  },
];

export const buildModularPrompt = (
  basePrompt: string,
  activeModules: string[],
  negativePrompt?: string,
): { enhancedPrompt: string; moduleKeywords: string[]; negativePrompt?: string } => {
  const selectedModules = PROMPT_MODULES.filter((m) => activeModules.includes(m.id));
  const moduleKeywords = selectedModules.map((m) => m.keywords);

  let enhancedPrompt = basePrompt;

  if (moduleKeywords.length > 0) {
    enhancedPrompt += ', ' + moduleKeywords.join(', ');
  }

  return {
    enhancedPrompt,
    moduleKeywords,
    negativePrompt: negativePrompt?.trim(),
  };
};

export const getModulesByCategory = (category: PromptModule['category']): PromptModule[] => {
  return PROMPT_MODULES.filter((m) => m.category === category);
};
