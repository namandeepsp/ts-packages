/**
 * Communication Core Package
 * @packageDocumentation
 * 
 * Core interfaces and abstract implementations for service-to-service communication.
 * This package provides the foundation for communication protocols, resilience patterns,
 * service discovery, load balancing, and interceptors.
 */

// Core interfaces
export * from './interfaces/index.js';

// Abstract base implementations
export * from './abstract/index.js';

// Type definitions
export * from './types/index.js';

// Error classes
export * from './errors/index.js';

// Utilities (excluding ConnectionPoolConfig to avoid duplicate)
export {
    TimeoutUtils,
    ConnectionPoolUtils,
    CompressionUtils,
    type Connection,
    type BaseConnection,
} from './utils.js';