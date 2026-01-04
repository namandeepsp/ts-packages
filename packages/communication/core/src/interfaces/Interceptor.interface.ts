/**
 * Interceptor interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { InterceptorEvent } from '../types/events.js';
import type {
    Request,
    RequestContext
} from '../types/request.js';
import type { Response } from '../types/response.js';

/**
 * Interceptor execution order
 */
export interface InterceptorOrder {
    /** Phase order within request phase */
    request?: number;

    /** Phase order within response phase */
    response?: number;

    /** Phase order within error phase */
    error?: number;
}

/**
 * Interceptor interface for intercepting and modifying requests/responses
 */
export interface IInterceptor<TRequest = Request, TResponse = Response> {
    /** Interceptor name */
    readonly name: string;

    /** Interceptor version */
    readonly version?: string;

    /** Interceptor description */
    readonly description?: string;

    /** Whether interceptor is enabled */
    enabled: boolean;

    /** Interceptor execution order */
    readonly order: InterceptorOrder;

    /**
     * Intercept request before it's sent
     * @param request Original request
     * @param context Request context
     * @returns Modified request or void
     */
    onRequest?(
        request: TRequest,
        context: RequestContext
    ): TRequest | void | Promise<TRequest | void>;

    /**
     * Intercept response after it's received
     * @param response Original response
     * @param context Request context
     * @returns Modified response or void
     */
    onResponse?(
        response: TResponse,
        context: RequestContext
    ): TResponse | void | Promise<TResponse | void>;

    /**
     * Intercept error when request fails
     * @param error Error that occurred
     * @param context Request context
     * @returns Modified error, new response, or void
     */
    onError?(
        error: CommunicationError,
        context: RequestContext
    ): CommunicationError | TResponse | void | Promise<CommunicationError | TResponse | void>;

    /**
     * Initialize interceptor (called when added to client/protocol)
     * @param options Initialization options
     */
    initialize?(options?: Record<string, unknown>): void | Promise<void>;

    /**
     * Cleanup interceptor (called when removed from client/protocol)
     */
    cleanup?(): void | Promise<void>;

    /**
     * Get interceptor configuration
     */
    getConfig(): Record<string, unknown>;

    /**
     * Update interceptor configuration
     * @param config New configuration
     */
    updateConfig(config: Record<string, unknown>): void;

    /**
     * Health check for the interceptor
     */
    healthCheck?(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };

    /**
     * Get interceptor statistics
     */
    getStats?(): {
        totalRequests: number;
        totalResponses: number;
        totalErrors: number;
        modifications: number;
        averageProcessingTime: number;
        lastError?: string;
    };

    /**
     * Reset interceptor statistics
     */
    resetStats?(): void;

    /**
     * Event emitter for interceptor events
     */
    readonly events?: {
        /**
         * Subscribe to interceptor events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        on(event: string | string[], listener: (event: InterceptorEvent) => void): void;

        /**
         * Unsubscribe from interceptor events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        off(event: string | string[], listener: (event: InterceptorEvent) => void): void;
    };
}

/**
 * Interceptor chain interface for managing multiple interceptors
 */
export interface IInterceptorChain<TRequest = Request, TResponse = Response> {
    /** Chain name */
    readonly name: string;

    /** All interceptors in the chain */
    readonly interceptors: IInterceptor<TRequest, TResponse>[];

    /**
     * Add an interceptor to the chain
     * @param interceptor Interceptor to add
     */
    add(interceptor: IInterceptor<TRequest, TResponse>): void;

    /**
     * Remove an interceptor from the chain
     * @param interceptorName Interceptor name to remove
     */
    remove(interceptorName: string): boolean;

    /**
     * Get an interceptor by name
     * @param interceptorName Interceptor name
     */
    get(interceptorName: string): IInterceptor<TRequest, TResponse> | undefined;

    /**
     * Clear all interceptors from the chain
     */
    clear(): void;

    /**
     * Execute request interceptors
     * @param request Original request
     * @param context Request context
     * @returns Modified request
     */
    executeRequest(
        request: TRequest,
        context: RequestContext
    ): Promise<TRequest>;

    /**
     * Execute response interceptors
     * @param response Original response
     * @param context Request context
     * @returns Modified response
     */
    executeResponse(
        response: TResponse,
        context: RequestContext
    ): Promise<TResponse>;

    /**
     * Execute error interceptors
     * @param error Original error
     * @param context Request context
     * @returns Modified error or response
     */
    executeError(
        error: CommunicationError,
        context: RequestContext
    ): Promise<CommunicationError | TResponse>;

    /**
     * Sort interceptors by execution order
     */
    sortInterceptors(): void;

    /**
     * Health check for the interceptor chain
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: {
            totalInterceptors: number;
            enabledInterceptors: number;
            interceptorHealth: Array<{
                name: string;
                healthy: boolean;
                message?: string;
            }>;
        };
    };
}

/**
 * Interceptor factory interface
 */
export interface IInterceptorFactory {
    /**
     * Create a new interceptor instance
     * @param name Interceptor name
     * @param options Interceptor options
     * @returns New interceptor instance
     */
    create(
        name: string,
        options?: Record<string, unknown>
    ): IInterceptor;

    /**
     * Get an existing interceptor instance
     * @param name Interceptor name
     */
    get(name: string): IInterceptor | undefined;

    /**
     * Get all interceptor instances
     */
    getAll(): IInterceptor[];

    /**
     * Register a custom interceptor
     * @param name Interceptor name
     * @param interceptor Interceptor instance or constructor
     */
    register(
        name: string,
        interceptor: IInterceptor | (new (options: Record<string, unknown>) => IInterceptor)
    ): void;

    /**
     * Get available interceptor names
     */
    getAvailableInterceptors(): string[];

    /**
     * Create an interceptor chain
     * @param name Chain name
     * @param interceptors Initial interceptors
     * @returns New interceptor chain
     */
    createChain(
        name: string,
        interceptors?: IInterceptor[]
    ): IInterceptorChain;
}
