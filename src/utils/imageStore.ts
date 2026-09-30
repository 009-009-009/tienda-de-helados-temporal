// Client-side IndexedDB store for official catalog product photos
const DB_NAME = 'joly_catalog_images';
const STORE_NAME = 'images';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCustomImage(fileName: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileName);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    // Fallback to localStorage
    try {
      return localStorage.getItem(`joly_img_${fileName}`);
    } catch {
      return null;
    }
  }
}

export async function saveCustomImage(fileName: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, fileName);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      localStorage.setItem(`joly_img_${fileName}`, dataUrl);
    } catch {
      // ignore
    }
  }

  // Dispatch global event for instant re-render
  window.dispatchEvent(new CustomEvent('catalog-image-updated', { detail: { fileName } }));
}

export async function removeCustomImage(fileName: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fileName);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(`joly_img_${fileName}`);
  }

  window.dispatchEvent(new CustomEvent('catalog-image-updated', { detail: { fileName } }));
}

export const OFFICIAL_LOGO_KEY = 'joly-brand-logo';

export async function getCustomLogo(): Promise<string | null> {
  return getCustomImage(OFFICIAL_LOGO_KEY);
}

export async function saveCustomLogo(dataUrl: string): Promise<void> {
  return saveCustomImage(OFFICIAL_LOGO_KEY, dataUrl);
}

export async function removeCustomLogo(): Promise<void> {
  return removeCustomImage(OFFICIAL_LOGO_KEY);
}

export async function getAllCustomImages(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const result: Record<string, string> = {};

      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          result[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch {
    const result: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('joly_img_')) {
        const fileName = key.replace('joly_img_', '');
        const val = localStorage.getItem(key);
        if (val) result[fileName] = val;
      }
    }
    return result;
  }
}

export async function exportImagesBackupJSON(): Promise<string> {
  const images = await getAllCustomImages();
  return JSON.stringify(images, null, 2);
}

export async function importImagesBackupJSON(jsonStr: string): Promise<number> {
  try {
    const data = JSON.parse(jsonStr) as Record<string, string>;
    let count = 0;
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string' && val.length > 0) {
        await saveCustomImage(key, val);
        count++;
      }
    }
    window.dispatchEvent(new CustomEvent('catalog-image-updated', { detail: { fileName: 'all' } }));
    return count;
  } catch (err) {
    console.error('Error importing backup JSON:', err);
    throw new Error('El archivo de respaldo no es válido.');
  }
}

