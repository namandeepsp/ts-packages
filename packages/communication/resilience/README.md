# @naman_deep_singh/communication-resilience

**Version:** 1.0.0

> Production-ready resilience patterns (retry strategies and circuit breakers) for service-to-service communication in TypeScript microservices

## Overview

This package provides complete implementations of resilience patterns for distributed communication systems. It extends the abstract base classes from `@naman_deep_singh/communication-core` with fully functional retry strategies and circuit breaker implementations.

## Features

- 🔄 **Multiple Retry Strategies**: Fixed delay, exponential backoff, linear backoff, and jitter-based backoff
- 🛑 **Circuit Breaker Pattern**: Prevent cascading failures with state-based circuit breaking
- 📊 **Statistics & Metrics**: Track attempts, successes, failures, and state transitions
- 🎯 **Type-Safe**: Full TypeScript support with strict typing throughout
- 🔌 **Event-Driven**: Emit events for monitoring and observability
- ⚙️ **Configurable**: Extensive configuration options for all strategies
- 🚀 **Production-Ready**: Error handling, health checks, and comprehensive logging
- 📦 **Zero Dependencies**: Only depends on `@naman_deep_singh/communication-core` and Node.js built-ins

## Installation

```bash
npm install @naman_deep_singh/communication-resilience
```

### Peer Dependencies

- `@naman_deep_singh/communication-core` (^1.2.2)

## Quick Start

### Using Retry Strategies

#### Fixed Delay Retry

```typescript
import { FixedDelayRetry } from '@naman_deep_singh/communication-resilience';

const retryStrategy = new FixedDelayRetry('api-calls', {
    maxAttempts: 3,
    delayMs: 1000
});

try {
    const result = await retryStrategy.execute(async () => {
        return await fetchData();
    });
} catch (error) {
    console.error('Failed after retries:', error);
}
```

#### Exponential Backoff Retry

```typescript
import { ExponentialBackoffRetry } from '@naman_deep_singh/communication-resilience';

const retryStrategy = new ExponentialBackoffRetry('api-calls', {
    maxAttempts: 5,
    baseDelayMs: 100,
    maxDelayMs: 10000,
    jitter: true
});

const result = await retryStrategy.execute(async () => {
    return await makeRequest();
});
```

#### Jitter Retry

```typescript
import { JitterRetry } from '@naman_deep_singh/communication-resilience';

// Jitter-based backoff (exponential with jitter enabled)
const retryStrategy = new JitterRetry('critical-operation', {
    maxAttempts: 4,
    baseDelayMs: 50,
    maxDelayMs: 5000
});

const result = await retryStrategy.execute(async () => {
    return await criticalOperation();
});
```

#### Linear Backoff Retry

```typescript
import { LinearBackoffRetry } from '@naman_deep_singh/communication-resilience';

const retryStrategy = new LinearBackoffRetry('db-query', {
    maxAttempts: 3,
    initialDelayMs: 100,
    incrementMs: 100,
    maxDelayMs: 500
});

const result = await retryStrategy.execute(async () => {
    return await queryDatabase();
});
```

### Using Circuit Breaker

```typescript
import { CircuitBreakerImpl } from '@naman_deep_singh/communication-resilience';

const circuitBreaker = new CircuitBreakerImpl('external-api', {
    failureThreshold: 5,
    successThreshold: 2,
    resetTimeout: 60000 // 1 minute
});

try {
    const result = await circuitBreaker.execute(async () => {
        return await callExternalAPI();
    });
} catch (error) {
    if (error.code === 'ECIRCUITOPEN') {
        console.error('Circuit breaker is open, request rejected');
    }
}
```

### Using Policies

#### RetryPolicy Factory

```typescript
import { RetryPolicy } from '@naman_deep_singh/communication-resilience';

const retryPolicy = new RetryPolicy({
    strategy: 'exponential',
    maxAttempts: 5,
    baseDelayMs: 100,
    maxDelayMs: 10000,
    jitter: true
});

const retryStrategy = retryPolicy.createStrategy('api-request');

const result = await retryStrategy.execute(async () => {
    return await makeAPIRequest();
});
```

#### CircuitBreakerPolicy Factory

```typescript
import { CircuitBreakerPolicy } from '@naman_deep_singh/communication-resilience';

const cbPolicy = new CircuitBreakerPolicy({
    failureThreshold: 5,
    successThreshold: 2,
    resetTimeout: 30000
});

const circuitBreaker = cbPolicy.createCircuitBreaker('external-service');

const result = await circuitBreaker.execute(async () => {
    return await callService();
});
```

## Core Components

### Retry Strategies

All retry strategies extend `BaseRetryStrategy` from communication-core and implement the `IRetryStrategy` interface.

#### FixedDelayRetry

Fixed delay between retry attempts.

**Configuration:**
- `maxAttempts`: Maximum number of retry attempts
- `delayMs`: Fixed delay in milliseconds between attempts

#### ExponentialBackoffRetry

Exponentially increasing delay between retry attempts.

**Configuration:**
- `maxAttempts`: Maximum number of retry attempts
- `baseDelayMs`: Initial delay in milliseconds
- `maxDelayMs`: Maximum delay cap in milliseconds
- `jitter`: Enable jitter to prevent thundering herd (default: true)

#### JitterRetry

Exponential backoff with jitter always enabled for distributed systems.

**Configuration:**
- Same as `ExponentialBackoffRetry`
- Jitter is always true

#### LinearBackoffRetry

Linearly increasing delay between retry attempts.

**Configuration:**
- `maxAttempts`: Maximum number of retry attempts
- `initialDelayMs`: Initial delay in milliseconds
- `incrementMs`: Increment per attempt in milliseconds
- `maxDelayMs`: Maximum delay cap in milliseconds

### Circuit Breaker

`CircuitBreakerImpl` extends `BaseCircuitBreaker` and implements `ICircuitBreaker`.

#### States

1. **Closed**: Normal operation, requests pass through
2. **Open**: Failures exceeded threshold, requests rejected immediately
3. **Half-Open**: Testing if service recovered, one request allowed

#### Configuration

```typescript
interface CircuitBreakerConfig {
    failureThreshold?: number;     // Number of failures to open circuit (default: 5)
    successThreshold?: number;     // Consecutive successes to close circuit (default: 2)
    resetTimeout?: number;         // Time to wait before half-open (default: 60000ms)
    halfOpenMaxAttempts?: number;  // Attempts allowed in half-open (default: 1)
}
```

#### Methods

```typescript
// Execute with circuit breaker protection
execute<T>(fn: () => Promise<T>): Promise<T>

// Execute with context
executeWithContext<T, C>(fn: (context: C) => Promise<T>, context: C): Promise<T>

// State checks
isOpen(): boolean
isClosed(): boolean
isHalfOpen(): boolean

// Manual control
trip(error?: CommunicationError): void
reset(): void

// Metrics
getStats(): CircuitBreakerStats
resetStats(): void

// Configuration
updateConfig(config: Partial<CircuitBreakerConfig>): void

// Health
healthCheck(): HealthCheckResult
```

## Event Handling

### Retry Strategy Events

Retry strategies emit events throughout their lifecycle:

```typescript
const retryStrategy = new ExponentialBackoffRetry('task', config);

if (retryStrategy.events) {
    retryStrategy.events.on('retry', (event) => {
        console.log(`Retry attempt ${event.attempt}`);
    });
    
    retryStrategy.events.on('exhausted', (event) => {
        console.error(`All ${event.attempts} retries exhausted`);
    });
}
```

### Circuit Breaker Events

Circuit breaker emits state change and execution events:

```typescript
const circuitBreaker = new CircuitBreakerImpl('service', config);

circuitBreaker.eventEmitter.on('open', ({ name, at }) => {
    console.log(`Circuit breaker ${name} opened at ${new Date(at)}`);
});

circuitBreaker.eventEmitter.on('close', ({ name }) => {
    console.log(`Circuit breaker ${name} closed`);
});

circuitBreaker.eventEmitter.on('success', ({ name }) => {
    console.log(`Request via ${name} succeeded`);
});

circuitBreaker.eventEmitter.on('failure', ({ name, failures }) => {
    console.log(`Request via ${name} failed (${failures} total failures)`);
});
```

## Statistics & Monitoring

### Retry Strategy Statistics

```typescript
const stats = retryStrategy.getStats();

console.log({
    totalExecutions: stats.totalExecutions,
    totalAttempts: stats.totalAttempts,
    successfulRetries: stats.successfulRetries,
    failedRetries: stats.failedRetries,
    successRate: stats.successRate,
    averageAttempts: stats.averageAttempts,
    averageDelay: stats.averageDelay,
    totalTimeSpent: stats.totalTimeSpent
});
```

### Circuit Breaker Statistics

```typescript
const stats = circuitBreaker.getStats();

console.log({
    totalExecutions: stats.totalExecutions,
    totalSuccesses: stats.totalSuccesses,
    totalFailures: stats.totalFailures,
    successRate: stats.successRate,
    failureRate: stats.failureRate,
    totalTimeOpen: stats.totalTimeOpen,
    totalTimeClosed: stats.totalTimeClosed,
    lastStateChange: stats.lastStateChange
});
```

## Health Checks

### Retry Strategy Health

```typescript
const health = retryStrategy.healthCheck();

console.log({
    healthy: health.healthy,           // Always true
    message: health.message,
    details: health.details
});
```

### Circuit Breaker Health

```typescript
const health = circuitBreaker.healthCheck();

console.log({
    healthy: health.healthy,           // true if closed or half-open
    state: health.state,               // 'closed' | 'open' | 'half-open'
    message: health.message,
    details: health.details
});
```

## Advanced Usage

### Combining Retry and Circuit Breaker

```typescript
import { ExponentialBackoffRetry, CircuitBreakerImpl } from '@naman_deep_singh/communication-resilience';

const circuitBreaker = new CircuitBreakerImpl('api', {
    failureThreshold: 5,
    resetTimeout: 60000
});

const retryStrategy = new ExponentialBackoffRetry('api-retry', {
    maxAttempts: 3,
    baseDelayMs: 100,
    maxDelayMs: 5000
});

// Circuit breaker with retries
const result = await circuitBreaker.execute(async () => {
    return await retryStrategy.execute(async () => {
        return await makeRequest();
    });
});
```

### Custom Decision Functions

```typescript
import { ExponentialBackoffRetry } from '@naman_deep_singh/communication-resilience';
import type { RetryDecision } from '@naman_deep_singh/communication-core';

const retryStrategy = new ExponentialBackoffRetry('api', config);

const result = await retryStrategy.executeWithDecision(
    async () => {
        return await makeRequest();
    },
    (error, context) => {
        // Custom logic to determine if retry should happen
        const decision: RetryDecision = {
            shouldRetry: error.statusCode >= 500 && context.attempt < 3,
            delay: 1000,
            reason: 'Server error, will retry'
        };
        return decision;
    }
);
```

### Configuration Updates

```typescript
const retryStrategy = new ExponentialBackoffRetry('api', config);

// Update configuration dynamically
retryStrategy.updateConfig({
    maxAttempts: 5,
    backoff: {
        initialDelay: 200,
        maxDelay: 8000
    }
});
```

## Error Handling

All errors from retry strategies and circuit breakers extend `CommunicationError` from the core package:

```typescript
import { RetryError, CircuitBreakerError } from '@naman_deep_singh/communication-core';

try {
    await retryStrategy.execute(async () => {
        // operation
    });
} catch (error) {
    if (error instanceof RetryError) {
        console.error('Retry exhausted:', error.message);
    }
}

try {
    await circuitBreaker.execute(async () => {
        // operation
    });
} catch (error) {
    if (error.code === 'ECIRCUITOPEN') {
        console.error('Circuit is open');
    }
}
```

## Best Practices

### 1. Choose Appropriate Backoff Strategy

- **Fixed Delay**: Simple operations with predictable failures
- **Exponential Backoff**: Remote APIs, external services
- **Jitter**: High-concurrency systems to prevent thundering herd
- **Linear**: Moderate delay increase for transient failures

### 2. Circuit Breaker Thresholds

```typescript
// Conservative (for critical services)
{ failureThreshold: 5, successThreshold: 2, resetTimeout: 120000 }

// Moderate (general use)
{ failureThreshold: 5, successThreshold: 2, resetTimeout: 60000 }

// Aggressive (for fault-tolerant services)
{ failureThreshold: 10, successThreshold: 3, resetTimeout: 30000 }
```

### 3. Combine Strategies

Always combine circuit breaker with retries:

```typescript
const circuitBreaker = new CircuitBreakerImpl('service');
const retryStrategy = new ExponentialBackoffRetry('service-retry');

await circuitBreaker.execute(async () => {
    return await retryStrategy.execute(async () => {
        return await makeRequest();
    });
});
```

### 4. Monitor Events

Set up event listeners for operational observability:

```typescript
circuitBreaker.eventEmitter.on('open', (event) => {
    logger.warn('Circuit breaker opened', event);
    metrics.increment('circuit_breaker_opened');
});

retryStrategy.events?.on('exhausted', (event) => {
    logger.error('Retries exhausted', event);
    metrics.increment('retries_exhausted');
});
```

### 5. Health Checks

Integrate health checks into your monitoring:

```typescript
app.get('/health/resilience', (req, res) => {
    const cbHealth = circuitBreaker.healthCheck();
    const retryHealth = retryStrategy.healthCheck();
    
    res.json({
        circuitBreaker: cbHealth,
        retryStrategy: retryHealth,
        overall: cbHealth.healthy && retryHealth.healthy
    });
});
```

## API Reference

### FixedDelayRetry

```typescript
new FixedDelayRetry(name: string, config?: FixedDelayConfig)
```

### ExponentialBackoffRetry

```typescript
new ExponentialBackoffRetry(name: string, config?: ExponentialBackoffConfig)
```

### JitterRetry

```typescript
new JitterRetry(name: string, config?: JitterRetryConfig)
```

### LinearBackoffRetry

```typescript
new LinearBackoffRetry(name: string, config?: LinearBackoffConfig)
```

### CircuitBreakerImpl

```typescript
new CircuitBreakerImpl(name: string, config?: Partial<CircuitBreakerConfig>)
```

### RetryPolicy

```typescript
new RetryPolicy(config: IRetryPolicyConfig)
```

### CircuitBreakerPolicy

```typescript
new CircuitBreakerPolicy(config: CircuitBreakerConfig)
```

## License

ISC

## Author

Naman Deep Singh
