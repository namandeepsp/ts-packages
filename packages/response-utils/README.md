# @naman_deep_singh/response-utils

TypeScript utilities for standardized HTTP API responses with common status codes and error handling.

## Installation

```bash
npm install @naman_deep_singh/response-utils
or
pnpm add @naman_deep_singh/response-utils
or
yarn add @naman_deep_singh/response-utils
```

## Usage

```typescript
import { success, error, created, notFound } from '@naman_deep_singh/response-utils';

// Success responses
const userResponse = success({ id: 1, name: 'John' }, 'User found');
const createdResponse = created({ id: 2, name: 'Jane' });

// Error responses
const errorResponse = notFound('User not found');
const validationResponse = validationError('Invalid input', ['Name is required']);
```

## API

### Success Responses
- `success<T>(data: T, message?, statusCode?)` - Generic success response
- `created<T>(data: T, message?)` - 201 Created response
- `noContent(message?)` - 204 No Content response

### Error Responses
- `error(message, statusCode?, error?)` - Generic error response
- `badRequest(message?, validationError?)` - 400 Bad Request
- `unauthorized(message?)` - 401 Unauthorized
- `forbidden(message?)` - 403 Forbidden
- `notFound(message?)` - 404 Not Found
- `conflict(message?)` - 409 Conflict
- `validationError(message?, errors[])` - 422 Validation Error
- `serverError(message?)` - 500 Internal Server Error

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