/**
 * Abstract base protocol implementation
 * @packageDocumentation
 */

import { CommunicationError, type CommunicationErrorType } from '../errors/CommunicationError.js';
import type { Request } from '../types/request.js';
import type { BaseProtocolConfig } from '../types/config.js';
import type { IProtocol } from '../interfaces/Protocol.interface.js';
import type { IInterceptor } from '../interfaces/Interceptor.interface.js';
import type { Response } from '../types/response.js';

/**
 * Abstract base protocol implementation
 * Provides common functionality for all protocol implementations
 */
export abstract class BaseProtocol<TRequest = Request, TResponse = Response>
    implements IProtocol<TRequest, TResponse> {

    /** Protocol name identifier */
    public readonly name: string;

    /** Protocol version */
    public readonly version?: string;

    /** Protocol configuration */
    public config: BaseProtocolConfig;

    /** Protocol interceptors */
    protected interceptors: IInterceptor<TRequest, TResponse>[] = [];

    /** Protocol metrics */
    protected metrics: Record<string, unknown> = {};

    /** Whether protocol is connected (for stateful protocols) */
    protected connected: boolean = false;

    /** Protocol start time */
    protected readonly startTime: number = Date.now();

    /** Total requests sent */
    protected totalRequests: number = 0;

    /** Total successful requests */
    protected successfulRequests: number = 0;

    /** Total failed requests */
    protected failedRequests: number = 0;

    /**
     * Create a new base protocol instance
     * @param name Protocol name
     * @param config Protocol configuration
     */
    constructor(name: string, config: BaseProtocolConfig) {
        this.name = name;
        this.config = { ...config };
        this.version = config.options?.version as string || '1.0.0';
    }

    /**
     * Send a request using this protocol
     * @param request The request to send
     * @returns Promise resolving to the response
     * @throws {CommunicationError} If the request fails
     */
    public abstract send(request: TRequest): Promise<TResponse>;

    /**
     * Configure the protocol with new settings
     * @param config Configuration object
     */
    public configure(config: Partial<BaseProtocolConfig>): void {
        this.config = { ...this.config, ...config };
        this.onConfigure(config);
    }

    /**
     * Hook for protocol configuration changes
     * @param newConfig New configuration
     */
    protected onConfigure(newConfig: Partial<BaseProtocolConfig>): void {
        // Can be overridden by subclasses
    }

    /**
     * Connect to the service (for stateful protocols)
     * @returns Promise that resolves when connected
     */
    public async connect(): Promise<void> {
        this.connected = true;
        await this.onConnect?.();
    }

    /**
     * Hook for connection logic
     */
    protected async onConnect?(): Promise<void> {
        // Can be overridden by subclasses
    }

    /**
     * Disconnect from the service (for stateful protocols)
     * @returns Promise that resolves when disconnected
     */
    public async disconnect(): Promise<void> {
        this.connected = false;
        await this.onDisconnect?.();
    }

    /**
     * Hook for disconnection logic
     */
    protected async onDisconnect?(): Promise<void> {
        // Can be overridden by subclasses
    }

    /**
     * Check if the protocol is currently connected
     * @returns True if connected, false otherwise
     */
    public isConnected(): boolean {
        return this.connected;
    }

    /**
     * Add an interceptor to the protocol
     * @param interceptor Interceptor to add
     */
    public addInterceptor(interceptor: IInterceptor<TRequest, TResponse>): void {
        this.interceptors.push(interceptor);
        interceptor.initialize?.({ protocol: this.name });
        this.onInterceptorAdded(interceptor);
    }

    /**
     * Hook for interceptor addition
     * @param interceptor Added interceptor
     */
    protected onInterceptorAdded(interceptor: IInterceptor<TRequest, TResponse>): void {
        // Can be overridden by subclasses
    }

    /**
     * Remove an interceptor from the protocol
     * @param interceptorId Interceptor identifier
     */
    public removeInterceptor(interceptorId: string): void {
        const index = this.interceptors.findIndex(i => i.name === interceptorId);
        if (index !== -1) {
            const interceptor = this.interceptors[index];
            interceptor.cleanup?.();
            this.interceptors.splice(index, 1);
            this.onInterceptorRemoved(interceptorId);
        }
    }

    /**
     * Hook for interceptor removal
     * @param interceptorId Removed interceptor ID
     */
    protected onInterceptorRemoved(interceptorId: string): void {
        // Can be overridden by subclasses
    }

    /**
     * Get all interceptors
     */
    public getInterceptors(): IInterceptor<TRequest, TResponse>[] {
        return [...this.interceptors];
    }

    /**
     * Execute request interceptors
     * @param request Original request
     * @param context Request context
     * @returns Modified request
     */
    protected async executeRequestInterceptors(
        request: TRequest,
        context: any
    ): Promise<TRequest> {
        let modifiedRequest = request;

        for (const interceptor of this.interceptors) {
            if (interceptor.enabled && interceptor.onRequest) {
                const result = await interceptor.onRequest(modifiedRequest, context);
                if (result !== undefined) {
                    modifiedRequest = result as TRequest;
                }
            }
        }

        return modifiedRequest;
    }

    /**
     * Execute response interceptors
     * @param response Original response
     * @param context Request context
     * @returns Modified response
     */
    protected async executeResponseInterceptors(
        response: TResponse,
        context: any
    ): Promise<TResponse> {
        let modifiedResponse = response;

        for (const interceptor of this.interceptors) {
            if (interceptor.enabled && interceptor.onResponse) {
                const result = await interceptor.onResponse(modifiedResponse, context);
                if (result !== undefined) {
                    modifiedResponse = result as TResponse;
                }
            }
        }

        return modifiedResponse;
    }

    /**
     * Execute error interceptors
     * @param error Original error
     * @param context Request context
     * @returns Modified error or response
     */
    protected async executeErrorInterceptors(
        error: CommunicationErrorType,
        context: any
    ): Promise<CommunicationErrorType | TResponse> {
        let result: CommunicationErrorType | TResponse = error;

        for (const interceptor of this.interceptors) {
            if (interceptor.enabled && interceptor.onError) {
                const interceptorResult = await interceptor.onError(
                    result instanceof CommunicationError ? result : error,
                    context
                );
                if (interceptorResult !== undefined) {
                    result = interceptorResult as CommunicationError | TResponse;
                }
            }
        }

        return result;
    }

    /**
     * Update request metrics
     * @param success Whether request was successful
     * @param duration Request duration in milliseconds
     */
    protected updateMetrics(success: boolean, duration: number): void {
        this.totalRequests++;

        if (success) {
            this.successfulRequests++;
        } else {
            this.failedRequests++;
        }

        this.metrics = {
            ...this.metrics,
            totalRequests: this.totalRequests,
            successfulRequests: this.successfulRequests,
            failedRequests: this.failedRequests,
            successRate: this.totalRequests > 0 ? this.successfulRequests / this.totalRequests : 0,
            averageResponseTime: this.calculateAverageResponseTime(duration),
            uptime: Date.now() - this.startTime,
        };
    }

    /**
     * Calculate average response time
     * @param newDuration New request duration
     * @returns Average response time
     */
    private calculateAverageResponseTime(newDuration: number): number {
        const currentAverage = (this.metrics.averageResponseTime as number) || 0;
        const totalDuration = currentAverage * (this.totalRequests - 1) + newDuration;
        return totalDuration / this.totalRequests;
    }

    /**
     * Get protocol metrics
     */
    public getMetrics(): Record<string, unknown> {
        return { ...this.metrics };
    }

    /**
     * Reset protocol metrics
     */
    public resetMetrics(): void {
        this.totalRequests = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        this.metrics = {
            uptime: Date.now() - this.startTime,
        };
    }

    /**
     * Health check for the protocol
     * @returns Promise resolving to health status
     */
    public async healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }> {
        const healthy = this.connected !== false;
        return {
            healthy,
            message: healthy ? 'Protocol is healthy' : 'Protocol is not connected',
            details: {
                name: this.name,
                version: this.version,
                connected: this.connected,
                totalRequests: this.totalRequests,
                successRate: this.metrics.successRate,
                uptime: this.metrics.uptime,
            },
        };
    }

    /**
     * Create request context
     * @param request Request object
     * @param attempt Attempt number
     * @returns Request context
     */
    protected createRequestContext(
        request: TRequest,
        attempt: number = 1
    ): any {
        return {
            protocol: this.name,
            requestId: (request as any).id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            attempt,
            startTime: Date.now(),
            isRetry: attempt > 1,
        };
    }
}