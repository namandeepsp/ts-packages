```bash
🚀 Naman’s TypeScript Utilities Monorepo

Version - 4.0.0

A curated collection of production-ready TypeScript packages designed to help developers build scalable Node.js, Express, and microservice-based applications with clean architecture and best practices.

All packages are framework-friendly, tree-shakable, and published independently.

📦 Packages
🧠 @naman_deep_singh/cache

High-performance caching utilities.

In-memory cache

LRU cache support

TTL-based expiration

Useful for API responses, configs, and computed data

❌ @naman_deep_singh/errors

Standardized error handling for backend applications.

Custom error classes

HTTP-friendly error types

Operational vs programmer errors

Works great with Express & REST APIs

🌐 @naman_deep_singh/http-response

Consistent HTTP response helpers.

Success & error response builders

Standard response formats

Common HTTP status abstractions

Helps keep API responses uniform across services

🔐 @naman_deep_singh/security

Security utilities for Node.js applications.

Common security middlewares

Headers & protection helpers

Designed for Express-based services

🧩 @naman_deep_singh/server

Server-side helpers and bootstrapping utilities.

Express server setup helpers

Middleware composition

Lifecycle & initialization utilities

Useful for microservices and monoliths

🛠️ @naman_deep_singh/utils

Advanced JavaScript & TypeScript utilities.

Safe prototype extensions (opt-in)

Object, Array, String, Number helpers

Deep clone, freeze, pick/omit, path helpers

Strongly typed and tree-shakable

🏗️ Monorepo Structure
packages/
  ├── cache
  ├── errors
  ├── http-response
  ├── security
  ├── server
  └── utils


Each package:

Has its own package.json

Is built as ESM + CJS

Ships TypeScript declarations

Can be used independently

🎯 Goals

Promote consistency across services

Reduce boilerplate in backend projects

Encourage clean, reusable abstractions

Be suitable for microservices & monoliths

📜 License

ISC © Naman Deep Singh
```