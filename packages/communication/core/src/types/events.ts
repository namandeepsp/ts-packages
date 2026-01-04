/**
 * Event types for communication layer
 * @packageDocumentation
 */

import type { ServiceInstance } from './service.js';
import type { CircuitBreakerState } from './config.js';
import type { CommunicationError } from '../errors/CommunicationError.js';

/**
 * Base event interface
 */
export interface BaseEvent {
    /** Event type */
    type: string;

    /** Event timestamp */
    timestamp: number;

    /** Event source */
    source?: string;

    /** Correlation ID for tracing */
    correlationId?: string;

    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Circuit breaker events
 */
export interface CircuitBreakerEvent extends BaseEvent {
    type: 'circuit-breaker';

    /** Circuit breaker name */
    name: string;

    /** New state */
    state: CircuitBreakerState;

    /** Previous state */
    previousState: CircuitBreakerState;

    /** Failure count */
    failureCount: number;

    /** Success count */
    successCount: number;

    /** Error that triggered state change */
    error?: CommunicationError;
}

/**
 * Retry events
 */
export interface RetryEvent extends BaseEvent {
    type: 'retry';

    /** Operation being retried */
    operation: string;

    /** Current retry attempt */
    attempt: number;

    /** Maximum retry attempts */
    maxAttempts: number;

    /** Delay before next retry in milliseconds */
    delay: number;

    /** Error that triggered retry */
    error: CommunicationError;

    /** Total elapsed time in milliseconds */
    elapsedTime: number;
}

/**
 * Service discovery events
 */
export interface ServiceDiscoveryEvent extends BaseEvent {
    type: 'service-discovery';

    /** Service name */
    serviceName: string;

    /** Event subtype */
    subtype: 'registered' | 'deregistered' | 'updated' | 'health-changed';

    /** Service instance */
    instance: ServiceInstance;

    /** Previous instance state (for updates) */
    previousInstance?: ServiceInstance;

    /** List of all available instances after event */
    allInstances: ServiceInstance[];
}

/**
 * Load balancing events
 */
export interface LoadBalancingEvent extends BaseEvent {
    type: 'load-balancing';

    /** Service name */
    serviceName: string;

    /** Selected instance */
    selectedInstance: ServiceInstance;

    /** Available instances */
    availableInstances: ServiceInstance[];

    /** Load balancing strategy used */
    strategy: string;

    /** Selection duration in milliseconds */
    selectionDuration: number;
}

/**
 * Protocol events
 */
export interface ProtocolEvent extends BaseEvent {
    type: 'protocol';

    /** Protocol name */
    protocol: string;

    /** Event subtype */
    subtype: 'request' | 'response' | 'error' | 'connection' | 'disconnection';

    /** Request ID */
    requestId?: string;

    /** Duration in milliseconds (for request/response) */
    duration?: number;

    /** Status code (for HTTP responses) */
    statusCode?: number;

    /** Error (for error events) */
    error?: CommunicationError;

    /** Payload size in bytes */
    payloadSize?: number;
}

/**
 * Connection events
 */
export interface ConnectionEvent extends BaseEvent {
    type: 'connection';

    /** Event subtype */
    subtype: 'opened' | 'closed' | 'error' | 'reconnected';

    /** Connection ID */
    connectionId: string;

    /** Remote address */
    remoteAddress?: string;

    /** Connection duration in milliseconds */
    duration?: number;

    /** Error (for error events) */
    error?: CommunicationError;

    /** Reconnection attempt number */
    reconnectionAttempt?: number;
}

/**
 * Metrics events
 */
export interface MetricsEvent extends BaseEvent {
    type: 'metrics';

    /** Metrics name */
    name: string;

    /** Metrics value */
    value: number;

    /** Metrics type */
    metricsType: 'counter' | 'gauge' | 'histogram' | 'summary';

    /** Labels/tags */
    labels?: Record<string, string>;

    /** Timestamp when metrics was collected */
    collectedAt: number;
}

/**
 * Cache events
 */
export interface CacheEvent extends BaseEvent {
    type: 'cache';

    /** Event subtype */
    subtype: 'hit' | 'miss' | 'set' | 'delete' | 'expire' | 'clear';

    /** Cache key */
    key: string;

    /** Cache value size in bytes */
    valueSize?: number;

    /** Cache TTL in milliseconds */
    ttl?: number;

    /** Cache hit/miss ratio */
    hitRatio?: number;
}

/**
 * Interceptor events
 */
export interface InterceptorEvent extends BaseEvent {
    type: 'interceptor';

    /** Interceptor name */
    interceptor: string;

    /** Event subtype */
    subtype: 'before' | 'after' | 'error';

    /** Request ID */
    requestId: string;

    /** Duration in milliseconds (for after events) */
    duration?: number;

    /** Error (for error events) */
    error?: CommunicationError;

    /** Modified request/response */
    modification?: {
        type: 'request' | 'response';
        changes: string[];
    };
}

/**
 * Union type of all events
 */
export type CommunicationEvent =
    | CircuitBreakerEvent
    | RetryEvent
    | ServiceDiscoveryEvent
    | LoadBalancingEvent
    | ProtocolEvent
    | ConnectionEvent
    | MetricsEvent
    | CacheEvent
    | InterceptorEvent;

/**
 * Event listener callback
 */
export type EventListener = (event: CommunicationEvent) => void | Promise<void>;

/**
 * Event emitter interface
 */
export interface EventEmitter {
    /** Subscribe to events */
    on(eventType: string | string[], listener: EventListener): void;

    /** Subscribe to events once */
    once(eventType: string | string[], listener: EventListener): void;

    /** Unsubscribe from events */
    off(eventType: string | string[], listener: EventListener): void;

    /** Emit an event */
    emit(event: CommunicationEvent): void;

    /** Remove all listeners */
    removeAllListeners(eventType?: string): void;
}