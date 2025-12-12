// Types
export type {
  CacheConfig,
  RedisCacheConfig,
  MemcacheCacheConfig,
  MemoryCacheConfig,
  SessionData,
  SessionOptions,
  CacheStats,
  HealthCheckResponse,
  BatchResult,
  CacheEntry
} from './types';

// Errors
export { CacheError } from './errors';

// Interfaces
export type { ICache, ISession } from './core/interfaces';

// Base Cache
export { BaseCache } from './core/BaseCache';

// Adapters
export { RedisCache } from './adapters/redis';
export { MemcacheCache } from './adapters/memcache';
export { MemoryCache } from './adapters/memory';

// Factory
export { CacheFactory } from './core/factory';

// Session
export { SessionStore } from './session';

// Middleware
export {
  cacheSessionMiddleware,
  cacheHealthCheckMiddleware,
  cacheResponseMiddleware
} from './middleware/express';
