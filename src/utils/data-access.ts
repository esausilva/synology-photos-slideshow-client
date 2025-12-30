const DB_NAME = 'SynologyPhotosSlideshow';
const DB_VERSION = 1;
const STORE_NAME = 'Settings';
const RECORD_KEY = 1; // Use a fixed key for the single settings record

export interface SlideshowSettings {
  random: boolean;
  intervalInMs: number;
}

interface SlideshowSettingsRecord extends SlideshowSettings {
  id: number;
}

export const seedSettings: SlideshowSettings = {
  random: true,
  intervalInMs: 20000,
};

export const initializeDb: () => Promise<void> = async () => {
  await upsertSlideshowSettings(seedSettings);
};

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error(
        'IndexedDB error:',
        (event.target as IDBOpenDBRequest).error,
      );
      reject('Database error');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create the object store only if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // The 'keyPath' is set to null, meaning we use an auto-generated or specified key
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function upsertSlideshowSettings(
  slideshowSettings: SlideshowSettings,
): Promise<void> {
  const db = await openIndexedDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const record: SlideshowSettingsRecord = {
    id: RECORD_KEY,
    random: slideshowSettings.random,
    intervalInMs: slideshowSettings.intervalInMs,
  };

  // Use put() for upsert operation
  const request = store.put(record, RECORD_KEY);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      console.error('Store/Update failed:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function getSlideshowSettings(): Promise<SlideshowSettingsRecord | null> {
  const db = await openIndexedDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  // Retrieve the record by its fixed key
  const request = store.get(RECORD_KEY);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      // The result will be the record object or undefined
      resolve(
        (event.target as IDBRequest<SlideshowSettingsRecord>).result || null,
      );
    };
    request.onerror = (event) => {
      console.error('Retrieve failed:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}
