type AsyncStorageValue = string | null;

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const AsyncStorage = {
  async getItem(key: string): Promise<AsyncStorageValue> {
    const storage = getStorage();
    return storage ? storage.getItem(key) : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    }
  },
  async clear(): Promise<void> {
    const storage = getStorage();
    if (storage) {
      storage.clear();
    }
  },
  async getAllKeys(): Promise<string[]> {
    const storage = getStorage();
    if (!storage) return [];
    return Object.keys(storage);
  },
  async multiGet(keys: string[]): Promise<[string, AsyncStorageValue][]> {
    const storage = getStorage();
    if (!storage) return keys.map((key) => [key, null]);
    return keys.map((key) => [key, storage.getItem(key)]);
  },
  async multiSet(entries: [string, string][]): Promise<void> {
    const storage = getStorage();
    if (!storage) return;
    entries.forEach(([key, value]) => {
      storage.setItem(key, value);
    });
  },
  async multiRemove(keys: string[]): Promise<void> {
    const storage = getStorage();
    if (!storage) return;
    keys.forEach((key) => storage.removeItem(key));
  },
};

export default AsyncStorage;
