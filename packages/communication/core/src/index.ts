/**
 * Communication Core Package
 * @packageDocumentation
 * 
 * Core interfaces and abstract implementations for service-to-service communication.
 * This package provides the foundation for communication protocols, resilience patterns,
 * service discovery, load balancing, and interceptors.
 * 
 * Usage:
 * ```typescript
 * import { Client, BaseClient } from '@naman_deep_singh/communication-core';
 * ```
 */

// Core interfaces
export * from './interfaces/index.js';

// Abstract base implementations
export * from './abstract/index.js';

// Type definitions
export * from './types/index.js';

// Error classes
export * from './errors/index.js';