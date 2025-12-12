# @naman_deep_singh/server-utils

**Version:** 1.1.0

Extensible server utilities for Express.js microservices with multi-protocol support and TypeScript.

## Installation

```bash
npm install @naman_deep_singh/server-utils
```

## Features

- ✅ **Multi-protocol support** - HTTP, gRPC, JSON-RPC, WebSockets, Webhooks
- ✅ **Express.js integration** with middleware collection
- ✅ **Graceful shutdown** handling
- ✅ **Health checks** with custom checks support
- ✅ **TypeScript support** with full type safety
- ✅ **Hybrid exports** - use named imports or namespace imports
- ✅ **Plugin architecture** for extensibility
- ✅ **Built-in middleware** - logging, validation, rate limiting, auth

## Quick Start

### Named Imports
```typescript
import { createServer } from '@naman_deep_singh/server-utils';

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

### Namespace Import
```typescript
import ServerUtils from '@naman_deep_singh/server-utils';

const server = ServerUtils.createServer('My API', '1.0.0');
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
server.addGrpcService(userProto.UserService.service, {
  getUser: (call, callback) => {
    callback(null, { id: call.request.id, name: 'John' });
  }
}, 50051); // Custom port
```

### JSON-RPC Support
```typescript
// Add JSON-RPC methods (requires jayson)
server.addRpcMethods({
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

### Logging Middleware
```typescript
import { createLoggingMiddleware, withLogging } from '@naman_deep_singh/server-utils';

// Direct usage
server.app.use(createLoggingMiddleware('detailed'));

// Plugin usage
const server = createServerWithPlugins('My API', '1.0.0', [
  withLogging('detailed')
]);
```

### Validation Middleware
```typescript
import { validateFields } from '@naman_deep_singh/server-utils';

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
import { rateLimit } from '@naman_deep_singh/server-utils';

server.app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests'
}));
```

### Authentication Middleware
```typescript
import { requireAuth } from '@naman_deep_singh/server-utils';

server.app.use('/protected', requireAuth({
  tokenExtractor: (req) => req.headers.authorization?.substring(7),
  tokenValidator: async (token) => {
    // Verify JWT token
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}));
```

## Health Checks

### Basic Health Check
```typescript
import { addHealthCheck, createHealthCheck, withHealthCheck } from '@naman_deep_singh/server-utils';

// Method 1: Direct addition
addHealthCheck(server.app, '/health');

// Method 2: As middleware
server.app.get('/health', createHealthCheck());

// Method 3: As plugin
const server = createServerWithPlugins('My API', '1.0.0', [
  withHealthCheck('/health')
]);
```

### Advanced Health Checks
```typescript
addHealthCheck(server.app, '/health', {
  customChecks: [
    {
      name: 'database',
      check: async () => {
        // Check database connection
        return await db.ping();
      }
    },
    {
      name: 'redis',
      check: async () => {
        return await redis.ping() === 'PONG';
      }
    }
  ]
});

// Response format:
// {
//   "status": "healthy",
//   "checks": {
//     "server": true,
//     "timestamp": 1640995200000,
//     "database": true,
//     "redis": false
//   }
// }
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
import { getEnv, getEnvNumber, getEnvBoolean } from '@naman_deep_singh/server-utils';

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
import { PeriodicHealthMonitor } from '@naman_deep_singh/server-utils';

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
// Import Express types and classes directly from server-utils
import { Request, Response, NextFunction, Router, Application } from '@naman_deep_singh/server-utils';
import type { RequestHandler, ErrorRequestHandler } from '@naman_deep_singh/server-utils';

// No need to install Express separately in your services
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
- `createErrorHandler()` - Error handling
- `createValidationMiddleware(rules)` - Input validation
- `createRateLimitMiddleware(config?)` - Rate limiting
- `createAuthMiddleware(config)` - Authentication

### Health & Monitoring
- `createHealthCheck(config?)` - Create health check middleware
- `withHealthCheck(path?, config?)` - Health check plugin
- `addHealthCheck(app, path?, config?)` - Add health check to app
- `PeriodicHealthMonitor` - Automated service health checking

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

### Integration with @naman_deep_singh/response-utils

For advanced error handling, use with `@naman_deep_singh/errors-utils`:

```typescript
import { expressErrorHandler } from '@naman_deep_singh/errors-utils';

// Replace basic error handler with advanced one
server.app.use(expressErrorHandler);
```

### Integration with @naman_deep_singh/response-utils

For consistent API responses, use with `@naman_deep_singh/response-utils`:

```typescript
import { responderMiddleware } from '@naman_deep_singh/response-utils';

server.app.use(responderMiddleware());

// Now use responder in routes
server.app.get('/users', (req, res) => {
  const responder = (res as any).responder();
  return responder.okAndSend({ users: [] });
});
```