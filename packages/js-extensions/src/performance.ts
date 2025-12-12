// Performance optimization utilities
export interface PerformanceConfig {
  enableCaching?: boolean;
  maxCacheSize?: number;
  enableValidation?: boolean;
}

const defaultConfig: PerformanceConfig = {
  enableCaching: false,
  maxCacheSize: 100,
  enableValidation: true
};

let config: PerformanceConfig = { ...defaultConfig };

export function setPerformanceConfig(newConfig: Partial<PerformanceConfig>): void {
  config = { ...config, ...newConfig };
}

export function getPerformanceConfig(): PerformanceConfig {
  return { ...config };
}

// Simple LRU cache for expensive operations
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new LRUCache(config.maxCacheSize);

export function withCache<T>(key: string, fn: () => T): T {
  if (!config.enableCaching) {
    return fn();
  }

  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached as T;
  }

  const result = fn();
  cache.set(key, result);
  return result;
}