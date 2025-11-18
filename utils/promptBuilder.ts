import { VehicleType, PromptComponent } from '../types';

export const VEHICLE_DESCRIPTIONS = {
  [VehicleType.RYKER]: 'Can-Am Ryker three-wheel motorcycle with aggressive sporty design',
  [VehicleType.SPYDER_F3]: 'Can-Am Spyder F3 three-wheel motorcycle with Y-frame architecture and sporty stance',
  [VehicleType.SPYDER_RT]: 'Can-Am Spyder RT three-wheel touring motorcycle with comfortable seating and premium features',
  [VehicleType.SLINGSHOT]: 'Polaris Slingshot three-wheel open-air roadster with side-by-side seating',
};

export const ACTION_PRESETS = [
  'Dynamic high-speed action shot',
  'Drifting through sharp corners',
  'Accelerating down straight highway',
  'Parked in aggressive stance',
  'Leaning into tight turn',
  'Launching from standstill with tire smoke',
  'Carving through mountain switchbacks',
  'Cruising at sunset',
  'Racing along coastal highway',
  'Wheelie (front wheel lift)',
];

export const SETTING_PRESETS = [
  'Winding mountain pass at golden hour',
  'Neon-lit city streets at night',
  'Empty desert highway with dramatic sky',
  'Professional studio with clean background',
  'Tropical coastal road with palm trees',
  'Industrial warehouse district',
  'Mountain summit overlook',
  'Race track with grandstands',
  'Underground parking garage',
  'Scenic overlook with panoramic views',
];

export const STYLE_PRESETS = [
  'Hyperrealistic 8K photography',
  'Cinematic film grain aesthetic',
  'Vibrant saturated colors',
  'High contrast dramatic tones',
  'Unreal Engine 5 render quality',
  'Magazine cover professional photography',
  'GoPro wide-angle perspective',
  'Drone aerial shot',
  'Low-angle hero shot',
  'Motion blur with sharp subject',
];

export const LIGHTING_PRESETS = [
  'Golden hour warm lighting',
  'Dramatic sunset backlight',
  'Moody overcast atmosphere',
  'Bright midday sun with harsh shadows',
  'Blue hour twilight ambiance',
  'Neon and artificial city lights',
  'Studio lighting with rim light',
  'Dramatic storm clouds with sun rays',
  'Night photography with light trails',
  'Soft diffused lighting',
];

export const buildPrompt = (components: PromptComponent): string => {
  const parts: string[] = [];

  if (components.vehicle) {
    parts.push(VEHICLE_DESCRIPTIONS[components.vehicle]);
  }

  if (components.action) {
    parts.push(components.action);
  }

  if (components.setting) {
    parts.push(components.setting);
  }

  if (components.lighting) {
    parts.push(components.lighting);
  }

  if (components.style) {
    parts.push(components.style);
  }

  if (components.additional) {
    parts.push(components.additional);
  }

  return parts.join(', ');
};

export const enhancePrompt = (simplePrompt: string, vehicle?: VehicleType): string => {
  let enhanced = simplePrompt;

  if (vehicle && !simplePrompt.toLowerCase().includes('can-am') && !simplePrompt.toLowerCase().includes('polaris')) {
    enhanced = `${VEHICLE_DESCRIPTIONS[vehicle]}, ${enhanced}`;
  }

  // Add quality enhancers if not present
  const qualityKeywords = ['8k', '4k', 'hyperrealistic', 'photorealistic', 'high quality', 'professional'];
  const hasQuality = qualityKeywords.some(kw => enhanced.toLowerCase().includes(kw));

  if (!hasQuality) {
    enhanced += ', hyperrealistic 8K professional photography';
  }

  // Add cinematic if action-oriented
  const actionKeywords = ['driving', 'racing', 'drifting', 'speed', 'action'];
  const hasAction = actionKeywords.some(kw => enhanced.toLowerCase().includes(kw));

  if (hasAction && !enhanced.toLowerCase().includes('cinematic')) {
    enhanced += ', cinematic composition';
  }

  return enhanced;
};
