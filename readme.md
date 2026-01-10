```bash
# 🚀 Naman's TypeScript Utilities Monorepo

**Version: 5.1.0**

A curated collection of production-ready TypeScript packages designed to help developers build scalable Node.js, Express, and microservice-based applications with clean architecture and best practices.

All packages are framework-friendly, tree-shakable, published independently, and follow strict architectural patterns for maintainability.

## 🏗️ Architecture Overview
┌────────────────────────────────────┐
│ Platform / Infrastructure │
├────────────────────────────────────┤
│ Observability Layer │
├────────────────────────────────────┤
│ Communication Layer │
├────────────────────────────────────┤
│ Application Layer │ ← YOU ARE HERE
├────────────────────────────────────┤
│ Domain Layer │
├────────────────────────────────────┤
│ Data / Persistence Layer │
└────────────────────────────────────┘

text

## 📦 Package Ecosystem

### 🧠 **@naman_deep_singh/cache** (`v1.7.0+`)
**High-performance, multi-adapter caching system**
- **Adapters**: Redis, Memcache, in-memory with automatic fallback
- **Features**: LRU support, TTL-based expiration, cluster support
- **Use Cases**: API responses, session storage, computed data caching
- **Integration**: Built-in health checks, graceful shutdown support

### 📡 **@naman_deep_singh/communication-core** (`v1.0.0+`)
**Core interfaces and abstract classes for service-to-service communication**
- **Architecture**: Foundation for 5 specialized communication subpackages
- **Protocols**: HTTP, gRPC, WebSocket interface definitions
- **Resilience**: Circuit breaker and retry strategy interfaces
- **Features**: Service discovery, load balancing, connection pooling
- **Patterns**: Abstract base classes with common functionality
- **Extensibility**: Build custom protocols and strategies on solid foundations

### ⚠️ **@naman_deep_singh/errors** (`v2.3.0+`)
**Standardized error handling framework**
- **Error Classes**: `AppError`, `ValidationError`, `UnauthorizedError`, etc.
- **HTTP Integration**: Express middleware with proper status codes
- **Features**: Error cause chaining, structured error details
- **Best Practices**: Operational vs programmer error separation

### 🌐 **@naman_deep_singh/http-response** (`latest`)
**Consistent HTTP response utilities**
- **Response Builders**: Success, error, and paginated response helpers
- **Format Standardization**: Uniform API response structure
- **HTTP Abstractions**: Common status codes and response patterns
- **Middleware**: Express responder middleware for easy integration

### 🔐 **@naman_deep_singh/security** (`v1.7.0+`)
**Security utilities for Node.js applications**
- **Token Management**: JWT creation, verification, and extraction
- **Security Headers**: Helmet configurations and CSP helpers
- **Input Validation**: Sanitization and validation utilities
- **Express Middleware**: Authentication and authorization helpers

### 🚀 **@naman_deep_singh/server** (`v1.6.0+`)
**Extensible server utilities for Express.js microservices**
- **Multi-Protocol**: HTTP, gRPC, JSON-RPC, WebSockets, Webhooks
- **Built-in Features**: Caching, sessions, health checks, graceful shutdown
- **Middleware Collection**: Auth, validation, rate limiting, logging
- **Production Ready**: TypeScript support, environment utilities

### 🛠️ **@naman_deep_singh/utils** (`latest`)
**Advanced JavaScript & TypeScript utilities**
- **Safe Extensions**: Opt-in prototype extensions with type safety
- **Object Utilities**: Deep clone, freeze, pick/omit, path helpers
- **Type Guards**: Runtime type checking and validation
- **Tree-Shakable**: Import only what you need

## 🏗️ Monorepo Structure
packages/
├── cache/ # Caching utilities
├── communication/
│   └── core/ # Communication layer foundation
├── errors/ # Error handling framework
├── http-response/ # HTTP response utilities
├── security/ # Security utilities
├── server/ # Server utilities & middleware
└── utils/ # General TypeScript utilities

text

## 📐 Architecture & Development Rules

### Package Structure Rules
Each package follows these strict patterns:

1. **Barrel Exports Pattern**
   - Every folder inside `src/` must have an `index.ts` file
   - Index files must explicitly re-export public APIs (no wildcards except root)
   - Root `src/index.ts` can use `export *` for aggregation

2. **Import/Export Rules**
   - ❌ No `export *` except in root `src/index.ts`
   - ❌ No index-file imports inside package code (index files are for consumers only)
   - ✅ All imports must use `.js` extensions for TypeScript resolution
   - ✅ Type imports must use `type` keyword: `import type { ... }`
   - ✅ No missed exports - every public export must be re-exported in folder index

3. **TypeScript Configuration**
   - Dual CJS/ESM builds with separate output directories
   - Type declarations shipped with each package
   - Strict TypeScript configuration enabled
   - Path aliases for clean imports

4. **Package Independence**
   - Each package has its own `package.json` and build process
   - Packages can be used independently or together
   - Clear dependency management between packages
   - Versioned independently with semantic versioning

### Build & Distribution
- **Dual Module Support**: ESM (`dist/esm/`) + CJS (`dist/cjs/`) outputs
- **Type Declarations**: Complete TypeScript support (`dist/types/`)
- **Tree Shaking**: ESM builds optimized for bundle size
- **Side Effects**: Marked as side-effect free where possible

### Code Quality Standards
- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Handling**: Consistent error patterns across all packages
- **Documentation**: JSDoc comments and comprehensive READMEs
- **Testing**: Each package includes its own test suite

## 🚀 Getting Started

### Installation
```bash
# Install individual packages as needed
npm install @naman_deep_singh/server
npm install @naman_deep_singh/errors
npm install @naman_deep_singh/cache
npm install @naman_deep_singh/communication-core

# Or install all packages
npm install @naman_deep_singh/cache \
            @naman_deep_singh/communication-core \
            @naman_deep_singh/errors \
            @naman_deep_singh/http-response \
            @naman_deep_singh/security \
            @naman_deep_singh/server \
            @naman_deep_singh/utils
Basic Example
typescript
import { createServer } from '@naman_deep_singh/server';
import { AppError } from '@naman_deep_singh/errors';

const server = createServer('My API', '1.0.0', {
  port: 3000,
  cache: { enabled: true, adapter: 'redis' }
});

server.app.get('/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    throw new AppError('Failed to fetch users', 500);
  }
});

await server.start();
🔧 Development
Monorepo Management
bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Build specific package
cd packages/server && pnpm run build

# Run tests
pnpm run test

# Publish packages
pnpm -r publish
Package Relationships
text
cache → (no internal dependencies)
communication-core → errors + http-response + utils
errors → (no internal dependencies)
security → errors
http-response → errors
server → cache + errors + security
utils → (no internal dependencies)
🎯 Design Philosophy
Consistency First

Uniform API patterns across all packages

Consistent error handling and response formats

Standardized configuration patterns

Production Ready

Built-in health checks and monitoring

Graceful shutdown handling

Comprehensive logging and debugging

Security best practices by default

Framework Agnostic

Works with Express, Fastify, or any Node.js framework

No framework lock-in

Clean separation of concerns

TypeScript Native

Full type safety from ground up

Type definitions for all public APIs

Editor auto-completion and IntelliSense

Microservices Ready

Independent package usage

Lightweight dependencies

Horizontal scalability support

📚 Documentation
Each package includes:

Detailed README with usage examples

API Reference with TypeScript examples

Migration Guides for version upgrades

Integration Examples with common frameworks

🤝 Contributing
Follow the established architectural patterns

Maintain backward compatibility with semver

Add comprehensive TypeScript definitions

Include tests for new functionality

Update documentation for all changes

📊 Version Compatibility
| Package | Version | Node.js | TypeScript |
|---------|---------|---------|------------|
| cache | 1.7.0+ | 18+ | 5.0+ |
| communication-core | 1.0.0+ | 18+ | 5.0+ |
| errors | 2.3.0+ | 18+ | 5.0+ |
| http-response | latest | 18+ | 5.0+ |
| security | 1.7.0+ | 18+ | 5.0+ |
| server | 1.6.0+ | 18+ | 5.0+ |
| utils | latest | 18+ | 5.0+ |
🛡️ License
ISC License © Naman Deep Singh
```