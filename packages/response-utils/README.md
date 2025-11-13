# @naman_deep_singh/response-utils

TypeScript utilities for standardized HTTP API responses with common status codes and error handling. Supports both standalone usage and Express.js integration.

## Installation

```bash
npm install @naman_deep_singh/response-utils
```

## Features

- ✅ **Standardized API responses** with consistent format
- ✅ **Express.js integration** - automatically sets HTTP status codes
- ✅ **TypeScript support** with full type safety
- ✅ **Hybrid exports** - use named imports or namespace imports
- ✅ **Pagination support** with metadata
- ✅ **Common HTTP status codes** (200, 201, 400, 401, 403, 404, 408, 409, 422, 429, 500)

## Usage

### Named Imports (Tree-shakable)
```typescript
import { success, error, created, notFound, paginated } from '@naman_deep_singh/response-utils';

// Success responses
const userResponse = success({ id: 1, name: 'John' }, 'User found');
const createdResponse = created({ id: 2, name: 'Jane' });

// Error responses
const errorResponse = notFound('User not found');
const validationResponse = validationError('Invalid input', ['Name is required']);

// Paginated responses
const paginatedUsers = paginated([{id: 1}, {id: 2}], 1, 10, 25);
```

### Namespace Import
```typescript
import ResponseUtils from '@naman_deep_singh/response-utils';

const response = ResponseUtils.success({ id: 1 }, 'Success');
```

### Express.js Integration
```typescript
import { success, notFound } from '@naman_deep_singh/response-utils';
import { Request, Response } from 'express';

app.get('/users/:id', (req: Request, res: Response) => {
  const user = findUser(req.params.id);
  
  if (!user) {
    return notFound('User not found', res); // Sets status 404 and sends response
  }
  
  return success(user, 'User found', 200, res); // Sets status 200 and sends response
});
```

## API Reference

### Success Responses
- `success<T>(data: T, message?, statusCode?, res?)` - Generic success response (200)
- `created<T>(data: T, message?, res?)` - 201 Created response
- `noContent(message?, res?)` - 204 No Content response
- `paginated<T>(data: T[], page, limit, total, message?, res?)` - Paginated response with metadata

### Error Responses
- `error(message, statusCode?, error?, res?)` - Generic error response
- `badRequest(message?, validationError?, res?)` - 400 Bad Request
- `unauthorized(message?, res?)` - 401 Unauthorized
- `forbidden(message?, res?)` - 403 Forbidden
- `notFound(message?, res?)` - 404 Not Found
- `timeout(message?, res?)` - 408 Request Timeout
- `conflict(message?, res?)` - 409 Conflict
- `validationError(message?, errors[], res?)` - 422 Validation Error
- `tooManyRequests(message?, res?)` - 429 Too Many Requests
- `serverError(message?, res?)` - 500 Internal Server Error

### Utility Functions
- `logError(context: string, error: unknown)` - Structured error logging
- `getErrorMessage(error: unknown)` - Extract error message safely

## Response Format

All responses follow the `ApiResponse<T>` interface:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}
```

## Paginated Response Format

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```