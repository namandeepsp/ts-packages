# @naman_deep_singh/response-utils

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
npm install @naman_deep_singh/response-utils\

🧠 Architecture Overview

response-utils
├─ core/          → BaseResponder + config + factory (framework-independent)
├─ adapters/
│   └─ express/   → ExpressResponder + middleware
├─ constants/     → HTTP status constants
└─ legacy/        → success(), error(), etc. (optional migration layer)

📄 Response Format (Default Envelope)

interface ResponseEnvelope<P = unknown, M = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: P;
  error: { message: string; code?: string; details?: unknown } | null;
  meta: M | null;
}

🛠️ Usage Examples

✔ Framework-Agnostic (no Express)
import { BaseResponder } from '@naman_deep_singh/response-utils';

const r = new BaseResponder();
const result = r.ok({ user: "John" }, "Loaded");
console.log(result);

🌐 Express Integration

1️⃣ Add Middleware

import express from 'express';
import { responderMiddleware } from '@naman_deep_singh/response-utils';

const app = express();
app.use(responderMiddleware());

2️⃣ Controller Usage

app.get('/user', (req, res) => {
  const r = (res as any).responder();
  return r.okAndSend({ id: 1, name: "John Doe" }, "User found");
});
okAndSend() automatically applies HTTP status + JSON response.

⚙️ Config Options

app.use(responderMiddleware({
  timestamp: true,
  extra: { service: "user-service" }
}));
Example output:

{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-11-22T12:00:00Z",
    "service": "user-service"
  }
}

🔢 Pagination Support

r.paginatedAndSend(
  [{ id: 1 }],
  "Loaded",
  { page: 1, limit: 10, total: 42 }
);

📚 Supported Methods

Success Methods
Method	Status
ok()	200
created()	201
noContent()	204
paginated()	200
Error Methods
Method	Status
badRequest()	400
unauthorized()	401
forbidden()	403
notFound()	404
conflict()	409
validationError()	422
tooManyRequests()	429
serverError()	500
Each has an Express *AndSend() variant
Example → notFoundAndSend(), createdAndSend()

🧩 Status Constants (New)

import { HTTP_STATUS } from '@naman_deep_singh/response-utils';

console.log(HTTP_STATUS.CLIENT_ERROR.NOT_FOUND); // 404
console.log(HTTP_STATUS.SUCCESS.CREATED); // 201
Categories:

SUCCESS

REDIRECTION

CLIENT_ERROR

SERVER_ERROR

All fully readonly + literal typed ✔

## 🧩 Status Constants

import { HTTP_STATUS } from '@naman_deep_singh/response-utils';

console.log(HTTP_STATUS.CLIENT_ERROR.NOT_FOUND); // 404
console.log(HTTP_STATUS.SUCCESS.CREATED); // 201

Categories available:

SUCCESS

REDIRECTION

CLIENT_ERROR

SERVER_ERROR

All values are:

✔ Object.freeze() protected
✔ Strongly typed using as const
✔ Auto-complete supported in IDEs
✔ Works with any HTTP framework

🕘 Legacy API (Migration-friendly)

import { success, error } from '@naman_deep_singh/response-utils/legacy';

success({ id: 1 });
⚠ Recommended only for old codebases.

🔜 Roadmap

Feature	Status
Fastify Adapter	Planned
Hono Adapter	Planned
Custom Error Classes	Planned

📄 License

MIT © Naman Deep Singh
'''