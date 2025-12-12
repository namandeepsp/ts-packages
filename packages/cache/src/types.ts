/**
 * Cache configuration options
 */
export interface CacheConfig {
  adapter: 'redis' | 'memcache' | 'memory';
  namespace?: string;
  ttl?: number; // Default TTL in seconds
  fallback?: boolean; // Enable fallback to memory cache
}

/**
 * Redis-cluster configuration
 */
export interface RedisClusterConfig {
  nodes: Array<{
    host: string;
    port: number;
  }>;
  options?: {
    enableReadyCheck?: boolean;
    maxRedirections?: number;
    retryDelayOnFailover?: number;
    retryDelayOnClusterDown?: number;
  };
}

/**
 * Redis-specific configuration
 */
export interface RedisCacheConfig extends CacheConfig {
  adapter: 'redis';
  // Existing single-instance
  host?: string;
  port?: number;
  // New cluster support
  cluster?: RedisClusterConfig | Array<{ host: string; port: number }>;
  username?: string;
  password?: string;
  db?: number;
  tls?: boolean;
}

/**
 * Memcache-specific configuration
 */
export interface MemcacheCacheConfig extends CacheConfig {
  adapter: 'memcache';
  servers: string | string[];
  username?: string;
  password?: string;
}

/**
 * Memory cache configuration
 */
export interface MemoryCacheConfig extends CacheConfig {
  adapter: 'memory';
  maxSize?: number; // Maximum number of items
}

/**
 * Session data structure
 */
export interface SessionData {
  [key: string]: unknown;
}

/**
 * Session store options
 */
export interface SessionOptions {
  ttl?: number;
  serialize?: (data: SessionData) => string;
  deserialize?: (data: string) => SessionData;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  isAlive: boolean;
  adapter: string;
  timestamp: Date;
  error?: string;
}

/**
 * Batch operation result
 */
export interface BatchResult<T> {
  [key: string]: T | null;
}

/**
 * Cache key with optional metadata
 */
export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt?: number;
  createdAt: number;
}
