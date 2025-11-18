import { Template, GeneratedImage } from '../types';
import { generateThumbnail, getJsonSizeInBytes } from './imageUtils';

const STORAGE_KEYS = {
  TEMPLATES: 'slingmods_templates',
  HISTORY: 'slingmods_history',
  SETTINGS: 'slingmods_settings',
  LAST_RIDE: 'sm_lastRide',
  LAST_MODEL: 'sm_lastModel',
};

const MAX_HISTORY_ITEMS = 20;
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

// Lightweight history item for storage
export interface HistoryItem {
  id: string;
  createdAt: number;
  prompt: string;
  model: string;
  vehicle?: string;
  thumbDataUrl: string; // Compressed thumbnail instead of full image
  settings?: any;
}

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

// History Management with Thumbnail Compression
export const saveToHistory = async (image: GeneratedImage): Promise<void> => {
  try {
    // Generate compressed thumbnail (320px wide, 0.6 quality)
    const thumbDataUrl = await generateThumbnail(image.url, 320, 0.6);

    const historyItem: HistoryItem = {
      id: image.id,
      createdAt: image.timestamp,
      prompt: image.prompt,
      model: image.model,
      vehicle: image.vehicle,
      thumbDataUrl,
      settings: image.settings,
    };

    let history = getHistory();
    history.unshift(historyItem); // Add to beginning

    // Cap at MAX_HISTORY_ITEMS
    history = history.slice(0, MAX_HISTORY_ITEMS);

    // Check size and evict if needed
    let historySize = getJsonSizeInBytes(history);
    while (historySize > MAX_STORAGE_SIZE && history.length > 1) {
      history.pop(); // Remove oldest
      historySize = getJsonSizeInBytes(history);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      // If still fails, keep only the newest item
      console.warn('History storage full, keeping only latest item');
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([historyItem]));
      throw new Error('History full — kept your latest, trimmed older');
    }
  } catch (error) {
    console.error('Failed to save to history:', error);
    throw error;
  }
};

export const getHistory = (): HistoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const getHistoryCount = (): number => {
  return getHistory().length;
};

export const getHistoryStorageInfo = (): { count: number; maxCount: number; sizeBytes: number; maxSizeBytes: number } => {
  const history = getHistory();
  return {
    count: history.length,
    maxCount: MAX_HISTORY_ITEMS,
    sizeBytes: getJsonSizeInBytes(history),
    maxSizeBytes: MAX_STORAGE_SIZE,
  };
};

export const clearHistory = (): void => {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
};

export const deleteFromHistory = (id: string): void => {
  const history = getHistory().filter(img => img.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

// Last used ride and model persistence
export const saveLastRide = (ride: string): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_RIDE, ride);
};

export const getLastRide = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_RIDE);
};

export const saveLastModel = (model: string): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_MODEL, model);
};

export const getLastModel = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_MODEL);
};

// Section collapse state
export const saveSectionState = (sectionId: string, isExpanded: boolean): void => {
  const key = `section_${sectionId}`;
  localStorage.setItem(key, JSON.stringify(isExpanded));
};

export const getSectionState = (sectionId: string, defaultExpanded: boolean = false): boolean => {
  const key = `section_${sectionId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultExpanded;
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
