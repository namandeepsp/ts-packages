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
| Legacy API (`success`, `error`, etc.)          |   ⚠️ Deprecated   |

---

## 📦 Installation

```bash
npm install @naman_deep_singh/response-utils

🧠 Architecture Overview

response-utils
  ├─ core/          → BaseResponder + config + factory (framework-independent)
  ├─ adapters/
  │   └─ express/   → ExpressResponder + middleware
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

✔ Framework-Agnostic Base Usage
import { BaseResponder } from '@naman_deep_singh/response-utils';

const r = new BaseResponder();

// Returns envelope only → no HTTP involvement
const result = r.ok({ user: "John" }, "Loaded");
console.log(result);

🌐 Express Integration (Recommended)

Middleware Setup

import express from 'express';
import { responderMiddleware } from '@naman_deep_singh/response-utils/adapters/express';

const app = express();
app.use(responderMiddleware());
Controller Usage
app.get('/user', (req, res) => {
  const r = (res as any).responder();

  return r.okAndSend({ id: 1, name: "John Doe" }, "User found");
});
okAndSend() automatically applies HTTP status + JSON response

⚙️ Configurable Response Metadata

app.use(responderMiddleware({
  timestamp: true,
  extra: { service: "user-service" }
}));

Example output:

{
  "success": true,
  "data": {...},
  "error": null,
  "meta": {
    "timestamp": "2025-11-22T12:00:00Z",
    "service": "user-service"
  }
}

🔢 Pagination

const r = (res as any).responder();

r.paginatedAndSend(
  [{ id: 1 }],
  "Loaded",
  { page: 1, limit: 10, total: 42 }
);

📚 Supported Methods

BaseResponder Success Methods
Method	Status Code
ok()	200
created()	201
noContent()	204
paginated()	200
BaseResponder Error Methods
Method	Status Code
badRequest()	400
unauthorized()	401
forbidden()	403
notFound()	404
timeout()	408
conflict()	409
validationError()	422
tooManyRequests()	429
serverError()	500
Each has a matching *AndSend Express variant.
Example → notFoundAndSend(), createdAndSend()

🧩 Extendable Adapter-Friendly Design

You can write responders for:

Fastify

Hono

AWS Lambda

WebSockets

GraphQL

RPC Frameworks

Example:

class HonoResponder extends BaseResponder {
  // custom send logic...
}

🕘 Legacy API Support (Optional)

import { success, error } from '@naman_deep_singh/response-utils/legacy';

success({ id: 1 });
⚠ Best for quick scripts or migration — new API recommended

🔜 Roadmap

Feature	Status
Fastify Adapter	Planned
Hono Adapter	Planned
Custom Error Classes	Planned
Standardized Status Enums	Planned

📄 License

MIT © Naman Deep Singh
```