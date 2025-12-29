# @naman_deep_singh/http-response

**Version:** 3.2.0

A flexible, framework-agnostic **TypeScript response utility library** for building consistent, typed, and configurable API responses.

Designed with a clean **core + adapter** architecture.  
First-class support for **Express.js**, pagination, and standardized HTTP status handling.

---

## 🚀 Features

| Feature                                      | Status |
|---------------------------------------------|:------:|
| Fully typesafe response envelopes            |   ✅   |
| Framework-agnostic core                      |   ✅   |
| Express.js responder adapter                 |   ✅   |
| Express middleware injection                 |   ✅   |
| Pagination helpers                           |   ✅   |
| Centralized responder configuration          |   ✅   |
| HTTP status constants                        |   ✅   |

---

## 📦 Installation

```sh
npm install @naman_deep_singh/http-response

📄 Response Envelope (Default Shape)
interface ResponseEnvelope<P = unknown, M = Record<string, unknown>> {
  success: boolean
  message?: string
  data?: P
  error: {
    message: string
    code?: string
    details?: unknown
  } | null
  meta: M | null
}
🛠️ Usage
✔ Framework-Agnostic (No Express)
import { BaseResponder } from '@naman_deep_singh/http-response'

const responder = new BaseResponder()

const result = responder.ok({ user: 'John' }, 'Loaded')

// When no sender is attached, returns:
// { status: 200, body: ResponseEnvelope }
console.log(result)
🌐 Express Integration
1️⃣ Register Middleware
import express from 'express'
import { responderMiddleware } from '@naman_deep_singh/http-response'

const app = express()

app.use(responderMiddleware())
This injects a res.responder() factory into every request.

2️⃣ Controller Usage
app.get('/user', (req, res) => {
  const responder = res.responder<{ id: number; name: string }>()

  responder.okAndSend(
    { id: 1, name: 'John Doe' },
    'User found'
  )
})
✅ okAndSend() automatically:

sets HTTP status

sends JSON response

returns void for clean controller ergonomics

⚙️ Middleware Configuration
app.use(
  responderMiddleware({
    timestamp: true,
    extra: { service: 'user-service' },
  })
)
Example response:

{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-11-22T12:00:00Z"
  },
  "service": "user-service"
}
🔢 Pagination Support
responder.paginateAndSend(
  [{ id: 1 }],
  1,    // page
  10,   // limit
  42,   // total
  'Loaded'
)
Pagination metadata is automatically calculated.

📚 Available Methods
✅ Success Responses
Method	HTTP
ok()	200
created()	201
noContent()	204
paginate()	200
Each method has an Express variant:

okAndSend()

createdAndSend()

paginateAndSend()

❌ Error Responses
Method	HTTP
badRequest()	400
unauthorized()	401
forbidden()	403
notFound()	404
conflict()	409
unprocessableEntity()	422
tooManyRequests()	429
serverError()	500
Each also has a *AndSend() variant.

🧩 HTTP Status Constants
import { HTTP_STATUS } from '@naman_deep_singh/http-response'

HTTP_STATUS.SUCCESS.OK              // 200
HTTP_STATUS.CLIENT_ERROR.NOT_FOUND  // 404
HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR // 500
Categories
SUCCESS

REDIRECTION

CLIENT_ERROR

SERVER_ERROR

✔ Object.freeze() protected
✔ Fully literal-typed (as const)
✔ IDE autocomplete friendly

🧩 TypeScript: Express Response Augmentation (Recommended)
For full type safety, add this once in your project:

import type { ExpressResponder } from '@naman_deep_singh/http-response'

declare global {
  namespace Express {
    interface Response {
      responder: <P = unknown>() => ExpressResponder<P>
    }
  }
}

⚠️ Do not use for new projects.

🔗 Integration with Other Packages
With @naman_deep_singh/server
import { responderMiddleware } from '@naman_deep_singh/http-response'

server.app.use(responderMiddleware())
With @naman_deep_singh/errors
import { expressErrorHandler } from '@naman_deep_singh/errors'

server.app.use(expressErrorHandler)
Provides consistent error responses across services.

🔜 Roadmap
Fastify adapter

Hono adapter

Configurable envelope key mapping

📄 License
MIT © Naman Deep Singh