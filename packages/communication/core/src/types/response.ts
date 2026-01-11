/**
 * Response types and interfaces for communication layer
 * @packageDocumentation
 */

import type { HttpStatusCode } from '@naman_deep_singh/http-response';

/**
 * Base response interface for all protocols
 */
export interface BaseResponse<T = unknown> {
    /** Response data */
    data: T;

    /** Response status code */
    status: number;

    /** Response status text */
    statusText?: string;

    /** Response headers */
    headers?: Record<string, string>;

    /** Response metadata */
    metadata?: Record<string, unknown>;

    /** Request duration in milliseconds */
    duration?: number;

    /** Request ID */
    requestId?: string;

    /** Is the response cached? */
    cached?: boolean;

    /** Cache age in milliseconds */
    cacheAge?: number;
}

/**
 * HTTP-specific response
 */
export interface HTTPResponse<T = unknown> extends BaseResponse<T> {
    /** HTTP status code */
    status: HttpStatusCode;

    /** Response URL */
    url: string;

    /** Redirected URL if any */
    redirected?: boolean;

    /** Response size in bytes */
    size?: number;

    /** Response type */
    type?: 'basic' | 'cors' | 'default' | 'error' | 'opaque';
}

/**
 * gRPC-specific response
 */
export interface GRPCResponse<T = unknown> extends BaseResponse<T> {
    /** gRPC status code */
    grpcCode: number;

    /** gRPC status message */
    grpcMessage?: string;

    /** gRPC trailers */
    trailers?: Record<string, string>;
}

/**
 * WebSocket-specific response
 */
export interface WebSocketResponse<T = unknown> extends BaseResponse<T> {
    /** WebSocket event type */
    event: string;

    /** Is this an acknowledgement? */
    ack?: boolean;

    /** Sequence number */
    sequence?: number;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
    /** Error message */
    message: string;

    /** Error code */
    code: string;

    /** HTTP status code */
    status?: number;

    /** Additional error details */
    details?: Record<string, unknown>;

    /** Request ID */
    requestId?: string;

    /** Service name */
    service?: string;

    /** Endpoint */
    endpoint?: string;

    /** Stack trace (development only) */
    stack?: string;

    /** Retry information */
    retry?: {
        /** Current retry attempt */
        attempt: number;

        /** Maximum retry attempts */
        maxAttempts: number;

        /** Next retry delay in milliseconds */
        nextDelay?: number;
    };

    /** Circuit breaker state if applicable */
    circuitBreaker?: {
        /** Circuit breaker state */
        state: 'closed' | 'open' | 'half-open';

        /** Failures count */
        failures: number;

        /** Next reset time */
        nextReset?: number;
    };
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
    /** Response data */
    data: T[];

    /** Pagination metadata */
    pagination: {
        /** Current page number */
        page: number;

        /** Items per page */
        limit: number;

        /** Total number of items */
        total: number;

        /** Total number of pages */
        totalPages: number;

        /** Has next page? */
        hasNext: boolean;

        /** Has previous page? */
        hasPrev: boolean;

        /** Next page URL */
        next?: string;

        /** Previous page URL */
        prev?: string;
    };

    /** Response status */
    status: number;

    /** Response headers */
    headers?: Record<string, string>;
}

/**
 * Streaming response interface
 */
export interface StreamResponse<T = unknown> {
    /** Stream data */
    data: AsyncIterable<T>;

    /** Response headers */
    headers?: Record<string, string>;

    /** Response status */
    status: number;

    /** Request ID */
    requestId?: string;

    /** Close the stream */
    close(): Promise<void>;

    /** Cancel the stream */
    cancel(): Promise<void>;
}

/**
 * Union type of all response types
 */
export type Response<T = unknown> =
    | HTTPResponse<T>
    | GRPCResponse<T>
    | WebSocketResponse<T>;