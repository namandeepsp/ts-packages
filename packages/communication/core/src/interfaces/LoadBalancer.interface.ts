/**
 * Load balancer interface for communication layer
 * @packageDocumentation
 */
import type {
    LoadBalancingConfig,
} from '../types/config.js';
import type { LoadBalancerSelection } from '../types/config.js';
import type { LoadBalancingEvent } from '../types/events.js';
import type { ServiceInstance } from '../types/service.js';

/**
 * Load balancing strategy interface for selecting service instances
 */
export interface ILoadBalanceStrategy {
    /** Strategy name */
    readonly name: string;

    /** Strategy configuration */
    readonly config: LoadBalancingConfig;

    /** Total selections made */
    readonly totalSelections: number;

    /** Last selection timestamp */
    readonly lastSelectionTime?: number;

    /**
     * Select a service instance from available instances
     * @param instances Available service instances
     * @param context Selection context
     * @returns Selected service instance
     * @throws {CommunicationError} If no instances available
     */
    select(
        instances: ServiceInstance[],
        context?: Record<string, unknown>
    ): ServiceInstance;

    /**
     * Select multiple service instances
     * @param instances Available service instances
     * @param count Number of instances to select
     * @param context Selection context
     * @returns Selected service instances
     */
    selectMultiple(
        instances: ServiceInstance[],
        count: number,
        context?: Record<string, unknown>
    ): ServiceInstance[];

    /**
     * Update instance statistics (for adaptive strategies)
     * @param instance Service instance
     * @param success Whether the request was successful
     * @param responseTime Response time in milliseconds
     */
    updateStats(
        instance: ServiceInstance,
        success: boolean,
        responseTime?: number
    ): void;

    /**
     * Reset instance statistics
     * @param instanceId Optional instance ID to reset, or reset all
     */
    resetStats(instanceId?: string): void;

    /**
     * Get instance statistics
     * @param instanceId Optional instance ID to get stats for
     */
    getStats(instanceId?: string): Record<string, unknown>;

    /**
     * Check if an instance is currently eligible for selection
     * @param instance Service instance to check
     */
    isEligible(instance: ServiceInstance): boolean;

    /**
     * Filter instances based on eligibility
     * @param instances Instances to filter
     */
    filterEligible(instances: ServiceInstance[]): ServiceInstance[];

    /**
     * Sort instances by selection priority
     * @param instances Instances to sort
     */
    sortByPriority(instances: ServiceInstance[]): ServiceInstance[];

    /**
     * Update load balancer configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<LoadBalancingConfig>): void;

    /**
     * Get load balancer statistics
     */
    getStrategyStats(): {
        totalSelections: number;
        successfulSelections: number;
        failedSelections: number;
        averageSelectionTime: number;
        instanceStats: Record<string, {
            selections: number;
            successes: number;
            failures: number;
            averageResponseTime?: number;
        }>;
    };

    /**
     * Reset load balancer statistics
     */
    resetStrategyStats(): void;

    /**
     * Health check for the load balancer
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };

    /**
     * Event emitter for load balancing events
     */
    readonly events?: {
        /**
         * Subscribe to load balancing events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        on(event: string | string[], listener: (event: LoadBalancingEvent) => void): void;

        /**
         * Unsubscribe from load balancing events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        off(event: string | string[], listener: (event: LoadBalancingEvent) => void): void;
    };
}

/**
 * Load balancer factory interface
 */
export interface ILoadBalancerFactory {
    /**
     * Create a new load balancer instance
     * @param name Load balancer name
     * @param strategy Load balancing strategy
     * @param config Load balancer configuration
     * @returns New load balancer instance
     */
    create(
        name: string,
        strategy: string,
        config?: Partial<LoadBalancingConfig>
    ): ILoadBalanceStrategy;

    /**
     * Get an existing load balancer instance
     * @param name Load balancer name
     */
    get(name: string): ILoadBalanceStrategy | undefined;

    /**
     * Get all load balancer instances
     */
    getAll(): ILoadBalanceStrategy[];

    /**
     * Register a custom load balancing strategy
     * @param name Strategy name
     * @param strategy Strategy instance or constructor
     */
    register(
        name: string,
        strategy: ILoadBalanceStrategy | (new (config: LoadBalancingConfig) => ILoadBalanceStrategy)
    ): void;

    /**
     * Get available load balancing strategies
     */
    getAvailableStrategies(): string[];

    /**
     * Close all load balancer instances
     */
    closeAll(): Promise<void>;
}
