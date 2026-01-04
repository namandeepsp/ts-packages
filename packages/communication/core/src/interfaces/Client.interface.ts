/**
 * Client interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { ClientConfig } from '../types/config.js';
import type {
    Request,
    RequestOptions,
} from '../types/request.js';
import type { Response } from '../types/response.js';
import type { ServiceInstance } from '../types/service.js';
import type { ICircuitBreaker } from './CircuitBreaker.interface.js';
import type { IInterceptor } from './Interceptor.interface.js';
import type { ILoadBalanceStrategy } from './LoadBalancer.interface.js';
import type { IProtocol } from './Protocol.interface.js';
import type { IRetryStrategy } from './RetryStrategy.interface.js';
import type { IServiceDiscoverer } from './ServiceDiscovery.interface.js';

/**
 * Client interface for service-to-service communication
 * This is the main interface that users interact with
 */
export interface IClient {
    /** Client configuration */
    readonly config: ClientConfig;

    /** Client name/identifier */
    readonly name: string;

    /** Service name this client communicates with */
    readonly serviceName: string;

    /** Protocol being used */
    readonly protocol: IProtocol;

    /**
     * Make a request to a service endpoint
     * @param endpoint Service endpoint/path
     * @param data Request data
     * @param options Request options
     * @returns Promise resolving to the response
     * @throws {CommunicationError} If the request fails
     */
    call<T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<Response<T>>;

    /**
     * Make a request with full control over request object
     * @param request Complete request object
     * @returns Promise resolving to the response
     */
    request<T = unknown>(
        request: Request
    ): Promise<Response<T>>;

    /**
     * Get service discovery instance
     */
    getServiceDiscoverer?(): IServiceDiscoverer | undefined;

    /**
     * Get load balancer instance
     */
    getLoadBalancer?(): ILoadBalanceStrategy | undefined;

    /**
     * Get circuit breaker instance
     */
    getCircuitBreaker?(): ICircuitBreaker | undefined;

    /**
     * Get retry strategy instance
     */
    getRetryStrategy?(): IRetryStrategy | undefined;

    /**
     * Add an interceptor to the client
     * @param interceptor Interceptor to add
     */
    addInterceptor(interceptor: IInterceptor): void;

    /**
     * Remove an interceptor from the client
     * @param interceptorId Interceptor identifier
     */
    removeInterceptor(interceptorId: string): void;

    /**
     * Get all interceptors
     */
    getInterceptors(): IInterceptor[];

    /**
     * Clear all interceptors
     */
    clearInterceptors(): void;

    /**
     * Discover service instances
     * @returns Promise resolving to service instances
     */
    discoverService?(): Promise<ServiceInstance[]>;

    /**
     * Get current service instances (cached)
     */
    getServiceInstances?(): ServiceInstance[];

    /**
     * Refresh service instances cache
     */
    refreshServiceInstances?(): Promise<void>;

    /**
     * Health check for the client
     * @returns Promise resolving to health status
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }>;

    /**
     * Get client metrics
     */
    getMetrics(): Record<string, unknown>;

    /**
     * Reset client metrics
     */
    resetMetrics(): void;

    /**
     * Close/cleanup client resources
     */
    close(): Promise<void>;

    /**
     * Event emitter for client events
     */
    readonly events?: {
        /**
         * Subscribe to client events
         * @param event Event name
         * @param listener Event listener
         */
        on(event: string, listener: (data: any) => void): void;

        /**
         * Unsubscribe from client events
         * @param event Event name
         * @param listener Event listener
         */
        off(event: string, listener: (data: any) => void): void;
    };
}

/**
 * Client factory interface for creating client instances
 */
export interface IClientFactory {
    /**
     * Create a new client instance
     * @param serviceName Service name to communicate with
     * @param config Client configuration
     * @returns New client instance
     */
    create(
        serviceName: string,
        config?: Partial<ClientConfig>
    ): IClient;

    /**
     * Get an existing client instance
     * @param clientId Client identifier
     */
    get?(clientId: string): IClient | undefined;

    /**
     * Close all client instances
     */
    closeAll?(): Promise<void>;

    /**
     * Get all client instances
     */
    getAll?(): IClient[];
}
