/**
 * Type-safe storage service abstraction providing safe access to browser storage
 * with JSON parsing, error handling, and graceful fallback.
 * Adheres to Enterprise Software Refactoring & Architecture Standard (Service Layer).
 */

export const storageService = {
  /**
   * Safely retrieves and parses an item from LocalStorage.
   * @param key Storage key
   * @param defaultValue Fallback value if key is not found or corrupted
   */
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[storageService] Failed to parse key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Safely retrieves raw string value from LocalStorage.
   * @param key Storage key
   * @param fallback Default string if not found
   */
  getRaw(key: string, fallback: string | null = null): string | null {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch (error) {
      console.warn(`[storageService] Failed to get raw key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Safely stores a serialized object/primitive to LocalStorage.
   * @param key Storage key
   * @param value Value to serialize and store
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error(`[storageService] Failed to set key "${key}":`, error);
      return false;
    }
  },

  /**
   * Safely removes an item from LocalStorage.
   * @param key Storage key
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[storageService] Failed to remove key "${key}":`, error);
      return false;
    }
  },

  /**
   * Checks if an item exists in LocalStorage.
   * @param key Storage key
   */
  hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
};
