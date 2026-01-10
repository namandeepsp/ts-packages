/**
 * Abstract base service discoverer implementation
 * @packageDocumentation
 */

import type { IServiceDiscoverer } from '../interfaces/ServiceDiscovery.interface.js';
import type {
    ServiceInstance,
    ServiceRegistration,
    ServiceDiscoveryResult,
    ServiceInstanceFilter,
    HealthCheckResult,
    WatchCallback,
    UnwatchFunction,
    ServiceRegistryConfig,
} from '../types/service.js';

/**
 * Abstract base service discoverer implementation
 * Provides common functionality for all service discovery implementations
 */
export abstract class BaseServiceDiscoverer implements IServiceDiscoverer {

    /** Discovery type */
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

    /** Service cache */
    protected cache: Map<string, ServiceInstance[]> = new Map();

    /** Cache timestamps */
    protected cacheTimestamps: Map<string, number> = new Map();

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
        totalResolveTime: number;
        lastError?: string;
        uptime: number;
        startTime: number;
    } = {
        totalResolves: 0,
        totalWatches: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        averageResolveTime: 0,
        totalResolveTime: 0,
        uptime: 0,
        startTime: Date.now(),
    };

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
        
        for (const serviceName of serviceNames) {
            try {
                const result = await this.resolve(serviceName);
                results.set(serviceName, result.instances);
            } catch (error) {
                results.set(serviceName, []);
            }
        }
        
        return results;
    }

    /**
     * Watch for changes to service instances
     * @param serviceName Service name to watch
     * @param callback Callback function for changes
     * @returns Unwatch function
     */
    public watch(serviceName: string, callback: WatchCallback): UnwatchFunction {
        let watchers = this.watchers.get(serviceName);
        if (!watchers) {
            watchers = new Set();
            this.watchers.set(serviceName, watchers);
        }
        
        watchers.add(callback);
        this.stats.totalWatches++;
        
        return () => {
            watchers?.delete(callback);
            if (watchers?.size === 0) {
                this.watchers.delete(serviceName);
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
     * Perform health check on service instances
     * @param serviceName Optional service name to check
     * @returns Promise resolving to health check results
     */
    public abstract healthCheck(
        serviceName?: string
    ): Promise<Map<string, HealthCheckResult[]>>;

    /**
     * Get cached service instances
     * @param serviceName Service name
     * @returns Cached instances or empty array
     */
    public getCachedInstances(serviceName: string): ServiceInstance[] {
        return this.cache.get(serviceName) || [];
    }

    /**
     * Clear cache for a service
     * @param serviceName Service name
     */
    public clearCache(serviceName?: string): void {
        if (serviceName) {
            this.cache.delete(serviceName);
            this.cacheTimestamps.delete(serviceName);
        } else {
            this.cache.clear();
            this.cacheTimestamps.clear();
        }
    }

    /**
     * Refresh cache for a service
     * @param serviceName Service name
     * @returns Promise resolving when cache is refreshed
     */
    public async refreshCache(serviceName?: string): Promise<void> {
        if (serviceName) {
            this.clearCache(serviceName);
            await this.resolve(serviceName);
        } else {
            const serviceNames = Array.from(this.cache.keys());
            this.clearCache();
            await this.resolveAll(serviceNames);
        }
    }

    /**
     * Check if cache is valid for a service
     * @param serviceName Service name
     * @returns True if cache is valid
     */
    protected isCacheValid(serviceName: string): boolean {
        if (!this.config.cache?.enabled) return false;
        
        const timestamp = this.cacheTimestamps.get(serviceName);
        if (!timestamp) return false;
        
        const ttl = this.config.cache.ttl;
        return (Date.now() - timestamp) < ttl;
    }

    /**
     * Update cache for a service
     * @param serviceName Service name
     * @param instances Service instances
     */
    protected updateCache(serviceName: string, instances: ServiceInstance[]): void {
        if (this.config.cache?.enabled) {
            this.cache.set(serviceName, instances);
            this.cacheTimestamps.set(serviceName, Date.now());
        }
    }

    /**
     * Notify watchers of service changes
     * @param serviceName Service name
     * @param instances Updated instances
     */
    protected notifyWatchers(serviceName: string, instances: ServiceInstance[]): void {
        const watchers = this.watchers.get(serviceName);
        if (watchers) {
            for (const callback of watchers) {
                try {
                    callback(instances);
                } catch (error) {
                    // Log error but continue
                }
            }
        }
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
        this.stats.uptime = Date.now() - this.stats.startTime;
        this.stats.cacheHitRate = this.stats.totalResolves > 0 
            ? this.stats.cacheHits / this.stats.totalResolves 
            : 0;
        
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
            totalResolveTime: 0,
            uptime: 0,
            startTime: Date.now(),
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
     * Health check for the service discoverer itself
     */
    public async healthCheckSelf(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }> {
        const healthy = this.isActive;
        
        return {
            healthy,
            message: healthy ? 'Service discoverer is operational' : 'Service discoverer is not active',
            details: {
                type: this.type,
                isActive: this.isActive,
                totalServices: this.totalServicesDiscovered,
                totalInstances: this.totalInstancesDiscovered,
                cacheSize: this.cache.size,
                watchersCount: this.watchers.size,
                stats: this.getStats(),
            },
        };
    }

    /**
     * Close/cleanup service discovery resources
     */
    public async close(): Promise<void> {
        this.isActive = false;
        this.unwatchAll();
        this.clearCache();
        await this.onClose();
    }

    /**
     * Hook for cleanup logic
     */
    protected async onClose(): Promise<void> {
        // Can be overridden by subclasses
    }
}