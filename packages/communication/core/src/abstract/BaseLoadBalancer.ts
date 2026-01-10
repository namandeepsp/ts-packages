/**
 * Abstract base load balancer implementation
 * @packageDocumentation
 */

import { CommunicationError } from '../errors/CommunicationError.js';
import type {
    ILoadBalanceStrategy,
} from '../interfaces/LoadBalancer.interface.js';
import type { LoadBalancerSelection } from '../types/config.js';
import type {
    LoadBalancingConfig,
} from '../types/config.js';
import type { ServiceInstance } from '../types/service.js';

/**
 * Abstract base load balancer implementation
 * Provides common functionality for all load balancing strategy implementations
 */
export abstract class BaseLoadBalancer implements ILoadBalanceStrategy {

    /** Strategy name */
    public readonly name: string;

    /** Strategy configuration */
    public config: LoadBalancingConfig;

    /** Total selections made */
    public totalSelections: number = 0;

    /** Last selection timestamp */
    public lastSelectionTime?: number;

    /** Instance statistics */
    protected instanceStats: Map<string, {
        selections: number;
        successes: number;
        failures: number;
        totalResponseTime: number;
        averageResponseTime?: number;
        lastSelected?: number;
    }> = new Map();

    /** Load balancer statistics */
    protected stats: {
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
    } = {
            totalSelections: 0,
            successfulSelections: 0,
            failedSelections: 0,
            averageSelectionTime: 0,
            instanceStats: {},
        };

    /**
     * Create a new base load balancer instance
     * @param name Load balancer name
     * @param config Load balancer configuration
     */
    constructor(name: string, config: LoadBalancingConfig) {
        this.name = name;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize load balancer
     */
    protected initialize(): void {
        // Can be overridden by subclasses
    }

    /**
     * Select a service instance from available instances
     * @param instances Available service instances
     * @param context Selection context
     * @returns Selected service instance
     * @throws {CommunicationError} If no instances available
     */
    public abstract select(
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
    public selectMultiple(
        instances: ServiceInstance[],
        count: number,
        context?: Record<string, unknown>
    ): ServiceInstance[] {
        const selected: ServiceInstance[] = [];
        const available = [...instances];

        for (let i = 0; i < count && available.length > 0; i++) {
            const instance = this.select(available, context);
            selected.push(instance);

            // Remove selected instance from available pool
            const index = available.findIndex(inst => inst.id === instance.id);
            if (index !== -1) {
                available.splice(index, 1);
            }
        }

        return selected;
    }

    /**
     * Update instance statistics (for adaptive strategies)
     * @param instance Service instance
     * @param success Whether the request was successful
     * @param responseTime Response time in milliseconds
     */
    public updateStats(
        instance: ServiceInstance,
        success: boolean,
        responseTime?: number
    ): void {
        const instanceId = instance.id;
        const now = Date.now();

        let stats = this.instanceStats.get(instanceId);
        if (!stats) {
            stats = {
                selections: 0,
                successes: 0,
                failures: 0,
                totalResponseTime: 0,
                averageResponseTime: undefined,
                lastSelected: undefined,
            };
            this.instanceStats.set(instanceId, stats);
        }

        stats.selections++;
        stats.lastSelected = now;

        if (success) {
            stats.successes++;
            if (responseTime !== undefined) {
                stats.totalResponseTime += responseTime;
                stats.averageResponseTime = stats.totalResponseTime / stats.selections;
            }
        } else {
            stats.failures++;
        }

        // Update aggregate stats
        this.updateAggregateStats(instanceId, stats);
    }

    /**
     * Update aggregate statistics
     * @param instanceId Instance ID
     * @param instanceStats Instance statistics
     */
    protected updateAggregateStats(
        instanceId: string,
        instanceStats: {
            selections: number;
            successes: number;
            failures: number;
            totalResponseTime: number;
            averageResponseTime?: number;
            lastSelected?: number;
        }
    ): void {
        this.stats.instanceStats[instanceId] = {
            selections: instanceStats.selections,
            successes: instanceStats.successes,
            failures: instanceStats.failures,
            averageResponseTime: instanceStats.averageResponseTime,
        };
    }

    /**
     * Reset instance statistics
     * @param instanceId Optional instance ID to reset, or reset all
     */
    public resetStats(instanceId?: string): void {
        if (instanceId) {
            this.instanceStats.delete(instanceId);
            delete this.stats.instanceStats[instanceId];
        } else {
            this.instanceStats.clear();
            this.stats.instanceStats = {};
            this.totalSelections = 0;
            this.lastSelectionTime = undefined;
            this.stats.totalSelections = 0;
            this.stats.successfulSelections = 0;
            this.stats.failedSelections = 0;
            this.stats.averageSelectionTime = 0;
        }
    }

    /**
     * Get instance statistics
     * @param instanceId Optional instance ID to get stats for
     */
    public getStats(instanceId?: string): Record<string, unknown> {
        if (instanceId) {
            const stats = this.instanceStats.get(instanceId);
            return stats ? { ...stats, instanceId } : {};
        }

        return {
            ...this.stats,
            totalSelections: this.totalSelections,
            lastSelectionTime: this.lastSelectionTime,
        };
    }

    /**
     * Check if an instance is currently eligible for selection
     * @param instance Service instance to check
     */
    public isEligible(instance: ServiceInstance): boolean {
        // Default eligibility: instance must be healthy
        if (instance.status !== 'healthy') {
            return false;
        }

        // Check if instance is within weight limits (if weighted strategy)
        if (this.config.weights) {
            const weight = this.config.weights[instance.id];
            if (weight !== undefined && weight <= 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Filter instances based on eligibility
     * @param instances Instances to filter
     */
    public filterEligible(instances: ServiceInstance[]): ServiceInstance[] {
        return instances.filter(instance => this.isEligible(instance));
    }

    /**
     * Sort instances by selection priority
     * @param instances Instances to sort
     */
    public sortByPriority(instances: ServiceInstance[]): ServiceInstance[] {
        // Default: no sorting, return as-is
        return [...instances];
    }

    /**
     * Get instance weight
     * @param instance Service instance
     * @returns Instance weight
     */
    protected getInstanceWeight(instance: ServiceInstance): number {
        if (this.config.weights && this.config.weights[instance.id]) {
            return this.config.weights[instance.id];
        }

        if (instance.weight !== undefined) {
            return instance.weight;
        }

        return 1; // Default weight
    }

    /**
     * Record selection
     * @param instance Selected instance
     * @param selectionTime Selection time in milliseconds
     */
    protected recordSelection(instance: ServiceInstance, selectionTime: number): void {
        this.totalSelections++;
        this.lastSelectionTime = Date.now();
        this.stats.totalSelections++;

        // Update average selection time
        this.stats.averageSelectionTime = (
            (this.stats.averageSelectionTime * (this.stats.totalSelections - 1) + selectionTime) /
            this.stats.totalSelections
        );

        // Update instance stats
        this.updateStats(instance, true);
    }

    /**
     * Create selection result
     * @param instance Selected instance
     * @param instances Available instances
     * @param selectionTime Selection time in milliseconds
     * @returns Selection result
     */
    protected createSelectionResult(
        instance: ServiceInstance,
        instances: ServiceInstance[],
        selectionTime: number
    ): LoadBalancerSelection {
        return {
            selectedInstance: instance,
            availableInstances: instances,
            timestamp: Date.now(),
            selectionDuration: selectionTime,
            metadata: {
                strategy: this.name,
                totalSelections: this.totalSelections,
            },
        };
    }

    /**
     * Update load balancer configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<LoadBalancingConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get load balancer statistics
     */
    public getStrategyStats(): {
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
    } {
        return { ...this.stats };
    }

    /**
     * Reset load balancer statistics
     */
    public resetStrategyStats(): void {
        this.stats = {
            totalSelections: 0,
            successfulSelections: 0,
            failedSelections: 0,
            averageSelectionTime: 0,
            instanceStats: {},
        };
    }

    /**
     * Health check for the load balancer
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = true; // Load balancer is always healthy

        return {
            healthy,
            message: 'Load balancer is operational',
            details: {
                name: this.name,
                totalSelections: this.totalSelections,
                instanceCount: this.instanceStats.size,
                config: this.config,
            },
        };
    }
}