/**
 * Safe storage wrapper with in-memory fallback.
 * Prevents fatal DOMExceptions (QuotaExceededError, SecurityError)
 * in restricted iframes, private browsing modes, and storage-disabled environments.
 */

const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          memoryStore.set(key, item);
          return item;
        }
      }
    } catch (err) {
      console.warn(`[safeStorage] Failed to read "${key}" from localStorage:`, err);
    }
    return memoryStore.get(key) || null;
  },

  setItem: (key: string, value: string): boolean => {
    // Always keep in memory store as fallback
    memoryStore.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (err) {
      console.warn(`[safeStorage] Failed to write "${key}" to localStorage:`, err);
    }
    return false;
  },

  removeItem: (key: string): boolean => {
    memoryStore.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }
    } catch (err) {
      console.warn(`[safeStorage] Failed to remove "${key}" from localStorage:`, err);
    }
    return false;
  },

  clear: (): boolean => {
    memoryStore.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return true;
      }
    } catch (err) {
      console.warn('[safeStorage] Failed to clear localStorage:', err);
    }
    return false;
  },
};
