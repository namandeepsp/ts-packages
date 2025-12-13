import type { MemoryCacheConfig, HealthCheckResponse } from '../../types';
import { BaseCache } from '../../core/BaseCache';
import { CacheError } from '../../errors';

/**
 * In-memory cache adapter for development and testing
 */
export class MemoryCache<T = unknown> extends BaseCache<T> {
  private store: Map<string, { value: T; expiresAt?: number }> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private memoryCacheConfig: MemoryCacheConfig) {
    super(memoryCacheConfig);
    this.startCleanup();
  }

  /**
   * Start periodic cleanup of expired items
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, 30000); // Cleanup every 30 seconds
  }

  /**
   * Get a value from memory
   */
  async get(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const entry = this.store.get(fullKey);

      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.store.delete(fullKey);
        this.recordMiss();
        return null;
      }

      this.recordHit();
      return entry.value;
    } catch (err) {
      throw new CacheError(
        `Failed to get key "${key}" from memory cache`,
        'MEMORY_GET_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Set a value in memory
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      const expiry = ttl ?? this.ttl;

      const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined;

      // Check max size
      const maxSize = this.memoryCacheConfig.maxSize;
      if (maxSize && this.store.size >= maxSize && !this.store.has(fullKey)) {
        // Remove oldest entry
        const firstKey = this.store.keys().next().value;
        if (firstKey) {
          this.store.delete(firstKey);
        }
      }

      this.store.set(fullKey, { value, expiresAt });
      this.recordSet();
    } catch (err) {
      throw new CacheError(
        `Failed to set key "${key}" in memory cache`,
        'MEMORY_SET_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Delete a key from memory
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const deleted = this.store.delete(fullKey);
      if (deleted) {
        this.recordDelete();
      }
      return deleted;
    } catch (err) {
      throw new CacheError(
        `Failed to delete key "${key}" from memory cache`,
        'MEMORY_DELETE_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const entry = this.store.get(fullKey);

      if (!entry) {
        return false;
      }

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.store.delete(fullKey);
        return false;
      }

      return true;
    } catch (err) {
      throw new CacheError(
        `Failed to check existence of key "${key}" in memory cache`,
        'MEMORY_EXISTS_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Clear all keys with current namespace
   */
  async clear(): Promise<void> {
    try {
      if (this.namespace) {
        // Clear only keys with current namespace
        for (const key of this.store.keys()) {
          if (key.startsWith(this.namespace)) {
            this.store.delete(key);
          }
        }
      } else {
        // Clear all
        this.store.clear();
      }
    } catch (err) {
      throw new CacheError(
        'Failed to clear memory cache',
        'MEMORY_CLEAR_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Get multiple values at once
   */
  async getMultiple(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result: Record<string, T | null> = {};
      const now = Date.now();

      for (const key of keys) {
        const fullKey = this.buildKey(key);
        const entry = this.store.get(fullKey);

        if (!entry) {
          this.recordMiss();
          result[key] = null;
          continue;
        }

        // Check if expired
        if (entry.expiresAt && entry.expiresAt < now) {
          this.store.delete(fullKey);
          this.recordMiss();
          result[key] = null;
        } else {
          this.recordHit();
          result[key] = entry.value;
        }
      }

      return result;
    } catch (err) {
      throw new CacheError(
        'Failed to get multiple keys from memory cache',
        'MEMORY_GET_MULTIPLE_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Set multiple values at once
   */
  async setMultiple(data: Record<string, T>, ttl?: number): Promise<void> {
    try {
      const expiry = ttl ?? this.ttl;
      const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined;

      for (const [key, value] of Object.entries(data)) {
        const fullKey = this.buildKey(key);
        this.store.set(fullKey, { value, expiresAt });
      }

      this.stats.sets += Object.keys(data).length;
    } catch (err) {
      throw new CacheError(
        'Failed to set multiple keys in memory cache',
        'MEMORY_SET_MULTIPLE_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Delete multiple keys at once
   */
  async deleteMultiple(keys: string[]): Promise<number> {
    try {
      let count = 0;
      for (const key of keys) {
        const fullKey = this.buildKey(key);
        if (this.store.delete(fullKey)) {
          count++;
        }
      }
      this.stats.deletes += count;
      return count;
    } catch (err) {
      throw new CacheError(
        'Failed to delete multiple keys from memory cache',
        'MEMORY_DELETE_MULTIPLE_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const fullKey = this.buildKey(key);
      const entry = this.store.get(fullKey);

      const current =
        entry && (!entry.expiresAt || entry.expiresAt >= Date.now())
          ? (typeof entry.value === 'number' ? entry.value : 0)
          : 0;

      const value = current + amount;

      const expiry = this.ttl;
      const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined;

      this.store.set(fullKey, { value: value as T, expiresAt });
      return value;
    } catch (err) {
      throw new CacheError(
        `Failed to increment key "${key}" in memory cache`,
        'MEMORY_INCREMENT_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      const fullKey = this.buildKey(key);
      const entry = this.store.get(fullKey);

      const current =
        entry && (!entry.expiresAt || entry.expiresAt >= Date.now())
          ? (typeof entry.value === 'number' ? entry.value : 0)
          : 0;

      const value = current - amount;

      const expiry = this.ttl;
      const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined;

      this.store.set(fullKey, { value: value as T, expiresAt });
      return value;
    } catch (err) {
      throw new CacheError(
        `Failed to decrement key "${key}" in memory cache`,
        'MEMORY_DECREMENT_ERROR',
        'memory',
        err as Error
      );
    }
  }

  /**
   * Check if memory cache is alive
   */
  async isAlive(): Promise<HealthCheckResponse> {
    return {
      isAlive: true,
      adapter: 'memory',
      timestamp: new Date()
    };
  }

  /**
   * Close memory cache
   */
  async close(): Promise<void> {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.store.clear();
    } catch (err) {
      throw new CacheError(
        'Failed to close memory cache',
        'MEMORY_CLOSE_ERROR',
        'memory',
        err as Error
      );
    }
  }
}
