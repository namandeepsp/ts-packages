/**
 * Service discovery interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { ServiceDiscoveryEvent } from '../types/events.js';
import type {
    HealthCheckResult,
    ServiceDiscoveryResult,
    ServiceInstance,
    ServiceInstanceFilter,
    ServiceRegistration,
    ServiceRegistryConfig,
    UnwatchFunction,
    WatchCallback
} from '../types/service.js';

/**
 * Service discovery interface for discovering and monitoring service instances
 */
export interface IServiceDiscoverer {
    /** Discovery type (kubernetes, consul, etc.) */
    readonly type: string;

    /** Discovery configuration */
    readonly config: ServiceRegistryConfig;

    /** Whether discovery is currently active */
    readonly isActive: boolean;

    /** Last discovery timestamp */
    readonly lastDiscoveryTime?: number;

    /** Total services discovered */
    readonly totalServicesDiscovered: number;

    /** Total instances discovered */
    readonly totalInstancesDiscovered: number;

    /**
     * Resolve service instances for a given service name
     * @param serviceName Service name to resolve
     * @param filter Optional filter for instances
     * @returns Promise resolving to service discovery result
     * @throws {CommunicationError} If discovery fails
     */
    resolve(
        serviceName: string,
        filter?: ServiceInstanceFilter
    ): Promise<ServiceDiscoveryResult>;

    /**
     * Resolve all instances for multiple services
     * @param serviceNames Array of service names
     * @returns Promise resolving to map of service names to instances
     */
    resolveAll(
        serviceNames: string[]
    ): Promise<Map<string, ServiceInstance[]>>;

    /**
     * Watch for changes to service instances
     * @param serviceName Service name to watch
     * @param callback Callback function for changes
     * @returns Unwatch function
     */
    watch(
        serviceName: string,
        callback: WatchCallback
    ): UnwatchFunction;

    /**
     * Stop watching a service
     * @param serviceName Service name to stop watching
     */
    unwatch(serviceName: string): void;

    /**
     * Stop watching all services
     */
    unwatchAll(): void;

    /**
     * Register a service instance
     * @param registration Service registration information
     * @returns Promise resolving when registration is complete
     */
    register?(registration: ServiceRegistration): Promise<void>;

    /**
     * Deregister a service instance
     * @param serviceId Service instance ID
     * @returns Promise resolving when deregistration is complete
     */
    deregister?(serviceId: string): Promise<void>;

    /**
     * Update service instance registration
     * @param serviceId Service instance ID
     * @param updates Registration updates
     * @returns Promise resolving when update is complete
     */
    updateRegistration?(
        serviceId: string,
        updates: Partial<ServiceRegistration>
    ): Promise<void>;

    /**
     * Perform health check on service instances
     * @param serviceName Optional service name to check
     * @returns Promise resolving to health check results
     */
    healthCheck(
        serviceName?: string
    ): Promise<Map<string, HealthCheckResult[]>>;

    /**
     * Get cached service instances
     * @param serviceName Service name
     * @returns Cached instances or empty array
     */
    getCachedInstances(serviceName: string): ServiceInstance[];

    /**
     * Clear cache for a service
     * @param serviceName Service name
     */
    clearCache(serviceName?: string): void;

    /**
     * Refresh cache for a service
     * @param serviceName Service name
     * @returns Promise resolving when cache is refreshed
     */
    refreshCache(serviceName?: string): Promise<void>;

    /**
     * Start automatic discovery (for poll-based discoverers)
     */
    start?(): Promise<void>;

    /**
     * Stop automatic discovery
     */
    stop?(): Promise<void>;

    /**
     * Get service discovery statistics
     */
    getStats(): {
        totalResolves: number;
        totalWatches: number;
        cacheHits: number;
        cacheMisses: number;
        cacheHitRate: number;
        averageResolveTime: number;
        lastError?: string;
        uptime: number;
    };

    /**
     * Reset service discovery statistics
     */
    resetStats(): void;

    /**
     * Update service discovery configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<ServiceRegistryConfig>): void;

    /**
     * Health check for the service discoverer itself
     */
    healthCheckSelf(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }>;

    /**
     * Close/cleanup service discovery resources
     */
    close(): Promise<void>;

    /**
     * Event emitter for service discovery events
     */
    readonly events?: {
        /**
         * Subscribe to service discovery events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        on(event: string | string[], listener: (event: ServiceDiscoveryEvent) => void): void;

        /**
         * Unsubscribe from service discovery events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        off(event: string | string[], listener: (event: ServiceDiscoveryEvent) => void): void;
    };
}

/**
 * Service discovery factory interface
 */
export interface IServiceDiscoveryFactory {
    /**
     * Create a new service discoverer instance
     * @param type Discovery type
     * @param config Discovery configuration
     * @returns New service discoverer instance
     */
    create(
        type: string,
        config: ServiceRegistryConfig
    ): IServiceDiscoverer;

    /**
     * Get an existing service discoverer instance
     * @param id Discoverer identifier
     */
    get(id: string): IServiceDiscoverer | undefined;

    /**
     * Get all service discoverer instances
     */
    getAll(): IServiceDiscoverer[];

    /**
     * Register a custom service discoverer type
     * @param type Discoverer type name
     * @param constructor Discoverer constructor
     */
    register(
        type: string,
        constructor: new (config: ServiceRegistryConfig) => IServiceDiscoverer
    ): void;

    /**
     * Get available service discoverer types
     */
    getAvailableTypes(): string[];

    /**
     * Close all service discoverer instances
     */
    closeAll(): Promise<void>;
}
