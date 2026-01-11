# @naman_deep_singh/server

**Version:** 1.8.2 (with integrated cache & session support)

Extensible server utilities for Express.js microservices with multi-protocol support, integrated caching, session management, and TypeScript.

## Installation

```bash
npm install @naman_deep_singh/server
```

## Features

- ✅ **Multi-protocol support** - HTTP, gRPC, JSON-RPC, WebSockets, Webhooks
- ✅ **Integrated caching** - Redis, Memcache, in-memory with automatic fallback
- ✅ **Session management** - Distributed session store with configurable TTL
- ✅ **Express.js integration** with middleware collection
- ✅ **Graceful shutdown** handling with cache/session cleanup
- ✅ **Health checks** with custom checks and cache health integration
- ✅ **TypeScript support** with full type safety

- ✅ **Built-in middleware** - logging, validation, rate limiting, auth, caching, sessions, request ID, error handling


## Quick Start

### Basic Usage
```typescript
import { createServer } from '@naman_deep_singh/server';

const server = createServer('My API', '1.0.0', {
  port: 3000,
  cors: true,
  helmet: true
});

// Add routes
server.app.get('/users', (req, res) => {
  res.json({ users: [] });
});

// Start server
await server.start();
```

## Multi-Protocol Support

### HTTP + Express Routes
```typescript
const server = createServer('Multi-Protocol Server', '1.0.0');

server.app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

await server.start();
```

### gRPC Support
```typescript
// Add gRPC service (requires @grpc/grpc-js)
server.addGRPCService(userProto.UserService.service, {
  getUser: (call, callback) => {
    callback(null, { id: call.request.id, name: 'John' });
  }
}, 50051); // Custom port
```

### JSON-RPC Support
```typescript
// Add JSON-RPC methods (requires jayson)
server.addRPCMethods({
  add: (params, callback) => {
    callback(null, params[0] + params[1]);
  },
  getUser: (id, callback) => {
    callback(null, { id, name: 'John' });
  }
}, '/rpc'); // Custom path
```

### WebSocket Support
```typescript
// Add Socket.IO (requires socket.io)
const io = server.addSocketIO({
  cors: true,
  onConnection: (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('message', (data) => {
      socket.broadcast.emit('message', data);
    });
  },
  onDisconnection: (socket, reason) => {
    console.log('Client disconnected:', socket.id, reason);
  }
});
```

### Webhook Support
```typescript
// Add secure webhooks
server.addWebhook({
  path: '/webhooks/github',
  secret: process.env.GITHUB_WEBHOOK_SECRET,
  handler: async (payload, headers) => {
    if (payload.action === 'opened') {
      console.log('New PR opened:', payload.pull_request.title);
    }
  }
});

server.addWebhook({
  path: '/webhooks/stripe',
  secret: process.env.STRIPE_WEBHOOK_SECRET,
  handler: async (payload) => {
    if (payload.type === 'payment_intent.succeeded') {
      // Handle successful payment
    }
  }
});
```

## Built-in Middleware

### Request ID Middleware
```typescript
import { createRequestIdMiddleware } from '@naman_deep_singh/server';

// Adds unique request ID to each request
server.app.use(createRequestIdMiddleware());

// Access in routes
server.app.get('/users', (req, res) => {
  console.log('Request ID:', req.id); // Auto-generated UUID
  res.json({ requestId: req.id });
});
```

### Error Handler Middleware
```typescript
import { createErrorHandler } from '@naman_deep_singh/server';

// Global error handling (should be last middleware)
server.app.use(createErrorHandler());

// Handles AppError instances and unknown errors
// Integrates with @naman_deep_singh/http-response if available
```

### Cache Response Middleware
```typescript
import { cacheResponse } from '@naman_deep_singh/server';

// Cache GET responses (requires cache to be enabled in server config)
server.app.get('/expensive-data', 
  cacheResponse(300), // Cache for 5 minutes
  (req, res) => {
    // Expensive operation
    res.json({ data: 'expensive result' });
  }
);
```

### Session Middleware
```typescript
import { useSession } from '@naman_deep_singh/server';

// Session handling (requires session to be enabled in server config)
server.app.use(useSession('my-app.sid'));

server.app.post('/login', async (req, res) => {
  // Get existing session
  const session = await req.getSession();
  
  // Create new session
  const newSession = await req.createSession('user-123', {
    userId: 123,
    role: 'admin'
  }, 3600); // 1 hour TTL
  
  res.json({ sessionId: newSession.id });
});
```


### Logging Middleware
```typescript
import { createLoggingMiddleware } from '@naman_deep_singh/server';

// Direct usage
server.app.use(createLoggingMiddleware('detailed'));
```

### Validation Middleware
```typescript
import { validateFields } from '@naman_deep_singh/server';

server.app.post('/users', validateFields([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, minLength: 8 },
  { field: 'age', type: 'number', custom: (value) => value >= 18 || 'Must be 18+' }
]), (req, res) => {
  // Validation passed
  res.json({ success: true });
});
```

### Rate Limiting
```typescript
import { rateLimit } from '@naman_deep_singh/server';

server.app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests'
}));
```


### Authentication Middleware
```typescript
import { requireAuth } from '@naman_deep_singh/server';

server.app.use('/protected', requireAuth({
  secret: process.env.JWT_SECRET!,
  unauthorizedMessage: 'Invalid or expired token'
}));
```

## Plugin-Style Middleware Usage

### Application-Level Plugins
```typescript
import { 
  withLogging, 
  withErrorHandler, 
  withRequestId, 
  withAuth 
} from '@naman_deep_singh/server';

const server = createServer('My API', '1.0.0', {
  customMiddleware: [
    withRequestId(),
    withLogging('detailed'),
    withAuth({ secret: process.env.JWT_SECRET! }),
    withErrorHandler() // Should be last
  ]
});
```

### Route-Level Middleware
```typescript
import { validateFields, rateLimit, requireAuth } from '@naman_deep_singh/server';

// Combine multiple middleware
server.app.post('/api/users',
  rateLimit({ maxRequests: 10, windowMs: 60000 }),
  requireAuth({ secret: process.env.JWT_SECRET! }),
  validateFields([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, minLength: 8 }
  ]),
  (req, res) => {
    // All middleware passed
    res.json({ success: true });
  }
);
```

## Health Checks


### Basic Health Check
```typescript
import { createHealthCheck } from '@naman_deep_singh/server';

// The health check is automatically enabled when healthCheck is not false
// Health endpoint is available at /health by default

// If you need to customize or disable it:
server.app.get('/health', createHealthCheck());
```

## Server Management

### Server Information
```typescript
const info = server.getInfo();
console.log(info);
// {
//   name: 'My API',
//   version: '1.0.0',
//   port: 3000,
//   uptime: 12345,
//   status: 'running',
//   startTime: Date
// }
```

### Graceful Shutdown
```typescript
const server = createServer('My API', '1.0.0', {
  gracefulShutdown: true // Enabled by default
});

// Handles SIGINT and SIGTERM
process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});
```

## Configuration Options

```typescript
interface ServerConfig {
  port?: number;                    // Default: 3000
  cors?: boolean | CorsOptions;     // Default: true
  helmet?: boolean;                 // Default: true
  json?: boolean;                   // Default: true
  customMiddleware?: RequestHandler[];
  healthCheck?: boolean | string;   // Default: true
  gracefulShutdown?: boolean;       // Default: true
  socketIO?: SocketIOConfig;
}
```

## Environment Utilities

```typescript
import { getEnv, getEnvNumber, getEnvBoolean } from '@naman_deep_singh/server';

// Get string environment variable
const dbUrl = getEnv('DATABASE_URL'); // Throws if missing
const dbUrl = getEnv('DATABASE_URL', 'localhost'); // With default

// Get number environment variable
const port = getEnvNumber('PORT', 3000);
const maxConnections = getEnvNumber('MAX_CONNECTIONS'); // Throws if missing

// Get boolean environment variable
const enableLogging = getEnvBoolean('ENABLE_LOGGING', true);
const isProduction = getEnvBoolean('NODE_ENV'); // Must be 'true' or 'false'
```

## Periodic Health Monitoring

```typescript
import { PeriodicHealthMonitor } from '@naman_deep_singh/server';

const server = createServer('My API', '1.0.0', {
  periodicHealthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    services: [
      {
        name: 'database',
        url: 'http://localhost:5432/health',
        timeout: 5000
      },
      {
        name: 'redis',
        url: 'http://localhost:6379/ping'
      }
    ]
  }
});

// Manual health check
const monitor = new PeriodicHealthMonitor(config, 'My Service');
monitor.start();
const status = await monitor.getHealthStatus();
console.log(status); // { database: true, redis: false }
```

## Express Re-exports

```typescript
// Import Express types and classes directly from server
import { Request, Response, NextFunction, Router, Application } from '@naman_deep_singh/server';
import type { RequestHandler, ErrorRequestHandler } from '@naman_deep_singh/server';

// No need to install Express separately in your services

## TypeScript Notes

- This package includes TypeScript augmentations for Express `Request` and `Application` that expose runtime helpers used by the middleware (for example `req.cache`, `req.sessionStore`, `req.getSession`, and `req.createSession`). Installing and importing `@naman_deep_singh/server` in your project will surface these types automatically.
- Middleware that attaches runtime props uses `unknown` internally and runtime guards — prefer the provided helpers rather than casting `req` to `any`.

```

## API Reference

### Core Functions
- `createServer(name?, version?, config?)` - Create server instance
- `ExpressServer` - Server class for advanced usage

### Environment Utilities
- `getEnv(key, defaultValue?)` - Get string environment variable
- `getEnvNumber(key, defaultValue?)` - Get number environment variable  
- `getEnvBoolean(key, defaultValue?)` - Get boolean environment variable

### Health Monitoring
- `PeriodicHealthMonitor` - Automated service health checking

### Middleware Functions
- `createLoggingMiddleware(format?)` - Request logging
- `createErrorHandler()` - Global error handling
- `createRequestIdMiddleware()` - Request ID generation
- `createValidationMiddleware(rules)` - Input validation
- `createRateLimitMiddleware(config?)` - Rate limiting
- `createAuthMiddleware(config)` - Authentication
- `cacheResponse(ttl?)` - Response caching
- `useSession(cookieName?)` - Session management

### Plugin Middleware (Application-level)
- `withLogging(format?)` - Add logging to entire app
- `withErrorHandler()` - Add error handling to entire app
- `withRequestId()` - Add request ID to entire app
- `withValidation(rules)` - Add validation to entire app
- `withRateLimit(config?)` - Add rate limiting to entire app
- `withAuth(config)` - Add authentication to entire app

### Route-level Middleware
- `validateFields(rules)` - Validate specific route fields
- `rateLimit(config?)` - Rate limit specific routes
- `requireAuth(config)` - Require auth for specific routes

### Health & Monitoring
- `createHealthCheck(config?)` - Create health check middleware
- `withHealthCheck(path?, config?)` - Health check plugin
- `addHealthCheck(app, path?, config?)` - Add health check to app
- `PeriodicHealthMonitor` - Automated service health checking

### Graceful Shutdown
- `createGracefulShutdown(server, config?)` - Setup graceful shutdown
- `withGracefulShutdown(config?)` - Graceful shutdown plugin
- `startServerWithShutdown(server, config?)` - Start with shutdown handling

## License

MIThMonitor` - Automated service health checking

### Graceful Shutdown
- `createGracefulShutdown(server, config?)` - Setup graceful shutdown
- `startServerWithShutdown(app, port, config?)` - Start with shutdown handling

## Dependencies

### Required
- **express** - Web framework (v5.1.0+)

### Optional (for specific features)
- **cors** - CORS middleware (if using CORS)
- **helmet** - Security middleware (if using Helmet)
- **cookie-parser** - Cookie parsing (if using cookies)
- **@grpc/grpc-js** - For gRPC support
- **jayson** - For JSON-RPC support
- **socket.io** - For WebSocket support

## Response Format

All middleware responses follow the consistent format:

```json
{
  "success": true/false,
  "message": "Operation message",
  "data": {...} | undefined,
  "error": {
    "message": "Error message",
    "details": {...}
  } | null,
  "meta": {...} | null
}
```

### Integration with @naman_deep_singh/http-response

For advanced error handling, use with `@naman_deep_singh/errors`:

```typescript
import { expressErrorHandler } from '@naman_deep_singh/errors';

// Replace basic error handler with advanced one
server.app.use(expressErrorHandler);
```

### Integration with @naman_deep_singh/http-response

For consistent API responses, use with `@naman_deep_singh/http-response`:

```typescript
import { responderMiddleware } from '@naman_deep_singh/http-response';

server.app.use(responderMiddleware());

// Now use responder in routes
server.app.get('/users', (req, res) => {
  const responder = (res as any).responder();
  return responder.okAndSend({ users: [] });
});
```

## Cache & Session Integration

Built-in support for distributed caching and session management (disabled by default).

### Enable Redis Cache

```typescript
const server = createServer('My API', '1.0.0', {
  port: 3000,
  cache: {
    enabled: true,
    adapter: 'redis',
    options: {
      host: 'localhost',
      port: 6379,
      password: 'your_password'
    },
    defaultTTL: 3600 // seconds
  }
});

// Access cache in routes
server.app.get('/user/:id', async (req, res) => {
  const key = `user:${req.params.id}`;
  const cached = await (req as any).cache.get(key);
  if (cached) return res.json(cached);

  // Fetch from DB, then cache
  const user = { id: req.params.id, name: 'John' };
  await (req as any).cache.set(key, user, 3600);
  return res.json(user);
});
```

### Enable Redis Cluster Cache

```typescript
const server = createServer('My API', '1.0.0', {
  port: 3000,
  cache: {
    enabled: true,
    adapter: 'redis',
    options: {
      cluster: [
        { host: 'redis-node-1', port: 6379 },
        { host: 'redis-node-2', port: 6379 },
        { host: 'redis-node-3', port: 6379 }
      ]
    }
  }
});
```

### Enable Memcache

```typescript
const server = createServer('My API', '1.0.0', {
  port: 3000,
  cache: {
    enabled: true,
    adapter: 'memcache',
    options: {
      servers: ['localhost:11211', 'localhost:11212']
    }
  }
});
```

### Enable Sessions

```typescript
const server = createServer('My API', '1.0.0', {
  port: 3000,
  cache: {
    enabled: true,
    adapter: 'redis',
    options: { host: 'localhost', port: 6379 }
  },
  session: {
    enabled: true,
    cookieName: 'my_app.sid', // Defaults to {servername}.sid
    ttl: 3600, // 1 hour
    cookieOptions: {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'strict'
    }
  }
});

// Use sessions in routes
server.app.post('/login', async (req, res) => {
  const sessionStore = (req.app as any).locals.sessionStore;
  const sessionId = Math.random().toString(36).substring(7);

  await sessionStore.create(sessionId, {
    userId: 123,
    username: 'john_doe',
    loginTime: new Date()
  });

  res.cookie((req.app as any).locals.sessionCookieName, sessionId, {
    httpOnly: true,
    secure: true
  });

  return res.json({ message: 'Logged in' });
});

server.app.get('/profile', async (req, res) => {
  const sessionId = (req as any).sessionId;
  if (!sessionId) return res.status(401).json({ error: 'No session' });

  const session = await (req as any).getSession();
  if (!session) return res.status(401).json({ error: 'Session expired' });

  return res.json({ user: session.username, loginTime: session.loginTime });
});
```

### Per-Route Response Caching

```typescript
import { cacheResponse } from '@naman_deep_singh/server';

// Cache GET response for 1 hour (3600 seconds)
server.app.get('/api/posts', cacheResponse(3600), (req, res) => {
  // This endpoint's response is cached
  res.json({ posts: [...] });
});

// Cache with default TTL from server config
server.app.get('/api/trending', cacheResponse(), (req, res) => {
  res.json({ trending: [...] });
});
```

### Health Check with Cache Status

```typescript
const server = createServer('My API', '1.0.0', {
  healthCheck: '/health', // Automatic health endpoint
  cache: { enabled: true, adapter: 'redis', ... }
});

// Health endpoint now includes cache status
// GET /health returns:
// {
//   "status": "healthy",
//   "service": "My API",
//   "version": "1.0.0",
//   "uptime": 12345,
//   "timestamp": "2025-12-12T...",
//   "cache": {
//     "isAlive": true,
//     "adapter": "redis",
//     "timestamp": "2025-12-12T..."
//   }
// }
```

### Cache Configuration Options

All configuration is optional — cache and session are disabled by default:

```typescript
interface CacheConfig {
  enabled?: boolean;          // Default: false
  adapter?: 'redis' | 'memcache' | 'memory'; // Default: 'memory'
  options?: {
    // Redis single instance
    host?: string;           // Default: 'localhost'
    port?: number;           // Default: 6379
    username?: string;
    password?: string;
    db?: number;             // 0-15
    tls?: boolean;
    
    // Redis cluster
    cluster?: Array<{ host: string; port: number }> | {
      nodes: Array<{ host: string; port: number }>;
      options?: { maxRedirections?: number; ... };
    };
    
    // Memcache
    servers?: string | string[]; // e.g., 'localhost:11211'
    
    namespace?: string;      // Key prefix
    ttl?: number;           // Default TTL in seconds
  };
  defaultTTL?: number;        // Fallback TTL for routes
}

interface SessionConfig {
  enabled?: boolean;          // Default: false
  cookieName?: string;        // Default: {servername}.sid
  ttl?: number;              // Default: 3600 (1 hour)
  cookieOptions?: {
    path?: string;
    httpOnly?: boolean;      // Default: true
    secure?: boolean;        // HTTPS only
    sameSite?: 'lax' | 'strict' | 'none';
  };
}
```

### Graceful Shutdown

Cache and session stores are automatically closed on graceful shutdown:

```typescript
const server = createServer('My API', '1.0.0', {
  gracefulShutdown: true, // Enabled by default
  cache: { enabled: true, adapter: 'redis', ... },
  session: { enabled: true, ... }
});

// On SIGTERM/SIGINT, server will:
// 1. Stop accepting requests
// 2. Close cache connection (Redis/Memcache)
// 3. Close session store
// 4. Exit gracefully
```

## Feature Flags

All major features can be toggled independently:

```typescript
const server = createServer('My API', '1.0.0', {
  port: 3000,
  cors: true,              // Default: true
  helmet: true,            // Default: true
  json: true,              // Default: true
  cookieParser: false,     // Default: false
  healthCheck: '/health',  // Default: true
  gracefulShutdown: true,  // Default: true
  cache: { enabled: false }, // Default: disabled
  session: { enabled: false }, // Default: disabled
  socketIO: { enabled: false }, // Default: disabled
  periodicHealthCheck: { // Default: disabled
    enabled: false,
    interval: 30000,
    services: [...]
  }
});
```