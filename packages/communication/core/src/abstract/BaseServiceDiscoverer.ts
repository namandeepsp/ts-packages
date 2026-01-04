/**
 * Abstract base service discoverer implementation
 * @packageDocumentation
 */

import type { IServiceDiscoverer } from '../interfaces/ServiceDiscovery.interface.js';
import type {
    HealthCheckResult,
    ServiceDiscoveryResult,
    ServiceInstance,
    ServiceInstanceFilter,
    ServiceRegistryConfig,
    UnwatchFunction,
    WatchCallback
} from '../types/service.js';

/**
 * Abstract base service discoverer implementation
 * Provides common functionality for all service discoverer implementations
 */
export abstract class BaseServiceDiscoverer implements IServiceDiscoverer {

    /** Discovery type (kubernetes, consul, etc.) */
    public readonly type: string;

    /** Discovery configuration */
    public config: ServiceRegistryConfig;

    /** Whether discovery is currently active */
    public isActive: boolean = false;

    /** Last discovery timestamp */
    public lastDiscoveryTime?: number;

    /** Total services discovered */
    public totalServicesDiscovered: number = 0;

    /** Total instances discovered */
    public totalInstancesDiscovered: number = 0;

    /** Service instance cache */
    protected cache: Map<string, {
        instances: ServiceInstance[];
        timestamp: number;
        ttl: number;
    }> = new Map();

    /** Watch callbacks */
    protected watchers: Map<string, Set<WatchCallback>> = new Map();

    /** Discovery statistics */
    protected stats: {
        totalResolves: number;
        totalWatches: number;
        cacheHits: number;
        cacheMisses: number;
        cacheHitRate: number;
        averageResolveTime: number;
        lastError?: string;
        uptime: number;
    } = {
            totalResolves: 0,
            totalWatches: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheHitRate: 0,
            averageResolveTime: 0,
            uptime: 0,
        };

    /** Start time */
    protected readonly startTime: number = Date.now();

    /**
     * Create a new base service discoverer instance
     * @param type Discovery type
     * @param config Discovery configuration
     */
    constructor(type: string, config: ServiceRegistryConfig) {
        this.type = type;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize service discoverer
     */
    protected initialize(): void {
        // Can be overridden by subclasses
    }

    /**
     * Resolve service instances for a given service name
     * @param serviceName Service name to resolve
     * @param filter Optional filter for instances
     * @returns Promise resolving to service discovery result
     * @throws {CommunicationError} If discovery fails
     */
    public abstract resolve(
        serviceName: string,
        filter?: ServiceInstanceFilter
    ): Promise<ServiceDiscoveryResult>;

    /**
     * Resolve all instances for multiple services
     * @param serviceNames Array of service names
     * @returns Promise resolving to map of service names to instances
     */
    public async resolveAll(
        serviceNames: string[]
    ): Promise<Map<string, ServiceInstance[]>> {
        const results = new Map<string, ServiceInstance[]>();
        const promises = serviceNames.map(async (serviceName) => {
            try {
                const result = await this.resolve(serviceName);
                results.set(serviceName, result.instances);
            } catch (error) {
                results.set(serviceName, []);
            }
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * Watch for changes to service instances
     * @param serviceName Service name to watch
     * @param callback Callback function for changes
     * @returns Unwatch function
     */
    public watch(
        serviceName: string,
        callback: WatchCallback
    ): UnwatchFunction {
        if (!this.watchers.has(serviceName)) {
            this.watchers.set(serviceName, new Set());
        }

        const watcherSet = this.watchers.get(serviceName)!;
        watcherSet.add(callback);
        this.stats.totalWatches++;

        // ✅ Correct - call directly
        const instances = this.getCachedInstances(serviceName);
        try {
            callback(instances);
        } catch {
            // Ignore errors in initial callback
        }

        return () => {
            const watchers = this.watchers.get(serviceName);
            if (watchers) {
                watchers.delete(callback);
                if (watchers.size === 0) {
                    this.watchers.delete(serviceName);
                }
            }
        };
    }

    /**
     * Stop watching a service
     * @param serviceName Service name to stop watching
     */
    public unwatch(serviceName: string): void {
        this.watchers.delete(serviceName);
    }

    /**
     * Stop watching all services
     */
    public unwatchAll(): void {
        this.watchers.clear();
    }

    /**
     * Notify watchers of service instance changes
     * @param serviceName Service name
     * @param instances Updated instances
     */
    protected notifyWatchers(
        serviceName: string,
        instances: ServiceInstance[]
    ): void {
        const watchers = this.watchers.get(serviceName);
        if (watchers) {
            for (const callback of watchers) {
                try {
                    callback(instances);
                } catch (error) {
                    // Ignore errors in watcher callbacks
                }
            }
        }
    }

    /**
     * Cache service instances
     * @param serviceName Service name
     * @param instances Service instances
     * @param ttl Cache TTL in milliseconds
     */
    protected cacheInstances(
        serviceName: string,
        instances: ServiceInstance[],
        ttl?: number
    ): void {
        const cacheTTL = ttl || this.config.cache?.ttl || 30000;
        this.cache.set(serviceName, {
            instances,
            timestamp: Date.now(),
            ttl: cacheTTL,
        });
    }

    /**
     * Get cached service instances
     * @param serviceName Service name
     * @returns Cached instances or empty array
     */
    public getCachedInstances(serviceName: string): ServiceInstance[] {
        const cached = this.cache.get(serviceName);

        if (!cached) {
            this.stats.cacheMisses++;
            return [];
        }

        // Check if cache is expired
        const isExpired = Date.now() - cached.timestamp > cached.ttl;
        if (isExpired) {
            this.cache.delete(serviceName);
            this.stats.cacheMisses++;
            return [];
        }

        this.stats.cacheHits++;
        return [...cached.instances];
    }

    /**
     * Check if cache is valid for a service
     * @param serviceName Service name
     * @returns True if cache is valid
     */
    protected isCacheValid(serviceName: string): boolean {
        const cached = this.cache.get(serviceName);
        if (!cached) return false;

        return Date.now() - cached.timestamp <= cached.ttl;
    }

    /**
     * Clear cache for a service
     * @param serviceName Service name
     */
    public clearCache(serviceName?: string): void {
        if (serviceName) {
            this.cache.delete(serviceName);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Refresh cache for a service
     * @param serviceName Service name
     * @returns Promise resolving when cache is refreshed
     */
    public async refreshCache(serviceName?: string): Promise<void> {
        if (serviceName) {
            await this.resolve(serviceName);
        } else {
            // Get all cached service names
            const serviceNames = Array.from(this.cache.keys());
            await Promise.allSettled(
                serviceNames.map(name => this.resolve(name))
            );
        }
    }

    /**
     * Filter service instances based on filter criteria
     * @param instances Instances to filter
     * @param filter Filter criteria
     * @returns Filtered instances
     */
    protected filterInstances(
        instances: ServiceInstance[],
        filter?: ServiceInstanceFilter
    ): ServiceInstance[] {
        if (!filter) return instances;

        return instances.filter(instance => {
            // Filter by status
            if (filter.status && instance.status !== filter.status) {
                return false;
            }

            // Filter by tags
            if (filter.tags && filter.tags.length > 0) {
                if (!instance.tags || !filter.tags.every(tag => instance.tags!.includes(tag))) {
                    return false;
                }
            }

            // Filter by zone
            if (filter.zone && instance.zone !== filter.zone) {
                return false;
            }

            // Filter by version
            if (filter.version && instance.version !== filter.version) {
                return false;
            }

            // Custom filter function
            if (filter.filter && !filter.filter(instance)) {
                return false;
            }

            return true;
        }).slice(0, filter.limit || instances.length);
    }

    /**
     * Update service discovery statistics
     * @param resolveTime Resolve time in milliseconds
     * @param cacheHit Whether it was a cache hit
     */
    protected updateStats(resolveTime: number, cacheHit: boolean): void {
        this.stats.totalResolves++;
        this.stats.averageResolveTime = (
            (this.stats.averageResolveTime * (this.stats.totalResolves - 1) + resolveTime) /
            this.stats.totalResolves
        );
        this.stats.cacheHitRate = this.stats.totalResolves > 0 ?
            this.stats.cacheHits / this.stats.totalResolves : 0;
        this.stats.uptime = Date.now() - this.startTime;
    }

    /**
     * Get service discovery statistics
     */
    public getStats(): {
        totalResolves: number;
        totalWatches: number;
        cacheHits: number;
        cacheMisses: number;
        cacheHitRate: number;
        averageResolveTime: number;
        lastError?: string;
        uptime: number;
    } {
        return { ...this.stats };
    }

    /**
     * Reset service discovery statistics
     */
    public resetStats(): void {
        this.stats = {
            totalResolves: 0,
            totalWatches: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheHitRate: 0,
            averageResolveTime: 0,
            uptime: Date.now() - this.startTime,
        };
    }

    /**
     * Update service discovery configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<ServiceRegistryConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
 * Perform health check on service instances
 * @param serviceName Optional service name to check
 * @returns Promise resolving to health check results
 */
    public async healthCheck(
        serviceName?: string
    ): Promise<Map<string, HealthCheckResult[]>> {
        const results = new Map<string, HealthCheckResult[]>();

        if (serviceName) {
            // Health check specific service
            const instances = await this.getInstancesForHealthCheck(serviceName);
            const serviceResults = await this.checkInstancesHealth(instances);
            results.set(serviceName, serviceResults);
        } else {
            // Health check all cached services
            const serviceNames = Array.from(this.cache.keys());
            const promises = serviceNames.map(async (name) => {
                const instances = await this.getInstancesForHealthCheck(name);
                const serviceResults = await this.checkInstancesHealth(instances);
                results.set(name, serviceResults);
            });

            await Promise.all(promises);
        }

        return results;
    }

    /**
     * Get instances for health check
     * @param serviceName Service name
     * @returns Service instances
     */
    protected async getInstancesForHealthCheck(
        serviceName: string
    ): Promise<ServiceInstance[]> {
        // Try cache first, then resolve if needed
        const cached = this.getCachedInstances(serviceName);
        if (cached.length > 0) {
            return cached;
        }

        try {
            const result = await this.resolve(serviceName);
            return result.instances;
        } catch {
            return [];
        }
    }

    /**
     * Check health of service instances
     * @param instances Service instances
     * @returns Health check results
     */
    protected async checkInstancesHealth(
        instances: ServiceInstance[]
    ): Promise<HealthCheckResult[]> {
        const promises = instances.map(async (instance) => {
            const startTime = Date.now();

            try {
                // Default health check: instance is healthy if status is 'healthy'
                const isHealthy = instance.status === 'healthy';
                const responseTime = Date.now() - startTime;

                return {
                    healthy: isHealthy,
                    timestamp: Date.now(),
                    responseTime,
                    instanceId: instance.id,
                    details: {
                        host: instance.host,
                        port: instance.port,
                        status: instance.status,
                        lastHealthCheck: instance.lastHealthCheck,
                    },
                };
            } catch (error) {
                return {
                    healthy: false,
                    timestamp: Date.now(),
                    error: error instanceof Error ? error.message : String(error),
                    instanceId: instance.id,
                    details: {
                        host: instance.host,
                        port: instance.port,
                        status: instance.status,
                    },
                };
            }
        });

        return Promise.all(promises);
    }

    /**
     * Health check for the service discoverer itself
     */
    public async healthCheckSelf(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }> {
        const healthy = this.isActive !== false;

        return {
            healthy,
            message: healthy ? 'Service discoverer is healthy' : 'Service discoverer is not active',
            details: {
                type: this.type,
                isActive: this.isActive,
                cacheSize: this.cache.size,
                watchers: this.watchers.size,
                stats: this.getStats(),
            },
        };
    }

    /**
     * Close/cleanup service discovery resources
     */
    public async close(): Promise<void> {
        this.isActive = false;
        this.watchers.clear();
        this.cache.clear();
        await this.onClose();
    }

    /**
     * Hook for service discoverer close
     */
    protected async onClose(): Promise<void> {
        // Can be overridden by subclasses
    }
}