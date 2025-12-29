```bash
@naman_deep_singh/errors

Version: 2.2.0

A standardized, code-driven error handling system for TypeScript and Express applications, providing consistent error identity, responses, and middleware integration.

🚀 Features

✅ Structured Error Classes — AppError, HTTPError, ValidationError, etc.
✅ Strongly-Typed Error Codes — Centralized error identity via constants
✅ Centralized Error Messages — One source of truth for user-facing messages
✅ Express Middleware — Error converter & global handler
✅ Response Integration — Works seamlessly with @naman_deep_singh/http-response
✅ TypeScript First — Full type safety & IntelliSense
✅ Consistent API Responses — Unified error shape across services
✅ Extendable Error Messages — Add or override messages at runtime

📦 Installation
npm install @naman_deep_singh/errors

🧠 Design Philosophy

This package is code-driven, not message-driven.

Errors are identified by stable error codes.

Messages are resolved internally via centralized mappings.

API contracts remain stable even if messages change.

Benefits:

✅ Consistency across microservices
✅ Safe refactoring
✅ Better logging, tracing, and observability

🔧 Usage
Creating Errors (Recommended)
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} from '@naman_deep_singh/errors'

// Basic usage
throw new BadRequestError()

throw new UnauthorizedError()

throw new NotFoundError()

// With additional details
throw new ValidationError({
  fields: ['email', 'password'],
})

throw new InternalServerError()

🧾 Error Codes & Messages
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ErrorCode,
} from '@naman_deep_singh/errors'


ERROR_CODES — Canonical list of all supported error codes

ERROR_MESSAGES — Mapping of error codes → user-facing messages

ErrorCode — Union type of all valid error codes

Why Error Codes?

✅ Consistent error identity across services
✅ Centralized message management
✅ Safer API contracts
✅ Improved logging & observability

🌐 Express Middleware
import express from 'express'
import {
  errorConverter,
  expressErrorHandler,
  ValidationError,
} from '@naman_deep_singh/errors'

const app = express()

// Convert unknown / third-party errors → AppError
app.use(errorConverter)

// Handle all errors consistently
app.use(expressErrorHandler)

app.post('/users', (req, res) => {
  if (!req.body.email) {
    throw new ValidationError({
      fields: ['email'],
    })
  }
})


Middleware Responsibilities

errorConverter — Converts unknown errors into AppError, preserves operational errors

expressErrorHandler — Sends standardized API responses and integrates with @naman_deep_singh/http-response

🔗 Integration
With @naman_deep_singh/http-response
import { responderMiddleware } from '@naman_deep_singh/http-response'
import { expressErrorHandler } from '@naman_deep_singh/errors'

app.use(responderMiddleware())
app.use(expressErrorHandler)

With @naman_deep_singh/server
import { createServer } from '@naman_deep_singh/server'
import { expressErrorHandler } from '@naman_deep_singh/errors'

const server = createServer('My API', '1.0.0')
server.app.use(expressErrorHandler)

🧠 Extending & Adding Error Messages

You can safely extend existing errors or add new codes/messages dynamically.

Extending Existing Error Class
import { InternalServerError, ERROR_CODES } from '@naman_deep_singh/errors'

export class CryptoIntegrityError extends InternalServerError {
  constructor(details?: unknown, cause?: Error) {
    super(ERROR_CODES.CRYPTO_INTEGRITY_ERROR, details, cause)
  }
}

Registering Custom Error Messages
import { errorMessageRegistry } from '@naman_deep_singh/errors'

// Add new messages or override existing ones
errorMessageRegistry.register({
  CUSTOM_ERROR: 'Something went wrong with custom logic',
  VALIDATION_FAILED: 'Custom validation failed message',
})


After this, AppError or any derived class will use the updated messages automatically.

import { AppError, ErrorCode } from '@naman_deep_singh/errors'

throw new AppError(
  'CUSTOM_ERROR' as ErrorCode,
  500,
  {
    reason: "Something went wrong with custom logic"
  }
)

📚 Available Error Classes
Class	Status Code	Use Case
AppError	Custom	Base error class
HTTPError	4xx / 5xx	Base HTTP error
BadRequestError	400	Invalid input
UnauthorizedError	401	Authentication failures
TokenExpiredError	401	Expired tokens
TokenMalformedError	401	Invalid token format
ForbiddenError	403	Authorization failures
NotFoundError	404	Resource not found
ConflictError	409	Resource conflicts
ValidationError	422	Validation errors
RateLimitError	429	Rate limiting
CryptoIntegrityError	500	Crypto validation failure
InternalServerError	500	Server-side failures
ServiceUnavailableError 500 Service not available

🎯 Standard Error Response

All errors resolve to a consistent response shape:

{
  "success": false,
  "code": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": {
    "fields": ["email"]
  },
}

📄 License

ISC © Naman Deep Singh
```