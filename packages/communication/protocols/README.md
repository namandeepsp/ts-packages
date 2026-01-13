```bash
# @naman_deep_singh/communication-protocols

**Version:** 1.0.0


HTTP protocol implementation using Axios for the communication-core framework.

Features
HTTPProtocol: Full-featured HTTP client with interceptor support

HTTPConnectionPool: Connection pooling for HTTP requests with health checks

HTTPInterceptor: Request/response/error interceptors with priority-based execution

Built-in Interceptors: Logging and Authentication interceptors

TypeScript Support: Fully typed with exported interfaces and types

Dual Module Support: ES Modules and CommonJS output formats

Installation
bash
npm install @naman_deep_singh/communication-protocols
Usage
Basic HTTP Protocol
typescript
import { HTTPProtocol } from '@naman_deep_singh/communication-protocols';

const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 500
});

// Send HTTP request
const response = await httpProtocol.send({
  method: 'GET',
  url: '/users',
  headers: {
    'Authorization': 'Bearer token'
  },
  query: {
    page: 1,
    limit: 20
  }
});

console.log(response.data);
With Connection Pool
typescript
import { HTTPConnectionPool, HTTPProtocol } from '@naman_deep_singh/communication-protocols';

// Create connection pool
const connectionPool = new HTTPConnectionPool('api-pool', {
  baseURL: 'https://api.example.com',
  maxConnections: 10,
  minConnections: 2,
  acquireTimeout: 5000,
  timeout: 30000,
  keepAlive: true,
  maxSockets: 10
});

// Create protocol instance
const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com'
});

// Set connection pool (optional - for advanced usage)
httpProtocol.setConnectionPool(connectionPool);

// Direct pool usage example:
const acquisition = await connectionPool.acquire();
try {
  const response = await connectionPool.executeRequest(acquisition.connection, {
    method: 'GET',
    url: '/users'
  });
  console.log('Pool request result:', response.data);
} finally {
  connectionPool.release(acquisition.connection);
}
Using Interceptors
typescript
import { 
  HTTPProtocol, 
  LoggingHTTPInterceptor, 
  AuthHTTPInterceptor 
} from '@naman_deep_singh/communication-protocols';

const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com'
});

// Add logging interceptor (high priority - executes first)
httpProtocol.addInterceptor(new LoggingHTTPInterceptor());

// Add auth interceptor with token
const authInterceptor = new AuthHTTPInterceptor('your-access-token', 'Bearer', true);
httpProtocol.addInterceptor(authInterceptor);

// Update token dynamically if needed
authInterceptor.setToken('new-access-token', 'Bearer');

// Send request with interceptors applied
const response = await httpProtocol.send({
  method: 'GET',
  url: '/protected/users'
});
Custom Interceptor
typescript
import { HTTPInterceptor } from '@naman_deep_singh/communication-protocols';
import type { HTTPRequest, HTTPResponse, RequestContext, CommunicationError } from '@naman_deep_singh/communication-core';

class CustomHTTPInterceptor extends HTTPInterceptor {
  constructor() {
    super({ 
      name: 'custom', 
      priority: 50,
      enabled: true,
      timeout: 10000
    });
  }

  async onRequest(request: HTTPRequest, context: RequestContext): Promise<HTTPRequest | undefined> {
    // Modify request before sending
    const headers = {
      ...request.headers,
      'X-Custom-Header': 'custom-value',
      'X-Request-ID': context.requestId
    };

    return {
      ...request,
      headers,
      timestamp: Date.now()
    };
  }

  async onResponse(response: HTTPResponse, context: RequestContext): Promise<HTTPResponse | undefined> {
    // Process successful responses
    console.log(`[${this.name}] Request ${context.requestId} completed in ${response.duration}ms`);

    // Add custom metadata
    return {
      ...response,
      metadata: {
        ...response.metadata,
        customProcessed: true,
        processor: this.name
      }
    };
  }

  async onError(error: CommunicationError, context: RequestContext): Promise<CommunicationError | undefined> {
    // Handle or transform errors
    console.error(`[${this.name}] Request ${context.requestId} failed:`, error.message);

    // Add context to error
    return new CommunicationError(
      error.code,
      error.statusCode,
      {
        ...error.details,
        interceptor: this.name,
        requestId: context.requestId,
        retryCount: context.attempt
      }
    );
  }

  protected async onInitialize(context: any): Promise<void> {
    console.log(`Interceptor ${this.name} initialized`);
  }

  protected async onCleanup(): Promise<void> {
    console.log(`Interceptor ${this.name} cleaned up`);
  }
}

// Usage
const customInterceptor = new CustomHTTPInterceptor();
httpProtocol.addInterceptor(customInterceptor);
API Reference
HTTPProtocol
Main HTTP client class that wraps Axios with additional features.

Constructor:

typescript
new HTTPProtocol(config: HTTPProtocolConfig)
Configuration (HTTPProtocolConfig):

typescript
interface HTTPProtocolConfig {
  baseURL?: string;                    // Base URL for all requests
  timeout?: number;                    // Request timeout in ms (default: 30000)
  maxRedirects?: number;              // Maximum redirects (default: 5)
  validateStatus?: (status: number) => boolean; // Status validation function
  withCredentials?: boolean;          // Send cookies with cross-origin requests
  auth?: {                            // HTTP basic authentication
    username: string;
    password: string;
  };
  proxy?: {                           // Proxy configuration
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}
Methods:

send(request: HTTPRequest): Promise<HTTPResponse> - Send HTTP request with interceptor support

addInterceptor(interceptor: HTTPInterceptor): void - Add request/response interceptor

setConnectionPool(pool: HTTPConnectionPool): void - Set connection pool for advanced usage

HTTPConnectionPool
Manages a pool of HTTP connections with health checking and lifecycle management.

Constructor:

typescript
new HTTPConnectionPool(name: string, config: HTTPConnectionPoolConfig)
Configuration (HTTPConnectionPoolConfig):

typescript
interface HTTPConnectionPoolConfig {
  baseURL: string;                    // Base URL for connections
  maxConnections?: number;           // Maximum connections in pool
  minConnections?: number;           // Minimum connections to maintain
  idleTimeout?: number;              // Connection idle timeout
  acquireTimeout?: number;           // Timeout for acquiring connection
  timeout?: number;                  // Request timeout (default: 30000)
  maxRedirects?: number;             // Maximum redirects (default: 5)
  keepAlive?: boolean;               // Enable TCP keep-alive
  maxSockets?: number;               // Maximum sockets per connection
}
Methods:

acquire(timeout?: number): Promise<ConnectionAcquisition<HTTPConnection>> - Acquire a connection from pool

release(connection: HTTPConnection): void - Release connection back to pool

createConnection(): Promise<HTTPConnection> - Create a new HTTP connection

validateConnection(connection: HTTPConnection): Promise<boolean> - Validate connection health

executeRequest<T>(connection: HTTPConnection, config: any): Promise<any> - Execute request using specific connection

destroy(): Promise<void> - Destroy the connection pool

HTTPInterceptor
Base class for creating request/response interceptors with priority-based execution.

Constructor:

typescript
new HTTPInterceptor(config: HTTPInterceptorConfig)
Configuration (HTTPInterceptorConfig):

typescript
interface HTTPInterceptorConfig {
  name: string;                      // Unique interceptor name
  priority?: number;                 // Execution priority (higher = first, default: 0)
  enabled?: boolean;                 // Whether interceptor is enabled (default: true)
  timeout?: number;                  // Interceptor execution timeout
}
Methods to override:

onRequest(request: HTTPRequest, context: RequestContext): Promise<HTTPRequest | undefined> - Intercept outgoing requests

onResponse(response: HTTPResponse, context: RequestContext): Promise<HTTPResponse | undefined> - Intercept incoming responses

onError(error: CommunicationError, context: RequestContext): Promise<CommunicationError | undefined> - Intercept errors

protected onInitialize(context: any): Promise<void> - Called when interceptor is initialized

protected onCleanup(): Promise<void> - Called when interceptor is cleaned up

Built-in Interceptors
LoggingHTTPInterceptor
Logs requests, responses, and errors to console.

typescript
new LoggingHTTPInterceptor(enabled: boolean = true)
Features:

Logs request method, URL, and headers

Logs response status and duration

Logs errors with details

Priority: 100 (executes early in chain)

AuthHTTPInterceptor
Adds authentication headers to requests.

typescript
new AuthHTTPInterceptor(
  token?: string, 
  tokenType: string = 'Bearer', 
  enabled: boolean = true
)
Methods:

setToken(token: string, tokenType: string = 'Bearer'): void - Update authentication token dynamically

Features:

Adds Authorization header to requests

Only adds header if not already present

Token can be updated at runtime

Priority: 90 (executes after logging but before most custom interceptors)

Error Handling
The package uses CommunicationError from @naman_deep_singh/communication-core for consistent error handling:

typescript
import { CommunicationError, COMMUNICATION_ERROR_CODES } from '@naman_deep_singh/communication-protocols';

try {
  const response = await httpProtocol.send(request);
} catch (error) {
  if (error instanceof CommunicationError) {
    console.error('Communication error:', {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details
    });
    
    // Handle specific error codes
    if (error.code === COMMUNICATION_ERROR_CODES.HTTP_PROTOCOL_ERROR) {
      // Handle HTTP-specific errors
    }
  }
}
Types Export
The following types and interfaces are exported:

typescript
// Main Classes
HTTPProtocol
HTTPConnectionPool
HTTPInterceptor
LoggingHTTPInterceptor
AuthHTTPInterceptor

// Configuration Interfaces
HTTPProtocolConfig
HTTPConnectionPoolConfig
HTTPInterceptorConfig

// Core Types
HTTPConnection
Advanced Usage
Health Checking
typescript
// Check connection health
const connection = await connectionPool.createConnection();
const isHealthy = await connection.healthCheck();
console.log('Connection healthy:', isHealthy);

// Validate pool connections
const isValid = await connectionPool.validateConnection(connection);
Connection Metadata
typescript
const acquisition = await connectionPool.acquire();
console.log('Connection metadata:', {
  id: acquisition.connection.id,
  baseURL: acquisition.connection.baseURL,
  createdAt: acquisition.connection.createdAt,
  lastUsedAt: acquisition.connection.lastUsedAt,
  usageCount: acquisition.connection.usageCount,
  metadata: acquisition.connection.metadata
});
Multiple Interceptor Chains
typescript
// Create interceptors with different priorities
const interceptors = [
  new LoggingHTTPInterceptor(),                     // Priority: 100
  new AuthHTTPInterceptor('token'),                 // Priority: 90
  new CustomHTTPInterceptor(),                      // Priority: 50 (custom)
  new AnotherCustomInterceptor({ priority: 10 })    // Priority: 10
];

// Add all interceptors
interceptors.forEach(interceptor => httpProtocol.addInterceptor(interceptor));
// Execution order: Logging → Auth → Custom → AnotherCustom
Dependencies
axios: ^1.7.9 - HTTP client library

@naman_deep_singh/communication-core: ^1.2.2 - Core communication interfaces

@types/node: ^25.0.1 - Node.js type definitions (dev dependency)

Building from Source
bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Clean build artifacts
pnpm run clean
Module Support
This package supports both ES Modules and CommonJS:

javascript
// ES Modules (recommended)
import { HTTPProtocol } from '@naman_deep_singh/communication-protocols';

// CommonJS
const { HTTPProtocol } = require('@naman_deep_singh/communication-protocols');
License
ISC © Naman Deep Singh

```