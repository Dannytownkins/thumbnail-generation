import { openDB } from 'idb';
import { ExportLog, GeneratedImage } from '../types';
import { personalProfile } from '../config/personalProfile';

const DB_NAME = 'slingmods-thumbnail';
const HISTORY_STORE = 'history';
const EXPORT_STORE = 'exports';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(HISTORY_STORE)) {
      const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
      historyStore.createIndex('cacheKey', 'cacheKey', { unique: false });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    if (!db.objectStoreNames.contains(EXPORT_STORE)) {
      db.createObjectStore(EXPORT_STORE, { keyPath: 'id' });
    }
  },
});

const sortHistory = (items: GeneratedImage[]) =>
  [...items].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

export const saveImagesToHistory = async (images: GeneratedImage[]) => {
  const db = await dbPromise;
  const tx = db.transaction(HISTORY_STORE, 'readwrite');
  for (const image of images) {
    await tx.store.put(image);
  }
  await tx.done;

  // trim
  const history = await getHistory();
  if (history.length > personalProfile.cacheLimit) {
    const toDelete = history.slice(personalProfile.cacheLimit);
    const deleteTx = db.transaction(HISTORY_STORE, 'readwrite');
    for (const img of toDelete) {
      await deleteTx.store.delete(img.id);
    }
    await deleteTx.done;
  }
};

export const getHistory = async (): Promise<GeneratedImage[]> => {
  const db = await dbPromise;
  const records = await db.getAll(HISTORY_STORE);
  return sortHistory(records);
};

export const getImagesByCacheKey = async (cacheKey: string): Promise<GeneratedImage[]> => {
  const db = await dbPromise;
  const index = db.transaction(HISTORY_STORE).store.index('cacheKey');
  const results = await index.getAll(cacheKey);
  return sortHistory(results);
};

export const updateHistoryImage = async (
  id: string,
  updates: Partial<GeneratedImage>,
): Promise<void> => {
  const db = await dbPromise;
  const existing = await db.get(HISTORY_STORE, id);
  if (!existing) return;
  await db.put(HISTORY_STORE, { ...existing, ...updates });
};

export const deleteHistoryImage = async (id: string): Promise<void> => {
  const db = await dbPromise;
  await db.delete(HISTORY_STORE, id);
};

export const clearHistory = async (): Promise<void> => {
  const db = await dbPromise;
  await db.clear(HISTORY_STORE);
};

export const logExport = async (log: ExportLog): Promise<void> => {
  const db = await dbPromise;
  await db.put(EXPORT_STORE, log);
  const image = await db.get(HISTORY_STORE, log.imageId);
  if (image) {
    const existingLogs = Array.isArray(image.exportLogs) ? image.exportLogs : [];
    await db.put(HISTORY_STORE, { ...image, exportLogs: [...existingLogs, log] });
  }
};

export const getExportLogs = async (imageId?: string): Promise<ExportLog[]> => {
  const db = await dbPromise;
  const logs = await db.getAll(EXPORT_STORE);
  if (imageId) {
    return logs.filter((log) => log.imageId === imageId);
  }
  return logs;
};

