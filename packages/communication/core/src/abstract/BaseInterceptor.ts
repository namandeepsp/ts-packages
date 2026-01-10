/**
 * Abstract base interceptor implementation
 * @packageDocumentation
 */

import type { CommunicationErrorType } from '../errors/CommunicationError.js';
import type {
    Request,
    RequestContext
} from '../types/request.js';
import type {
    IInterceptor,
    InterceptorOrder
} from '../interfaces/Interceptor.interface.js';
import type { Response } from '../types/response.js';

/**
 * Abstract base interceptor implementation
 * Provides common functionality for all interceptor implementations
 */
export abstract class BaseInterceptor<TRequest = Request, TResponse = Response>
    implements IInterceptor<TRequest, TResponse> {

    /** Interceptor name */
    public readonly name: string;

    /** Interceptor version */
    public readonly version?: string;

    /** Interceptor description */
    public readonly description?: string;

    /** Whether interceptor is enabled */
    public enabled: boolean = true;

    /** Interceptor execution order */
    public readonly order: InterceptorOrder;

    /** Interceptor statistics */
    protected stats: {
        totalRequests: number;
        totalResponses: number;
        totalErrors: number;
        modifications: number;
        totalProcessingTime: number;
        averageProcessingTime: number;
        lastError?: string;
    } = {
            totalRequests: 0,
            totalResponses: 0,
            totalErrors: 0,
            modifications: 0,
            totalProcessingTime: 0,
            averageProcessingTime: 0,
        };

    /** Configuration */
    protected config: Record<string, unknown> = {};

    /** Last processing time */
    protected lastProcessingTime?: number;

    /**
     * Create a new base interceptor instance
     * @param name Interceptor name
     * @param options Interceptor options
     */
    constructor(name: string, options?: Record<string, unknown>) {
        this.name = name;
        this.version = options?.version as string || '1.0.0';
        this.description = options?.description as string;
        this.enabled = options?.enabled as boolean ?? true;

        // Set default order if not provided
        this.order = (options?.order as InterceptorOrder) || {
            request: 0,
            response: 0,
            error: 0
        };

        this.config = { ...options };

        // Call setup instead of initialize to avoid confusion with interface method
        this.setup(options);
    }

    /**
     * Setup interceptor (internal initialization)
     * @param options Initialization options
     */
    protected setup(options?: Record<string, unknown>): void {
        // Can be overridden by subclasses
    }

    /**
     * Intercept request before it's sent
     * @param request Original request
     * @param context Request context
     * @returns Modified request or void
     */
    public abstract onRequest?(
        request: TRequest,
        context: RequestContext
    ): TRequest | void | Promise<TRequest | void>;

    /**
     * Intercept response after it's received
     * @param response Original response
     * @param context Request context
     * @returns Modified response or void
     */
    public abstract onResponse?(
        response: TResponse,
        context: RequestContext
    ): TResponse | void | Promise<TResponse | void>;

    /**
     * Intercept error when request fails
     * @param error Error that occurred
     * @param context Request context
     * @returns Modified error, new response, or void
     */
    public abstract onError?(
        error: CommunicationErrorType,
        context: RequestContext
    ): CommunicationErrorType | TResponse | void | Promise<CommunicationErrorType | TResponse | void>;

    /**
     * Initialize interceptor (called when added to client/protocol)
     * @param options Initialization options
     */
    public initialize(options?: Record<string, unknown>): void | Promise<void> {
        // Can be overridden by subclasses
        this.config = { ...this.config, ...options };
    }

    /**
     * Cleanup interceptor (called when removed from client/protocol)
     */
    public cleanup(): void | Promise<void> {
        // Can be overridden by subclasses
    }

    /**
     * Get interceptor configuration
     */
    public getConfig(): Record<string, unknown> {
        return { ...this.config };
    }

    /**
     * Update interceptor configuration
     * @param config New configuration
     */
    public updateConfig(config: Record<string, unknown>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Health check for the interceptor
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = this.enabled && !this.stats.lastError;

        return {
            healthy,
            message: healthy ? 'Interceptor is operational' : 'Interceptor has errors',
            details: {
                name: this.name,
                enabled: this.enabled,
                lastError: this.stats.lastError,
                statistics: this.getStats(),
            },
        };
    }

    /**
     * Get interceptor statistics
     */
    public getStats(): {
        totalRequests: number;
        totalResponses: number;
        totalErrors: number;
        modifications: number;
        averageProcessingTime: number;
        lastError?: string;
    } {
        return { ...this.stats };
    }

    /**
     * Reset interceptor statistics
     */
    public resetStats(): void {
        this.stats = {
            totalRequests: 0,
            totalResponses: 0,
            totalErrors: 0,
            modifications: 0,
            totalProcessingTime: 0,
            averageProcessingTime: 0,
        };
        this.lastProcessingTime = undefined;
    }

    /**
     * Execute request interception with timing and error handling
     * @param request Original request
     * @param context Request context
     * @returns Modified request or original if not modified
     */
    protected async executeOnRequest(
        request: TRequest,
        context: RequestContext
    ): Promise<TRequest> {
        if (!this.enabled || !this.onRequest) {
            return request;
        }

        const startTime = Date.now();
        try {
            const result = await this.onRequest(request, context);
            const processingTime = Date.now() - startTime;

            this.updateRequestStats(processingTime, result !== undefined);
            this.lastProcessingTime = processingTime;

            return result !== undefined ? result as TRequest : request;
        } catch (error) {
            this.stats.lastError = error instanceof Error ? error.message : String(error);
            this.stats.totalErrors++;
            throw error;
        }
    }

    /**
     * Execute response interception with timing and error handling
     * @param response Original response
     * @param context Request context
     * @returns Modified response or original if not modified
     */
    protected async executeOnResponse(
        response: TResponse,
        context: RequestContext
    ): Promise<TResponse> {
        if (!this.enabled || !this.onResponse) {
            return response;
        }

        const startTime = Date.now();
        try {
            const result = await this.onResponse(response, context);
            const processingTime = Date.now() - startTime;

            this.updateResponseStats(processingTime, result !== undefined);
            this.lastProcessingTime = processingTime;

            return result !== undefined ? result as TResponse : response;
        } catch (error) {
            this.stats.lastError = error instanceof Error ? error.message : String(error);
            this.stats.totalErrors++;
            throw error;
        }
    }

    /**
     * Execute error interception with timing and error handling
     * @param error Original error
     * @param context Request context
     * @returns Modified error or response, or original error if not modified
     */
    protected async executeOnError(
        error: CommunicationErrorType,
        context: RequestContext
    ): Promise<CommunicationErrorType | TResponse> {
        if (!this.enabled || !this.onError) {
            return error;
        }

        const startTime = Date.now();
        try {
            const result = await this.onError(error, context);
            const processingTime = Date.now() - startTime;

            this.updateErrorStats(processingTime, result !== undefined);
            this.lastProcessingTime = processingTime;

            if (result === undefined) {
                return error;
            }
            return result;
        } catch (interceptorError) {
            this.stats.lastError = interceptorError instanceof Error ? interceptorError.message : String(interceptorError);
            this.stats.totalErrors++;
            // If interceptor itself fails, return the original error
            return error;
        }
    }

    /**
     * Update request statistics
     * @param processingTime Processing time in milliseconds
     * @param modified Whether request was modified
     */
    protected updateRequestStats(processingTime: number, modified: boolean): void {
        this.stats.totalRequests++;
        this.stats.totalProcessingTime += processingTime;
        this.stats.averageProcessingTime = this.stats.totalProcessingTime /
            (this.stats.totalRequests + this.stats.totalResponses + this.stats.totalErrors);

        if (modified) {
            this.stats.modifications++;
        }
    }

    /**
     * Update response statistics
     * @param processingTime Processing time in milliseconds
     * @param modified Whether response was modified
     */
    protected updateResponseStats(processingTime: number, modified: boolean): void {
        this.stats.totalResponses++;
        this.stats.totalProcessingTime += processingTime;
        this.stats.averageProcessingTime = this.stats.totalProcessingTime /
            (this.stats.totalRequests + this.stats.totalResponses + this.stats.totalErrors);

        if (modified) {
            this.stats.modifications++;
        }
    }

    /**
     * Update error statistics
     * @param processingTime Processing time in milliseconds
     * @param modified Whether error was modified
     */
    protected updateErrorStats(processingTime: number, modified: boolean): void {
        this.stats.totalErrors++;
        this.stats.totalProcessingTime += processingTime;
        this.stats.averageProcessingTime = this.stats.totalProcessingTime /
            (this.stats.totalRequests + this.stats.totalResponses + this.stats.totalErrors);

        if (modified) {
            this.stats.modifications++;
        }
    }
}