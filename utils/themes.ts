export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradient: string;
}

export const THEMES: Record<string, Theme> = {
  carbon: {
    id: 'carbon',
    name: 'SlingMods Carbon',
    description: 'Default dark theme with orange accents',
    colors: {
      primary: '#ff6b00',
      secondary: '#00d4ff',
      accent: '#10b981',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
    },
    gradient: 'from-orange-500 to-red-600',
  },

  f1: {
    id: 'f1',
    name: 'F1 Pit Crew',
    description: 'Red and black racing theme',
    colors: {
      primary: '#dc2626',
      secondary: '#fbbf24',
      accent: '#ef4444',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a3a3a3',
    },
    gradient: 'from-red-600 to-yellow-500',
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset Ride',
    description: 'Warm sunset-inspired colors',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      background: '#18181b',
      surface: '#27272a',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
    },
    gradient: 'from-orange-500 via-pink-500 to-purple-600',
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight Garage',
    description: 'Deep blue and purple theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0c0a1a',
      surface: '#1a1625',
      text: '#f0f9ff',
      textSecondary: '#94a3b8',
    },
    gradient: 'from-blue-600 via-purple-600 to-cyan-500',
  },
};

export const applyTheme = (themeId: string): void => {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
};

export const getTheme = (themeId: string): Theme => {
  return THEMES[themeId] || THEMES.carbon;
};
