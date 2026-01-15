// Circuit breaker implementation
export { CircuitBreakerImpl } from './CircuitBreakerImpl.js';

// Legacy types for backward compatibility
export type { CircuitBreakerMetrics } from './CircuitBreakerMetrics.js';
export { createDefaultMetrics } from './CircuitBreakerMetrics.js';

// Re-export core types
export type { CircuitBreakerConfig, CircuitBreakerState } from '@naman_deep_singh/communication-core';