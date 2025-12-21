# @naman_deep_singh/response-utils

**Version:** 2.1.2

A flexible, framework-agnostic **TypeScript** response utility library for building consistent and configurable API responses.  
Supports **Express.js**, pagination, typed payloads, and expandable response adapters.

---

## 🚀 Features

| Feature                                        | Status |
| ---------------------------------------------- | :----: |
| Fully Typesafe Response Envelopes              |   ✅   |
| Framework-Agnostic Core                        |   ✅   |
| Express.js Adapter + Middleware                |   ✅   |
| Automatic HTTP Status Handling                 |   ✅   |
| Pagination Responses                           |   ✅   |
| Centralized Response Config                    |   ✅   |
| Status Code Constants                          |   ✅   |
| Legacy API (`success`, `error`, etc.)          |   ⚠️ Deprecated   |

---

## 📦 Installation

```sh
npm install @naman_deep_singh/response-utils
```

## 🧠 Architecture Overview

```
response-utils
├─ core/          → BaseResponder + config + factory (framework-independent)
├─ adapters/
│   └─ express/   → ExpressResponder + middleware
├─ constants/     → HTTP status constants
└─ legacy/        → success(), error(), etc. (optional migration layer)
```

## 📄 Response Format (Default Envelope)

```typescript
interface ResponseEnvelope<P = unknown, M = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: P;
  error: { message: string; code?: string; details?: unknown } | null;
  meta: M | null;
}
```

## 🛠️ Usage Examples

### ✔ Framework-Agnostic (no Express)
```typescript
import { BaseResponder } from '@naman_deep_singh/response-utils';

const r = new BaseResponder();
const result = r.ok({ user: "John" }, "Loaded");
console.log(result);
```

### 🌐 Express Integration

#### 1️⃣ Add Middleware

```typescript
import express from 'express';
import { responderMiddleware } from '@naman_deep_singh/response-utils';

const app = express();
app.use(responderMiddleware());
```

#### 2️⃣ Controller Usage

```typescript
app.get('/user', (req, res) => {
  const responder = (res as any).responder();
  return responder.okAndSend({ id: 1, name: "John Doe" }, "User found");
});
```

`okAndSend()` automatically applies HTTP status + JSON response.

#### ⚙️ Config Options

```typescript
app.use(responderMiddleware({
  timestamp: true,
  extra: { service: "user-service" }
}));
```

Example output:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-11-22T12:00:00Z",
    "service": "user-service"
  }
}
```

### 🔢 Pagination Support

```typescript
responder.paginateAndSend(
  [{ id: 1 }],
  1, // page
  10, // limit
  42, // total
  "Loaded"
);
```

## 📚 Supported Methods

### Success Methods
| Method | Status |
|--------|--------|
| `ok()` | 200 |
| `created()` | 201 |
| `noContent()` | 204 |
| `paginated()` | 200 |

### Error Methods
| Method | Status |
|--------|--------|
| `badRequest()` | 400 |
| `unauthorized()` | 401 |
| `forbidden()` | 403 |
| `notFound()` | 404 |
| `conflict()` | 409 |
| `unprocessableEntity()` | 422 |
| `tooManyRequests()` | 429 |
| `serverError()` | 500 |

**Each has an Express `*AndSend()` variant**  
Example → `notFoundAndSend()`, `createdAndSend()`

### 🧩 Status Constants

```typescript
import { HTTP_STATUS } from '@naman_deep_singh/response-utils';

console.log(HTTP_STATUS.CLIENT_ERROR.NOT_FOUND); // 404
console.log(HTTP_STATUS.SUCCESS.CREATED); // 201
```

**Categories:**
- `SUCCESS`
- `REDIRECTION`
- `CLIENT_ERROR`
- `SERVER_ERROR`

**All fully readonly + literal typed** ✔


### 🧩 Status Constants

```typescript
import { HTTP_STATUS } from '@naman_deep_singh/response-utils';

console.log(HTTP_STATUS.CLIENT_ERROR.NOT_FOUND); // 404
console.log(HTTP_STATUS.SUCCESS.CREATED); // 201
```

**Categories available:**

- `SUCCESS`
- `REDIRECTION`
- `CLIENT_ERROR`
- `SERVER_ERROR`

All values are:

✔ Object.freeze() protected  
✔ Strongly typed using as const  
✔ Auto-complete supported in IDEs  
✔ Works with any HTTP framework

### 🕘 Legacy API (Migration-friendly)

```typescript
import { success, error } from '@naman_deep_singh/response-utils/legacy';

// Success response
const result = success({ id: 1, name: 'John' }, 'User found', 200);
// Returns: { success: true, message: 'User found', data: {...}, statusCode: 200 }

// Error response  
const errorResult = error('User not found', 404, 'NOT_FOUND');
// Returns: { success: false, message: 'User not found', error: 'NOT_FOUND', statusCode: 404 }

// With Express response object
success({ users: [] }, 'Success', 200, res); // Automatically sends response
error('Server error', 500, undefined, res); // Automatically sends error
```

**Legacy Functions:**
- `success(data, message?, status?, res?)` - Create success response
- `error(message, status?, error?, res?)` - Create error response

⚠ **Recommended only for old codebases.** Use BaseResponder/ExpressResponder for new projects.

## 🔜 Roadmap

| Feature | Status |
|---------|--------|
| Fastify Adapter | Planned |
| Hono Adapter | Planned |
| Custom Error Classes | Planned |

## Integration with Other Packages

### With @naman_deep_singh/server-utils

```typescript
import { createServer } from '@naman_deep_singh/server-utils';
import { responderMiddleware } from '@naman_deep_singh/response-utils';

const server = createServer('My API', '1.0.0');
server.app.use(responderMiddleware());

// All server-utils middleware now uses consistent response format
```

### With @naman_deep_singh/errors-utils

```typescript
import { expressErrorHandler } from '@naman_deep_singh/errors-utils';

// Advanced error handling with consistent responses
server.app.use(expressErrorHandler);
```

## 📄 License

MIT © Naman Deep Singh