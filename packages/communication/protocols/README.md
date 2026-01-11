# Communication Protocols Package

HTTP protocol implementation using Axios for the communication-core framework.

## Features

- **HTTPProtocol**: Full-featured HTTP client with interceptor support
- **HTTPConnectionPool**: Connection pooling for HTTP requests
- **HTTPInterceptor**: Request/response/error interceptors with pre-built implementations
- **Built-in Interceptors**: Logging and Authentication interceptors

## Installation

```bash
npm install @naman_deep_singh/communication-protocols
```

## Usage

### Basic HTTP Protocol

```typescript
import { HTTPProtocol } from '@naman_deep_singh/communication-protocols';

const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com',
  timeout: 30000
});

// Send HTTP request
const response = await httpProtocol.send({
  method: 'GET',
  url: '/users',
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### With Connection Pool

```typescript
import { HTTPProtocol, HTTPConnectionPool } from '@naman_deep_singh/communication-protocols';

const connectionPool = new HTTPConnectionPool('api-pool', {
  baseURL: 'https://api.example.com',
  maxConnections: 10,
  minConnections: 2,
  acquireTimeout: 5000
});

const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com'
});

httpProtocol.setConnectionPool(connectionPool);
```

### Using Interceptors

```typescript
import { 
  HTTPProtocol, 
  LoggingHTTPInterceptor, 
  AuthHTTPInterceptor 
} from '@naman_deep_singh/communication-protocols';

const httpProtocol = new HTTPProtocol({
  baseURL: 'https://api.example.com'
});

// Add logging interceptor
httpProtocol.addInterceptor(new LoggingHTTPInterceptor());

// Add auth interceptor
const authInterceptor = new AuthHTTPInterceptor('your-token', 'Bearer');
httpProtocol.addInterceptor(authInterceptor);
```

### Custom Interceptor

```typescript
import { HTTPInterceptor } from '@naman_deep_singh/communication-protocols';

class CustomHTTPInterceptor extends HTTPInterceptor {
  constructor() {
    super({ name: 'custom', priority: 50 });
  }

  async onRequest(request, context) {
    // Modify request
    request.headers['X-Custom-Header'] = 'value';
    return request;
  }

  async onResponse(response, context) {
    // Process response
    console.log('Response received:', response.status);
    return response;
  }
}
```

## API Reference

### HTTPProtocol

- `send(request: HTTPRequest): Promise<HTTPResponse>` - Send HTTP request
- `addInterceptor(interceptor: HTTPInterceptor)` - Add request interceptor
- `setConnectionPool(pool: HTTPConnectionPool)` - Set connection pool
- `getAxiosInstance(): AxiosInstance` - Get underlying Axios instance

### HTTPConnectionPool

- `acquire(timeout?: number): Promise<ConnectionAcquisition>` - Acquire connection
- `release(connection: HTTPConnection)` - Release connection
- `executeRequest(connection, config)` - Execute request with connection

### HTTPInterceptor

- `onRequest(request, context)` - Intercept outgoing requests
- `onResponse(response, context)` - Intercept incoming responses  
- `onError(error, context)` - Intercept errors

## Built-in Interceptors

- **LoggingHTTPInterceptor**: Logs requests, responses, and errors
- **AuthHTTPInterceptor**: Adds authentication headers to requests

## Dependencies

- `axios`: HTTP client library
- `@naman_deep_singh/communication-core`: Core communication interfaces

## License

ISC