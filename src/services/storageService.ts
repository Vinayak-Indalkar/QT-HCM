/**
 * Type-safe storage service abstraction providing safe access to browser storage
 * with JSON parsing, error handling, quota-exceeded self-healing, and graceful fallback.
 * Adheres to Enterprise Software Refactoring & Architecture Standard (Service Layer).
 */

const BULKY_KEY_PREFIXES = [
  'onboarding_flow_',
  'quantira_doc_preview_',
  'quantira_temp_',
  'quantira_audit_'
];

export const storageService = {
  /**
   * Checks whether an error is a browser storage quota exceeded error.
   */
  isQuotaError(error: any): boolean {
    if (!error) return false;
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014 ||
      error.number === -2147024882 ||
      (typeof error.message === 'string' &&
        (error.message.toLowerCase().includes('quota') ||
          error.message.toLowerCase().includes('exceeded') ||
          error.message.toLowerCase().includes('storage full')))
    );
  },

  /**
   * Safely retrieves and parses an item from LocalStorage.
   * @param key Storage key
   * @param defaultValue Fallback value if key is not found or corrupted
   */
  getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
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
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      return localStorage.getItem(key) ?? fallback;
    } catch (error) {
      console.warn(`[storageService] Failed to get raw key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Safely stores a serialized object/primitive to LocalStorage with automatic QuotaExceeded recovery.
   * @param key Storage key
   * @param value Value to serialize and store
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      if (this.isQuotaError(error)) {
        console.warn(`[storageService] Storage quota exceeded while setting key "${key}". Running auto-recovery...`);
        try {
          this.cleanupBulkyKeys(key);

          // Retry write after cleanup
          let payloadToSave: string;
          if (key === 'quantira_onboarding_candidates' && Array.isArray(value)) {
            // Sanitize heavy base64 strings in candidate records
            const sanitized = this.sanitizeCandidateRecords(value as any[]);
            payloadToSave = JSON.stringify(sanitized);
          } else {
            payloadToSave = typeof value === 'string' ? value : JSON.stringify(value);
          }

          localStorage.setItem(key, payloadToSave);
          console.info(`[storageService] Successfully recovered and saved key "${key}" after storage pruning.`);
          return true;
        } catch (retryError) {
          console.error(`[storageService] Quota auto-recovery failed for key "${key}". Suppressed to prevent app crash:`, retryError);
          return false;
        }
      }

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
      if (typeof window === 'undefined' || !window.localStorage) return false;
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
      if (typeof window === 'undefined' || !window.localStorage) return false;
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Sanitizes candidate records to ensure oversized base64 images/attachments don't consume entire quota.
   */
  sanitizeCandidateRecords(candidates: any[]): any[] {
    return candidates.map((cand) => {
      const sanitized = { ...cand };
      // Strip oversized base64 data URLs in avatarUrl (> 30KB)
      if (typeof sanitized.avatarUrl === 'string' && sanitized.avatarUrl.startsWith('data:') && sanitized.avatarUrl.length > 30000) {
        sanitized.avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
      }
      return sanitized;
    });
  },

  /**
   * Cleans up non-essential, temporary, or bulky keys to free up browser quota.
   * @param protectedKey Key that should not be deleted during cleanup
   */
  cleanupBulkyKeys(protectedKey?: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const keysToRemove: string[] = [];
      const activeEmployeeId = localStorage.getItem('quantira_active_onboarding_id');

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || k === protectedKey) continue;

        // Clean up temporary doc previews or old draft flows
        if (
          BULKY_KEY_PREFIXES.some((prefix) => k.startsWith(prefix)) &&
          k !== `onboarding_flow_${activeEmployeeId}`
        ) {
          keysToRemove.push(k);
        }
      }

      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      console.info(`[storageService] Cleaned up ${keysToRemove.length} temporary storage keys.`);
    } catch (err) {
      console.warn('[storageService] cleanupBulkyKeys encountered an error:', err);
    }
  },

  /**
   * Clears all Quantira local data and resets browser storage cleanly.
   */
  clearAllQuantiraData(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('quantira_') || k.startsWith('onboarding_') || k.startsWith('tour_') || k === 'active_theme')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      console.info(`[storageService] Cleared ${keysToRemove.length} Quantira storage keys.`);
    } catch (err) {
      console.error('[storageService] Failed to clear Quantira data:', err);
    }
  }
};
