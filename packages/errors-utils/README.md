# @naman_deep_singh/errors-utils

**Version:** 1.0.1

Standardized error classes and Express middleware for consistent error handling with TypeScript.

## 🚀 Features

- ✅ **Structured Error Classes** - AppError, HTTPError, ValidationError, etc.
- ✅ **Express Middleware** - Error converter and handler
- ✅ **Response Integration** - Works with @naman_deep_singh/response-utils
- ✅ **TypeScript Support** - Full type safety
- ✅ **Consistent Responses** - Standardized error format across your API

## 📦 Installation

```bash
npm install @naman_deep_singh/errors-utils
```

## 🔧 Usage

### Error Classes

```typescript
import { 
  AppError, 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError,
  ValidationError,
  InternalServerError 
} from '@naman_deep_singh/errors-utils';

// Basic usage
throw new BadRequestError('Invalid input data');
throw new UnauthorizedError('Authentication required');
throw new NotFoundError('User not found');
throw new ValidationError('Email is required');

// With details
throw new BadRequestError('Validation failed', {
  fields: ['email', 'password']
});
```

### Express Middleware

```typescript
import express from 'express';
import { expressErrorHandler, errorConverter } from '@naman_deep_singh/errors-utils';

const app = express();

// Convert unknown errors to AppError
app.use(errorConverter);

// Handle all errors consistently
app.use(expressErrorHandler);

// In your routes
app.post('/users', (req, res) => {
  if (!req.body.email) {
    throw new BadRequestError('Email is required');
  }
  // Error will be caught and formatted automatically
});
```

## 🔗 Integration

### With @naman_deep_singh/server-utils

```typescript
import { createServer } from '@naman_deep_singh/server-utils';
import { expressErrorHandler } from '@naman_deep_singh/errors-utils';

const server = createServer('My API', '1.0.0');

// Replace basic error handler with advanced one
server.app.use(expressErrorHandler);
```

### With @naman_deep_singh/response-utils

```typescript
import { responderMiddleware } from '@naman_deep_singh/response-utils';

server.app.use(responderMiddleware());
server.app.use(expressErrorHandler); // Uses response-utils for consistent format
```

## 📚 Error Classes

| Class | Status Code | Use Case |
|-------|-------------|----------|
| `AppError` | Custom | Base error class |
| `BadRequestError` | 400 | Invalid input data |
| `UnauthorizedError` | 401 | Authentication failures |
| `ForbiddenError` | 403 | Authorization failures |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflicts |
| `ValidationError` | 422 | Input validation errors |
| `InternalServerError` | 500 | Server errors |

## 🎯 Response Format

All errors produce consistent responses:

```json
{
  "success": false,
  "message": "Error message",
  "data": undefined,
  "error": {
    "message": "Detailed error message",
    "details": {...}
  },
  "meta": null
}
```

## 📄 License

ISC © Naman Deep Singh