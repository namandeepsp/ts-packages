/**
 * Request types and interfaces for communication layer
 * @packageDocumentation
 */

import type { HTTPMethod } from './config.js';

/**
 * Base request interface for all protocols
 */
export interface BaseRequest {
    /** Unique request identifier */
    id?: string;

    /** Request timestamp */
    timestamp?: number;

    /** Request headers */
    headers?: Record<string, string>;

    /** Request metadata */
    metadata?: Record<string, unknown>;

    /** Request timeout in milliseconds */
    timeout?: number;

    /** Retry configuration for this specific request */
    retry?: RetryConfig;

    /** Circuit breaker configuration for this request */
    circuitBreaker?: CircuitBreakerRequestConfig;
}

/**
 * HTTP-specific request
 */
export interface HTTPRequest extends BaseRequest {
    /** HTTP method */
    method: HTTPMethod;

    /** Request URL */
    url: string;

    /** Request body */
    body?: unknown;

    /** Query parameters */
    query?: Record<string, string | number | boolean>;

    /** Path parameters */
    params?: Record<string, string>;

    /** Response type */
    responseType?: 'json' | 'text' | 'arraybuffer' | 'stream';
}

/**
 * gRPC-specific request
 */
export interface GrpcRequest extends BaseRequest {
    /** gRPC service name */
    service: string;

    /** gRPC method name */
    method: string;

    /** Request payload */
    payload: unknown;

    /** gRPC metadata */
    metadata?: Record<string, string>;
}

/**
 * WebSocket-specific request
 */
export interface WebSocketRequest extends BaseRequest {
    /** WebSocket event type */
    event: string;

    /** Event data */
    data: unknown;

    /** Acknowledgement required */
    ack?: boolean;

    /** Acknowledgement timeout */
    ackTimeout?: number;
}

/**
 * Retry configuration for a request
 */
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts?: number;

    /** Initial retry delay in milliseconds */
    initialDelay?: number;

    /** Maximum retry delay in milliseconds */
    maxDelay?: number;

    /** Backoff multiplier */
    multiplier?: number;

    /** Jitter factor (0-1) */
    jitter?: number;

    /** Retry on specific status codes */
    retryOnStatus?: number[];

    /** Retry on specific error types */
    retryOnErrors?: string[];
}

/**
 * Circuit breaker configuration for a specific request
 */
export interface CircuitBreakerRequestConfig {
    /** Enable circuit breaker for this request */
    enabled?: boolean;

    /** Failure threshold before opening */
    failureThreshold?: number;

    /** Reset timeout in milliseconds */
    resetTimeout?: number;

    /** Half-open max attempts */
    halfOpenMaxAttempts?: number;

    /** Exclude this request from circuit breaker */
    exclude?: boolean;
}

/**
 * Union type of all request types
 */
export type Request = HTTPRequest | GrpcRequest | WebSocketRequest;

/**
 * Request options for client calls
 */
export interface RequestOptions {
    /** Request headers */
    headers?: Record<string, string>;

    /** Request timeout in milliseconds */
    timeout?: number;

    /** Enable/disable retry */
    retry?: boolean | RetryConfig;

    /** Enable/disable circuit breaker */
    circuitBreaker?: boolean | CircuitBreakerRequestConfig;

    /** Request metadata */
    metadata?: Record<string, unknown>;

    /** Custom request ID */
    requestId?: string;
}

/**
 * Request context passed through interceptors
 */
export interface RequestContext {
    /** Request ID */
    requestId: string;

    /** Service name */
    serviceName: string;

    /** Endpoint/URL */
    endpoint: string;

    /** Request start timestamp */
    startTime: number;

    /** Request attempt number */
    attempt: number;

    /** Is this a retry attempt? */
    isRetry: boolean;

    /** Previous error (if retrying) */
    previousError?: Error;

    /** Custom context data */
    data?: Map<string, unknown>;
}