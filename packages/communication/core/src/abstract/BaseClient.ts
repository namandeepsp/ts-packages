/**
 * Abstract base client implementation
 * @packageDocumentation
 */

import { CommunicationError } from '../errors/CommunicationError.js';
import { COMMUNICATION_ERROR_CODES } from '../errors/communicationErrorCodes.js';
import type { ICircuitBreaker } from '../interfaces/CircuitBreaker.interface.js';
import type { IClient } from '../interfaces/Client.interface.js';
import type { IInterceptor } from '../interfaces/Interceptor.interface.js';
import type { ILoadBalanceStrategy } from '../interfaces/LoadBalancer.interface.js';
import type { IProtocol } from '../interfaces/Protocol.interface.js';
import type { IRetryStrategy } from '../interfaces/RetryStrategy.interface.js';
import type { IServiceDiscoverer } from '../interfaces/ServiceDiscovery.interface.js';
import type { ClientConfig } from '../types/config.js';
import type {
    Request,
    RequestOptions
} from '../types/request.js';
import type { Response } from '../types/response.js';
import type { ServiceInstance } from '../types/service.js';

/**
 * Abstract base client implementation
 * Provides common functionality for all client implementations
 */
export abstract class BaseClient<TRequest = Request, TResponse = Response>
    implements IClient {

    /** Client configuration */
    public readonly config: ClientConfig;

    /** Client name/identifier */
    public readonly name: string;

    /** Service name this client communicates with */
    public readonly serviceName: string;

    /** Protocol being used */
    public readonly protocol: IProtocol;

    /** Service discovery instance */
    protected serviceDiscoverer?: IServiceDiscoverer;

    /** Load balancer instance */
    protected loadBalancer?: ILoadBalanceStrategy;

    /** Circuit breaker instance */
    protected circuitBreaker?: ICircuitBreaker;

    /** Retry strategy instance */
    protected retryStrategy?: IRetryStrategy;

    /** Client interceptors */
    protected interceptors: IInterceptor[] = [];

    /** Cached service instances */
    protected cachedInstances: ServiceInstance[] = [];

    /** Last cache refresh time */
    protected lastCacheRefresh?: number;

    /** Client metrics */
    protected metrics: Record<string, unknown> = {};

    /** Client start time */
    protected readonly startTime: number = Date.now();

    /** Total calls made */
    protected totalCalls: number = 0;

    /** Successful calls */
    protected successfulCalls: number = 0;

    /** Failed calls */
    protected failedCalls: number = 0;

    /**
     * Create a new base client instance
     * @param serviceName Service name to communicate with
     * @param config Client configuration
     * @param protocol Protocol instance
     */
    constructor(
        serviceName: string,
        config: ClientConfig,
        protocol: IProtocol
    ) {
        this.serviceName = serviceName;
        this.config = { ...config };
        this.protocol = protocol;
        this.name = config.custom?.name as string || `client_${serviceName}_${Date.now()}`;

        // Initialize components
        this.initializeComponents();
    }

    /**
     * Initialize client components
     */
    protected initializeComponents(): void {
        // Can be overridden by subclasses to initialize
        // serviceDiscoverer, loadBalancer, circuitBreaker, retryStrategy
    }

    /**
     * Make a request to a service endpoint
     * @param endpoint Service endpoint/path
     * @param data Request data
     * @param options Request options
     * @returns Promise resolving to the response
     * @throws {CommunicationError} If the request fails
     */
    public abstract call<T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<Response<T>>;

    /**
     * Make a request with full control over request object
     * @param request Complete request object
     * @returns Promise resolving to the response
     */
    public abstract request<T = unknown>(
        request: Request
    ): Promise<Response<T>>;

    /**
     * Build request from endpoint and data
     * @param endpoint Service endpoint
     * @param data Request data
     * @param options Request options
     * @returns Built request object
     */
    protected abstract buildRequest(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): TRequest;

    /**
     * Parse response to standard format
     * @param response Protocol response
     * @returns Standardized response
     */
    protected abstract parseResponse<T>(
        response: TResponse
    ): Response<T>;

    /**
     * Get service discovery instance
     */
    public getServiceDiscoverer(): IServiceDiscoverer | undefined {
        return this.serviceDiscoverer;
    }

    /**
     * Get load balancer instance
     */
    public getLoadBalancer(): ILoadBalanceStrategy | undefined {
        return this.loadBalancer;
    }

    /**
     * Get circuit breaker instance
     */
    public getCircuitBreaker(): ICircuitBreaker | undefined {
        return this.circuitBreaker;
    }

    /**
     * Get retry strategy instance
     */
    public getRetryStrategy(): IRetryStrategy | undefined {
        return this.retryStrategy;
    }

    /**
     * Add an interceptor to the client
     * @param interceptor IInterceptor to add
     */
    public addInterceptor(interceptor: IInterceptor): void {
        this.interceptors.push(interceptor);
        interceptor.initialize?.({ client: this.name, service: this.serviceName });
        this.onInterceptorAdded(interceptor);
    }

    /**
     * Hook for interceptor addition
     * @param interceptor Added interceptor
     */
    protected onInterceptorAdded(interceptor: IInterceptor): void {
        // Can be overridden by subclasses
    }

    /**
     * Remove an interceptor from the client
     * @param interceptorId IInterceptor identifier
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
    public getInterceptors(): IInterceptor[] {
        return [...this.interceptors];
    }

    /**
     * Clear all interceptors
     */
    public clearInterceptors(): void {
        for (const interceptor of this.interceptors) {
            interceptor.cleanup?.();
        }
        this.interceptors = [];
        this.onInterceptorsCleared();
    }

    /**
     * Hook for interceptors cleared
     */
    protected onInterceptorsCleared(): void {
        // Can be overridden by subclasses
    }

    /**
     * Discover service instances
     * @returns Promise resolving to service instances
     */
    public async discoverService(): Promise<ServiceInstance[]> {
        if (!this.serviceDiscoverer) {
            throw new CommunicationError(COMMUNICATION_ERROR_CODES.DISCOVERY_ERROR, 503, {
                message: 'Service discovery not configured',
                service: this.serviceName,
            });
        }

        const result = await this.serviceDiscoverer.resolve(this.serviceName);
        this.cachedInstances = result.instances;
        this.lastCacheRefresh = Date.now();

        return this.cachedInstances;
    }

    /**
     * Get current service instances (cached)
     */
    public getServiceInstances(): ServiceInstance[] {
        return [...this.cachedInstances];
    }

    /**
     * Refresh service instances cache
     */
    public async refreshServiceInstances(): Promise<void> {
        await this.discoverService();
    }

    /**
     * Select a service instance using load balancer
     * @param instances Available instances
     * @returns Selected instance
     */
    protected selectInstance(instances: ServiceInstance[]): ServiceInstance {
        if (instances.length === 0) {
            throw new CommunicationError(COMMUNICATION_ERROR_CODES.NO_AVAILABLE_INSTANCES, 503, {
                service: this.serviceName,
            });
        }

        if (instances.length === 1) {
            return instances[0];
        }

        if (this.loadBalancer) {
            return this.loadBalancer.select(instances, {
                service: this.serviceName,
                client: this.name,
            });
        }

        // Default: round-robin selection
        const index = this.totalCalls % instances.length;
        return instances[index];
    }

    /**
     * Update client metrics
     * @param success Whether call was successful
     * @param duration Call duration in milliseconds
     */
    protected updateMetrics(success: boolean, duration: number): void {
        this.totalCalls++;

        if (success) {
            this.successfulCalls++;
        } else {
            this.failedCalls++;
        }

        this.metrics = {
            ...this.metrics,
            totalCalls: this.totalCalls,
            successfulCalls: this.successfulCalls,
            failedCalls: this.failedCalls,
            successRate: this.totalCalls > 0 ? this.successfulCalls / this.totalCalls : 0,
            averageResponseTime: this.calculateAverageResponseTime(duration),
            uptime: Date.now() - this.startTime,
            cachedInstances: this.cachedInstances.length,
            lastCacheRefresh: this.lastCacheRefresh,
        };
    }

    /**
     * Calculate average response time
     * @param newDuration New call duration
     * @returns Average response time
     */
    private calculateAverageResponseTime(newDuration: number): number {
        const currentAverage = (this.metrics.averageResponseTime as number) || 0;
        const totalDuration = currentAverage * (this.totalCalls - 1) + newDuration;
        return totalDuration / this.totalCalls;
    }

    /**
     * Health check for the client
     * @returns Promise resolving to health status
     */
    public async healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }> {
        const checks = [];

        // Check protocol health
        const protocolHealth = await this.protocol.healthCheck?.() || { healthy: false };
        checks.push({
            component: 'protocol',
            healthy: protocolHealth.healthy,
            message: protocolHealth.message,
        });

        // Check service discovery health if configured
        if (this.serviceDiscoverer) {
            const discoveryHealth = await this.serviceDiscoverer.healthCheckSelf();
            checks.push({
                component: 'service-discovery',
                healthy: discoveryHealth.healthy,
                message: discoveryHealth.message,
            });
        }

        // Check if we have service instances
        const hasInstances = this.cachedInstances.length > 0;
        checks.push({
            component: 'service-instances',
            healthy: hasInstances,
            message: hasInstances ? `Has ${this.cachedInstances.length} instances` : 'No instances available',
        });

        const allHealthy = checks.every(check => check.healthy);

        return {
            healthy: allHealthy,
            message: allHealthy ? 'Client is healthy' : 'Client has issues',
            details: {
                name: this.name,
                service: this.serviceName,
                checks,
                metrics: this.metrics,
            },
        };
    }

    /**
     * Get client metrics
     */
    public getMetrics(): Record<string, unknown> {
        return { ...this.metrics };
    }

    /**
     * Reset client metrics
     */
    public resetMetrics(): void {
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
        this.metrics = {
            uptime: Date.now() - this.startTime,
        };
    }

    /**
     * Close/cleanup client resources
     */
    public async close(): Promise<void> {
        // Clear interceptors
        this.clearInterceptors();

        // Close protocol
        await this.protocol.disconnect?.();

        // Close service discovery if configured
        if (this.serviceDiscoverer) {
            await this.serviceDiscoverer.close();
        }

        this.onClose();
    }

    /**
     * Hook for client close
     */
    protected onClose(): void {
        // Can be overridden by subclasses
    }
}