import { Template, GeneratedImage } from '../types';

const STORAGE_KEYS = {
  TEMPLATES: 'slingmods_templates',
  HISTORY: 'slingmods_history',
  SETTINGS: 'slingmods_settings',
};

// Template Management
export const saveTemplate = (template: Template): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const getTemplates = (): Template[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const toggleTemplateFavorite = (id: string): void => {
  const templates = getTemplates();
  const template = templates.find(t => t.id === id);
  if (template) {
    template.isFavorite = !template.isFavorite;
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }
};

// History Management
export const saveToHistory = (image: GeneratedImage): void => {
  const history = getHistory();
  history.unshift(image); // Add to beginning

  // Keep only last 100 images
  const trimmedHistory = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
};

export const getHistory = (): GeneratedImage[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = (): void => {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
};

export const deleteFromHistory = (id: string): void => {
  const history = getHistory().filter(img => img.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

// Settings Management
export const saveSettings = (settings: any): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = (): any => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : null;
};

// Export/Import
export const exportData = (): string => {
  return JSON.stringify({
    templates: getTemplates(),
    history: getHistory(),
    settings: getSettings(),
    exportedAt: Date.now(),
  });
};

export const importData = (jsonData: string): void => {
  try {
    const data = JSON.parse(jsonData);
    if (data.templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
    }
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
  } catch (error) {
    throw new Error('Invalid data format');
  }
};
