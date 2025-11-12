# @naman_deep_singh/server-utils

Extensible server utilities for Express.js microservices with TypeScript. Provides a plugin-based architecture for building consistent and maintainable server applications.

## Features

- 🚀 **Express Server Factory** - Quick server setup with sensible defaults
- 🔌 **Plugin System** - Extensible architecture for custom functionality
- 🏥 **Health Checks** - Built-in health monitoring with custom checks
- 🛑 **Graceful Shutdown** - Proper cleanup and shutdown handling
- 📝 **Logging Middleware** - Request logging with customizable formats
- 🛡️ **Error Handling** - Centralized error handling middleware
- 🆔 **Request ID** - Automatic request ID generation and tracking

## Installation

```bash
npm install @naman_deep_singh/server-utils
# or
pnpm add @naman_deep_singh/server-utils
```

## Quick Start

### Basic Server
```typescript
import { createServer, startServerWithShutdown } from '@naman_deep_singh/server-utils';

const app = createServer({
  cors: true,
  helmet: true,
  healthCheck: true
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

startServerWithShutdown(app, 3000);
```

### Plugin-Based Architecture
```typescript
import { 
  createServerWithPlugins, 
  withHealthCheck, 
  withLogging, 
  withErrorHandler,
  withGracefulShutdown,
  startServerWithShutdown 
} from '@naman_deep_singh/server-utils';

const app = createServerWithPlugins(
  { cors: true, helmet: true },
  withLogging('detailed'),
  withHealthCheck('/health', {
    customChecks: [
      {
        name: 'database',
        check: async () => {
          // Your database health check
          return true;
        }
      }
    ]
  }),
  withErrorHandler(),
  withGracefulShutdown({
    timeout: 15000,
    onShutdown: async () => {
      console.log('Cleaning up resources...');
      // Your cleanup logic
    }
  })
);

// Add your routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

startServerWithShutdown(app, 3000);
```

## API Reference

### Server Factory

#### `createServer(config?: ServerConfig)`
Creates an Express application with default middleware.

```typescript
interface ServerConfig {
  port?: number;
  cors?: boolean | CorsOptions;
  helmet?: boolean;
  json?: boolean;
  customMiddleware?: express.RequestHandler[];
  healthCheck?: boolean | string;
  gracefulShutdown?: boolean;
}
```

#### `createServerWithPlugins(config, ...plugins)`
Creates a server and applies multiple plugins.

### Health Checks

#### `withHealthCheck(path?, config?)`
Adds health check endpoint as a plugin.

```typescript
withHealthCheck('/health', {
  customChecks: [
    {
      name: 'redis',
      check: async () => await redis.ping()
    }
  ]
})
```

#### `addHealthCheck(app, path?, config?)`
Directly adds health check to existing app.

### Graceful Shutdown

#### `withGracefulShutdown(config?)`
Adds graceful shutdown as a plugin.

```typescript
withGracefulShutdown({
  timeout: 10000,
  onShutdown: async () => {
    await database.close();
    await redis.disconnect();
  }
})
```

#### `startServerWithShutdown(app, port, config?)`
Starts server with automatic graceful shutdown setup.

### Middleware Plugins

#### `withLogging(format?)`
Adds request logging middleware.
- `format`: 'simple' | 'detailed'

#### `withErrorHandler()`
Adds centralized error handling middleware.

#### `withRequestId()`
Adds request ID generation and tracking.

### Custom Plugins

Create your own plugins:

```typescript
import { ServerPlugin } from '@naman_deep_singh/server-utils';

const withCustomAuth = (secretKey: string): ServerPlugin => {
  return (app, config) => {
    app.use((req, res, next) => {
      // Your custom auth logic
      next();
    });
  };
};

// Use it
const app = createServerWithPlugins(
  {},
  withCustomAuth('my-secret'),
  withLogging()
);
```

## Examples

### Microservice Template
```typescript
import { 
  createServerWithPlugins,
  withHealthCheck,
  withLogging,
  withErrorHandler,
  withRequestId,
  startServerWithShutdown
} from '@naman_deep_singh/server-utils';

const app = createServerWithPlugins(
  {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    },
    helmet: true
  },
  withRequestId(),
  withLogging(process.env.NODE_ENV === 'production' ? 'simple' : 'detailed'),
  withHealthCheck('/health', {
    customChecks: [
      {
        name: 'database',
        check: async () => {
          try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
          } catch {
            return false;
          }
        }
      }
    ]
  }),
  withErrorHandler()
);

// Your routes
app.use('/api', apiRoutes);

const PORT = Number(process.env.PORT) || 3000;
startServerWithShutdown(app, PORT, {
  onShutdown: async () => {
    await prisma.$disconnect();
  }
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions for all utilities and plugins.

## License

ISC