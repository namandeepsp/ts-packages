# @naman_deep_singh/cache

**Version:** 1.2.0 (with Redis Clustering support)

A flexible, extensible caching layer with support for Redis, Memcache, and in-memory caches. Includes session management, health checks, and Express middleware.

## Features

- 🚀 **Multiple Adapters**: Redis, Memcache, and in-memory cache support
- 🔄 **Automatic Fallback**: Gracefully fall back to in-memory cache if primary adapter fails
- 📦 **Namespacing**: Organize cache keys with optional prefixes to prevent collisions
- 🎯 **Generic Types**: Full TypeScript support with generics for type-safe caching
- 📊 **Statistics**: Track cache hits, misses, sets, and deletes
- 💾 **Session Management**: Built-in SessionStore wrapper for session handling
- 🌐 **Express Middleware**: Pre-built middleware for session management and response caching
- ⚡ **Async/Await**: Modern async API throughout
- 🔌 **Production Ready**: Error handling, health checks, and connection management

## Installation

```bash
npm install @naman_deep_singh/cache redis memcached
```

### Peer Dependencies

- `redis` (for Redis adapter)
- `memcached` (for Memcache adapter)

Both are optional if you're only using the memory adapter.

## Quick Start

### Using the Factory

```typescript
import { CacheFactory, SessionStore } from '@naman_deep_singh/cache';

// Create a Redis cache
const cache = CacheFactory.create({
  adapter: 'redis',
  host: 'localhost',
  port: 6379,
  namespace: 'myapp',
  ttl: 3600
});

// Or with fallback support
const cacheWithFallback = await CacheFactory.createWithFallback({
  adapter: 'redis',
  host: 'localhost',
  port: 6379,
  fallback: true // Falls back to memory cache if Redis fails
});
```

### Basic Cache Operations

All adapters (Redis, Memcache, Memory) implement the same `ICache<T>` interface and work identically:

```typescript
// Set a value (with TTL in seconds)
await cache.set('user:123', { id: 123, name: 'John' }, 3600); // 1 hour

// Get a value
const user = await cache.get('user:123');
console.log(user); // { id: 123, name: 'John' } or null if not found

// Check existence
const exists = await cache.exists('user:123'); // true or false

// Delete a value
const deleted = await cache.delete('user:123'); // true if existed, false otherwise

// Clear all cache (respects namespace)
await cache.clear();

// Increment/Decrement (for numeric values)
await cache.set('visits', 0);
const visits = await cache.increment('visits'); // 1
const decremented = await cache.decrement('visits'); // 0
await cache.increment('visits', 5); // increment by 5 -> 5
await cache.decrement('counter', 2); // decrement by 2

// Batch get operations
const users = await cache.getMultiple(['user:1', 'user:2', 'user:3']);
// Returns: { 'user:1': userData1, 'user:2': null, 'user:3': userData3 }

// Batch set operations
await cache.setMultiple({
  'user:1': user1,
  'user:2': user2,
  'user:3': user3
}, 3600); // All with same TTL

// Batch delete operations
const deletedCount = await cache.deleteMultiple(['user:1', 'user:2', 'user:3']);
console.log(`Deleted ${deletedCount} keys`);

// Get cache statistics
const stats = await cache.getStats();
console.log(`Cache hits: ${stats.hits}`);
console.log(`Cache misses: ${stats.misses}`);
console.log(`Total sets: ${stats.sets}`);
console.log(`Total deletes: ${stats.deletes}`);

// Health check (verify connection)
const health = await cache.isAlive();
console.log(`Cache status:`, health);
// { isAlive: true, adapter: 'redis', timestamp: Date, error?: undefined }

// Close connection (cleanup)
await cache.close();
```

## Session Management

SessionStore provides a convenient wrapper around any cache adapter for session handling.

```typescript
import { CacheFactory, SessionStore } from '@naman_deep_singh/cache';

// Create cache (any adapter works the same way)
const cache = CacheFactory.create({
  adapter: 'redis', // or 'memcache' or 'memory'
  host: 'localhost',
  port: 6379,
  namespace: 'sessions'
});

// Initialize session store
const sessionStore = new SessionStore(cache, {
  ttl: 86400, // 24 hours default
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data)
});

// Create a new session
await sessionStore.create('session:abc123', {
  userId: 123,
  username: 'john',
  roles: ['admin'],
  permissions: ['read', 'write']
});

// Retrieve session data
const session = await sessionStore.get('session:abc123');
console.log(session); // { userId: 123, username: 'john', ... }

// Check if session exists
const sessionExists = await sessionStore.exists('session:abc123'); // true

// Update/merge session data
await sessionStore.update('session:abc123', {
  lastActivity: new Date(),
  permissions: ['read', 'write', 'delete']
});

// Extend session expiry (keep user logged in)
await sessionStore.extend('session:abc123', 86400); // 24 more hours

// Get session and extend in one operation (useful for every request)
const sessionData = await sessionStore.getAndExtend('session:abc123');

// Get multiple sessions
const sessions = await sessionStore.getMultiple([
  'session:user1',
  'session:user2',
  'session:user3'
]);

// Delete a single session (logout)
const deleted = await sessionStore.delete('session:abc123'); // true if existed

// Delete multiple sessions
const deletedCount = await sessionStore.deleteMultiple([
  'session:user1',
  'session:user2'
]);

// Clear all sessions (e.g., on server maintenance)
await sessionStore.clear();
```

## Adapters

All adapters implement the same `ICache<T>` interface and can be used interchangeably. Switching between adapters requires only changing the configuration!

### Redis Cache

```typescript
import { RedisCache } from '@naman_deep_singh/cache';

const cache = new RedisCache({
  adapter: 'redis',
  host: 'localhost',
  port: 6379,
  username: 'default', // Optional, for auth
  password: 'your_password', // Optional
  db: 0, // Optional, database number (0-15)
  tls: false, // Optional, enable TLS/SSL
  namespace: 'myapp', // Optional, key prefix
  ttl: 3600 // Default TTL in seconds
});

// All ICache methods available
await cache.set('key', value);
await cache.get('key');
await cache.delete('key');
// ... and all other methods
```

### Redis Cluster Support

```typescript
import { CacheFactory } from '@naman_deep_singh/cache';

// Single cluster configuration with array notation
const clusterCache = CacheFactory.create({
  adapter: 'redis',
  cluster: [
    { host: 'redis-node-1.example.com', port: 6379 },
    { host: 'redis-node-2.example.com', port: 6379 },
    { host: 'redis-node-3.example.com', port: 6379 }
  ],
  namespace: 'myapp',
  ttl: 3600
});

// Or with detailed cluster config
const clusterCacheAlt = CacheFactory.create({
  adapter: 'redis',
  cluster: {
    nodes: [
      { host: 'redis-node-1.example.com', port: 6379 },
      { host: 'redis-node-2.example.com', port: 6379 }
    ],
    options: {
      enableReadyCheck: true,
      maxRedirections: 3,
      retryDelayOnFailover: 100,
      retryDelayOnClusterDown: 300
    }
  }
});

// Use exactly like single instance - same ICache interface
await clusterCache.set('key', value);
const data = await clusterCache.get('key');
await clusterCache.delete('key');

// Cluster automatically handles key distribution across nodes
// No changes needed to your application logic
```

**Note:** Cannot mix single-instance (`host`/`port`) and cluster (`cluster`) config. Choose one or the other.

### Memcache Adapter

```typescript
import { MemcacheCache } from '@naman_deep_singh/cache';

const cache = new MemcacheCache({
  adapter: 'memcache',
  servers: 'localhost:11211', // Single server as string
  // OR
  // servers: ['localhost:11211', 'localhost:11212'], // Multiple servers
  username: 'user', // Optional
  password: 'pass', // Optional
  namespace: 'myapp', // Optional, key prefix
  ttl: 3600 // Default TTL in seconds
});

// Same ICache interface as Redis
await cache.set('key', value);
await cache.get('key');
await cache.delete('key');
// ... and all other methods
```

### Memory Cache (For Development/Testing)

```typescript
import { MemoryCache } from '@naman_deep_singh/cache';

const cache = new MemoryCache({
  adapter: 'memory',
  namespace: 'myapp', // Optional, key prefix
  ttl: 3600, // Default TTL in seconds
  maxSize: 1000 // Optional, max items (oldest removed when exceeded)
});

// Same ICache interface - perfect for testing without external dependencies
await cache.set('key', value);
await cache.get('key');
await cache.delete('key');
// ... and all other methods

// Note: Memory cache automatically cleans up expired items every 30 seconds
```

### Using Adapters Interchangeably

```typescript
// Development: use memory cache
let cache: ICache;
if (process.env.NODE_ENV === 'development') {
  cache = new MemoryCache({ adapter: 'memory' });
} else if (process.env.REDIS_URL) {
  cache = new RedisCache({ adapter: 'redis', host: 'localhost' });
} else {
  cache = new MemcacheCache({ adapter: 'memcache', servers: 'localhost:11211' });
}

// All subsequent code works the same regardless of adapter
await cache.set('user:1', userData);
const user = await cache.get('user:1');
const health = await cache.isAlive();
```

## Express Middleware

### Session Management Middleware

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import { CacheFactory, SessionStore, cacheSessionMiddleware } from '@naman_deep_singh/cache';

const app = express();
app.use(cookieParser());

const cache = CacheFactory.create({
  adapter: 'redis',
  host: 'localhost',
  port: 6379,
  namespace: 'sessions'
});

const sessionStore = new SessionStore(cache);

app.use(
  cacheSessionMiddleware(sessionStore, {
    sessionIdHeader: 'x-session-id', // Or use cookie
    sessionDataKey: 'session' // req.session
  })
);

app.get('/profile', (req, res) => {
  const session = (req as any).session;
  if (!session) {
    return res.status(401).json({ error: 'No session' });
  }
  res.json({ user: session });
});
```

### Cache Health Check Middleware

Expose cache health status at a dedicated endpoint:

```typescript
import { CacheFactory, cacheHealthCheckMiddleware } from '@naman_deep_singh/cache';

const cache = CacheFactory.create({
  adapter: 'redis',
  host: 'localhost'
});

// Add middleware
app.use(cacheHealthCheckMiddleware(cache, '/.health/cache'));

// Usage:
// GET /.health/cache
// Response:
// {
//   "isAlive": true,
//   "adapter": "redis",
//   "timestamp": "2024-01-01T12:00:00.000Z"
// }
```

### Response Caching Middleware

Automatically cache HTTP responses for GET requests:

```typescript
import { CacheFactory, cacheResponseMiddleware } from '@naman_deep_singh/cache';

const cache = CacheFactory.create({
  adapter: 'redis',
  host: 'localhost'
});

// Add middleware
app.use(
  cacheResponseMiddleware(cache, {
    ttl: 300, // Cache for 5 minutes
    keyPrefix: 'response:', // All keys start with this
    excludeStatusCodes: [404, 500, 502, 503] // Don't cache errors
  })
);

// Usage in routes
app.get('/api/users', (req, res) => {
  // First request: fetches from database, caches response
  // Subsequent requests: returns from cache
  res.json({ users: [...] });
  // Response headers will include X-Cache: HIT or MISS
});

app.get('/api/data', async (req, res) => {
  // Expensive operation
  const data = await expensiveQuery();
  res.json(data);
  // X-Cache: MISS (first time)
  // X-Cache: HIT (subsequent requests within 5 minutes)
});

// Client can check cache status
app.get('/api/stats', (req, res) => {
  // Not cached (responses with statusCode >= 300)
  res.status(201).json({ created: true });
  // X-Cache: MISS
});
```

## Error Handling

```typescript
import { CacheError } from '@naman_deep_singh/cache';

try {
  await cache.get('key');
} catch (err) {
  if (err instanceof CacheError) {
    console.log(`Error: ${err.message}`);
    console.log(`Code: ${err.code}`);
    console.log(`Adapter: ${err.adapter}`);
    console.log(`Original error:`, err.originalError);
  }
}

// Error codes:
// - CACHE_ERROR: Generic cache error
// - REDIS_CONNECTION_ERROR: Failed to connect to Redis
// - REDIS_GET_ERROR, REDIS_SET_ERROR, etc.
// - MEMCACHE_CONNECTION_ERROR: Failed to connect to Memcache
// - MEMCACHE_GET_ERROR, MEMCACHE_SET_ERROR, etc.
// - MEMORY_GET_ERROR, MEMORY_SET_ERROR, etc.
// - SESSION_NOT_FOUND: Session doesn't exist
// - SESSION_CREATE_ERROR, SESSION_UPDATE_ERROR, etc.
```

## Complete API Reference

### ICache<T> Interface

Every adapter implements this interface:

```typescript
interface ICache<T = unknown> {
  // Single item operations
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  getMultiple(keys: string[]): Promise<Record<string, T | null>>;
  setMultiple(data: Record<string, T>, ttl?: number): Promise<void>;
  deleteMultiple(keys: string[]): Promise<number>;
  
  // Numeric operations
  increment(key: string, amount?: number): Promise<number>;
  decrement(key: string, amount?: number): Promise<number>;
  
  // Utility operations
  clear(): Promise<void>;
  getStats?(): Promise<CacheStats>;
  isAlive(): Promise<HealthCheckResponse>;
  close(): Promise<void>;
}
```

### CacheFactory

```typescript
// Create a cache instance
const cache = CacheFactory.create({
  adapter: 'redis' | 'memcache' | 'memory',
  // ... adapter-specific config
});

// Create with automatic fallback to memory cache
const cacheWithFallback = await CacheFactory.createWithFallback({
  adapter: 'redis',
  // ... config
  fallback: true // Falls back to memory if primary fails
});
```

### SessionStore

```typescript
const sessionStore = new SessionStore(cache, {
  ttl: 3600,
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data)
});

// Methods
await sessionStore.create(sessionId, data, ttl?);
await sessionStore.get(sessionId);
await sessionStore.update(sessionId, partialData);
await sessionStore.delete(sessionId);
await sessionStore.exists(sessionId);
await sessionStore.extend(sessionId, ttl?);
await sessionStore.getAndExtend(sessionId, ttl?);
await sessionStore.getMultiple(sessionIds);
await sessionStore.deleteMultiple(sessionIds);
await sessionStore.clear();
```

## Configuration Examples

### Development

```typescript
const cache = CacheFactory.create({
  adapter: 'memory',
  namespace: 'dev',
  ttl: 600
});
```

### Production with Fallback

```typescript
const cache = await CacheFactory.createWithFallback({
  adapter: 'redis',
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  namespace: 'prod',
  ttl: 3600,
  fallback: true
});
```

### Multi-Tenant with Namespacing

```typescript
const getTenantCache = (tenantId: string) => {
  return CacheFactory.create({
    adapter: 'redis',
    host: 'localhost',
    namespace: `tenant:${tenantId}`,
    ttl: 3600
  });
};

const tenant1Cache = getTenantCache('tenant-1');
const tenant2Cache = getTenantCache('tenant-2');

// Keys are isolated: tenant-1:key vs tenant-2:key
```

## Connecting and Disconnecting

### Redis

```typescript
const cache = new RedisCache({
  adapter: 'redis',
  host: 'localhost'
});

// Automatically connects on first use or explicitly:
// await (cache as any).connect();

// Close when done
await cache.close();
```

### Memcache

```typescript
const cache = new MemcacheCache({
  adapter: 'memcache',
  servers: ['localhost:11211']
});

// Automatically connects
// Close when done
await cache.close();
```

## Adapter Comparison

All adapters implement the same `ICache<T>` interface and work identically. Choose based on your needs:

| Feature | Redis | Memcache | Memory |
|---------|-------|----------|--------|
| **Type** | External service | External service | In-process |
| **Setup** | Requires Redis server | Requires Memcache server | No setup needed |
| **Persistence** | Optional (configurable) | No persistence | Lost on restart |
| **Scalability** | Excellent (supports millions) | Good (scalable across servers) | Limited to RAM |
| **Best For** | Production (distributed systems) | High-traffic scenarios | Development & testing |
| **Cost** | Free (open source) | Free (open source) | Free |
| **Performance** | Fast | Very Fast | Fastest (in-memory) |
| **Cluster Support** | Yes (v1.2+) | Yes | N/A |
| **Authentication** | Username/Password/TLS | Optional | N/A |

### When to Use Each

```typescript
// Development: quick setup, no dependencies
const devCache = CacheFactory.create({ adapter: 'memory' });

// Testing: mock external services
const testCache = CacheFactory.create({ adapter: 'memory' });

// Production single instance: single server, high performance
const prodCache = CacheFactory.create({
  adapter: 'redis',
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD
});

// Production cluster: distributed Redis cluster
const clusterCache = CacheFactory.create({
  adapter: 'redis',
  cluster: [
    { host: 'redis-node-1', port: 6379 },
    { host: 'redis-node-2', port: 6379 },
    { host: 'redis-node-3', port: 6379 }
  ]
});

// High-traffic with Memcache multi-server
const memcacheCache = CacheFactory.create({
  adapter: 'memcache',
  servers: ['memcache1:11211', 'memcache2:11211']
});
```

## Best Practices

1. **Use Namespacing**: Always use namespaces in multi-tenant or complex applications to prevent key collisions.

2. **Set Appropriate TTLs**: Balance cache size and data freshness.

3. **Handle Cache Failures**: Use try-catch or fallback options to handle cache adapter failures gracefully.

4. **Monitor Cache Health**: Use `isAlive()` in health check endpoints.

5. **Clean Up Resources**: Always call `close()` when shutting down.

6. **Use Batch Operations**: For multiple operations, prefer `getMultiple` and `setMultiple` over loops.

7. **Session Security**: Use secure headers/cookies for session IDs in production.

8. **Error Logging**: Log `CacheError` instances with their codes for debugging.

## Types

See [types.ts](./src/types.ts) for detailed type definitions:

- `CacheConfig` - Cache configuration
- `RedisCacheConfig` - Redis-specific config
- `MemcacheCacheConfig` - Memcache-specific config
- `MemoryCacheConfig` - Memory cache config
- `SessionData` - Session data structure
- `SessionOptions` - Session store options
- `CacheStats` - Cache statistics
- `HealthCheckResponse` - Health check response
- `ICache<T>` - Cache interface
- `ISession` - Session interface

## License

ISC

## Author

Naman Deep Singh
