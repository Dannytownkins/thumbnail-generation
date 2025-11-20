import { Template, GeneratedImage, StylePreset } from '../types';
import {
  saveImagesToHistory,
  getHistory as getHistoryFromDb,
  clearHistory as clearHistoryFromDb,
  deleteHistoryImage,
} from './historyStore';

const STORAGE_KEYS = {
  TEMPLATES: 'slingmods_templates',
  SETTINGS: 'slingmods_settings',
  LAST_SESSION: 'slingmods_last_session',
  STYLE_PRESETS: 'slingmods_style_presets',
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
export const saveToHistory = async (image: GeneratedImage): Promise<void> => {
  await saveImagesToHistory([image]);
};

export const saveManyToHistory = async (images: GeneratedImage[]): Promise<void> => {
  await saveImagesToHistory(images);
};

export const getHistory = async (): Promise<GeneratedImage[]> => {
  return getHistoryFromDb();
};

export const clearHistory = async (): Promise<void> => {
  await clearHistoryFromDb();
};

export const deleteFromHistory = async (id: string): Promise<void> => {
  await deleteHistoryImage(id);
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

export const saveLastSession = (snapshot: any): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(snapshot));
};

export const loadLastSession = (): any | null => {
  const data = localStorage.getItem(STORAGE_KEYS.LAST_SESSION);
  return data ? JSON.parse(data) : null;
};

export const saveStylePresets = (presets: StylePreset[]): void => {
  localStorage.setItem(STORAGE_KEYS.STYLE_PRESETS, JSON.stringify(presets));
};

export const getStylePresets = (): StylePreset[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STYLE_PRESETS);
  return data ? JSON.parse(data) : [];
};
