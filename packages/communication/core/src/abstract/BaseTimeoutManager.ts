/**
 * Abstract base timeout manager implementation
 * @packageDocumentation
 */

import { TimeoutError } from '@naman_deep_singh/utils';
import { CommunicationError } from '../errors/CommunicationError.js';
import type { ITimeoutManager, TimeoutOptions } from '../interfaces/Timeout.interface.js';
import type { TimeoutConfig } from '../types/config.js';

/**
 * Abstract base timeout manager implementation
 * Provides common functionality for timeout management
 */
export abstract class BaseTimeoutManager implements ITimeoutManager {

    /** Timeout manager name */
    public readonly name: string;

    /** Timeout configuration */
    public config: TimeoutConfig;

    /** Operation-specific timeouts */
    protected operationTimeouts: Map<string, number> = new Map();

    /** Timeout statistics */
    protected stats: {
        totalOperations: number;
        timedOutOperations: number;
        totalOperationTime: number;
        averageOperationTime: number;
        timeoutRate: number;
        perOperationStats: Map<string, {
            calls: number;
            timeouts: number;
            totalTime: number;
            averageTime: number;
        }>;
    } = {
            totalOperations: 0,
            timedOutOperations: 0,
            totalOperationTime: 0,
            averageOperationTime: 0,
            timeoutRate: 0,
            perOperationStats: new Map(),
        };

    /**
     * Create a new base timeout manager instance
     * @param name Timeout manager name
     * @param config Timeout configuration
     */
    constructor(name: string, config: TimeoutConfig) {
        this.name = name;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize timeout manager
     */
    protected initialize(): void {
        // Can be overridden by subclasses
        // Set up default operation timeouts
        if (this.config.global) {
            this.operationTimeouts.set('global', this.config.global);
        }
        if (this.config.connection) {
            this.operationTimeouts.set('connection', this.config.connection);
        }
        if (this.config.read) {
            this.operationTimeouts.set('read', this.config.read);
        }
        if (this.config.write) {
            this.operationTimeouts.set('write', this.config.write);
        }
        if (this.config.request) {
            this.operationTimeouts.set('request', this.config.request);
        }
    }

    /**
     * Execute a function with timeout
     * @param fn Function to execute
     * @param options Timeout options
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If timeout occurs
     */
    public async execute<T>(
        fn: () => Promise<T>,
        options?: TimeoutOptions
    ): Promise<T> {
        const operationName = options?.name || 'anonymous';
        const timeoutMs = options?.timeout || this.getOperationTimeout(operationName) || this.config.global || 30000;
        const throwOnTimeout = options?.throwOnTimeout !== false;
        const startTime = Date.now();

        // Create timeout promise
        const timeoutPromise = this.createTimeout(
            timeoutMs,
            options?.errorMessage || `Operation '${operationName}' timed out after ${timeoutMs}ms`
        );

        // Create cleanup function
        const cleanup = options?.cleanup;

        try {
            // Race between function and timeout
            const result = await Promise.race([
                fn(),
                timeoutPromise,
            ]);

            const duration = Date.now() - startTime;
            this.recordSuccess(operationName, duration);

            return result as T;
        } catch (error) {
            const duration = Date.now() - startTime;

            // Check if it's a timeout error
            if (error instanceof TimeoutError || error instanceof CommunicationError) {
                this.recordTimeout(operationName, duration);

                // Call cleanup if provided
                if (cleanup) {
                    try {
                        await cleanup();
                    } catch (cleanupError) {
                        // Ignore cleanup errors
                    }
                }

                if (throwOnTimeout) {
                    throw error;
                }

                // If not throwing, return default value
                return undefined as T;
            }

            // Record failure but not timeout
            this.recordFailure(operationName, duration, error as Error);
            throw error;
        }
    }

    /**
     * Create a timeout promise
     * @param timeout Timeout in milliseconds
     * @param message Error message
     * @returns Promise that rejects after timeout
     */
    public createTimeout(timeout: number, message?: string): Promise<never> {
        return new Promise((_, reject) => {
            const timer = setTimeout(() => {
                clearTimeout(timer);
                reject(new TimeoutError(message || `Operation timed out after ${timeout}ms`, timeout));
            }, timeout);
        });
    }

    /**
     * Create an abort signal for timeout
     * @param timeout Timeout in milliseconds
     * @returns AbortSignal
     */
    public createAbortSignal(timeout: number): AbortSignal {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    }

    /**
     * Execute multiple promises with timeout
     * @param promises Array of promises
     * @param timeout Timeout in milliseconds
     * @returns Promise that resolves when first promise resolves or times out
     */
    public async race<T>(
        promises: Promise<T>[],
        timeout: number
    ): Promise<T> {
        const timeoutPromise = this.createTimeout(timeout);
        return Promise.race([...promises, timeoutPromise]);
    }

    /**
     * Delay execution for specified time
     * @param delay Delay in milliseconds
     * @returns Promise that resolves after delay
     */
    public delay(delay: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Set operation timeout
     * @param operation Operation identifier
     * @param timeout Timeout in milliseconds
     */
    public setOperationTimeout(operation: string, timeout: number): void {
        this.operationTimeouts.set(operation, timeout);
    }

    /**
     * Get operation timeout
     * @param operation Operation identifier
     * @returns Timeout in milliseconds or undefined
     */
    public getOperationTimeout(operation: string): number | undefined {
        // Check operation-specific timeout
        const operationTimeout = this.operationTimeouts.get(operation);
        if (operationTimeout !== undefined) {
            return operationTimeout;
        }

        // Fall back to global timeout
        return this.config.global;
    }

    /**
     * Record successful operation
     * @param operation Operation name
     * @param duration Duration in milliseconds
     */
    protected recordSuccess(operation: string, duration: number): void {
        this.stats.totalOperations++;
        this.stats.totalOperationTime += duration;
        this.stats.averageOperationTime = this.stats.totalOperationTime / this.stats.totalOperations;

        // Update per-operation stats
        this.updateOperationStats(operation, duration, false);
    }

    /**
     * Record timed out operation
     * @param operation Operation name
     * @param duration Duration in milliseconds
     */
    protected recordTimeout(operation: string, duration: number): void {
        this.stats.totalOperations++;
        this.stats.timedOutOperations++;
        this.stats.totalOperationTime += duration;
        this.stats.averageOperationTime = this.stats.totalOperationTime / this.stats.totalOperations;
        this.stats.timeoutRate = this.stats.timedOutOperations / this.stats.totalOperations;

        // Update per-operation stats
        this.updateOperationStats(operation, duration, true);
    }

    /**
     * Record failed operation (not timeout)
     * @param operation Operation name
     * @param duration Duration in milliseconds
     * @param error Error that occurred
     */
    protected recordFailure(operation: string, duration: number, error: Error): void {
        this.stats.totalOperations++;
        this.stats.totalOperationTime += duration;
        this.stats.averageOperationTime = this.stats.totalOperationTime / this.stats.totalOperations;

        // Update per-operation stats
        this.updateOperationStats(operation, duration, false);
    }

    /**
     * Update operation-specific statistics
     * @param operation Operation name
     * @param duration Duration in milliseconds
     * @param isTimeout Whether operation timed out
     */
    protected updateOperationStats(
        operation: string,
        duration: number,
        isTimeout: boolean
    ): void {
        let opStats = this.stats.perOperationStats.get(operation);
        if (!opStats) {
            opStats = {
                calls: 0,
                timeouts: 0,
                totalTime: 0,
                averageTime: 0,
            };
            this.stats.perOperationStats.set(operation, opStats);
        }

        opStats.calls++;
        if (isTimeout) {
            opStats.timeouts++;
        }
        opStats.totalTime += duration;
        opStats.averageTime = opStats.totalTime / opStats.calls;
    }

    /**
     * Update timeout configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<TimeoutConfig>): void {
        this.config = { ...this.config, ...config };
        // Re-initialize operation timeouts
        this.initialize();
    }

    /**
     * Get timeout statistics
     */
    public getStats(): {
        totalOperations: number;
        timedOutOperations: number;
        averageOperationTime: number;
        timeoutRate: number;
        perOperationStats: Record<string, {
            calls: number;
            timeouts: number;
            averageTime: number;
        }>;
    } {
        const perOperationStats: Record<string, {
            calls: number;
            timeouts: number;
            averageTime: number;
        }> = {};

        for (const [operation, stats] of this.stats.perOperationStats) {
            perOperationStats[operation] = {
                calls: stats.calls,
                timeouts: stats.timeouts,
                averageTime: stats.averageTime,
            };
        }

        return {
            totalOperations: this.stats.totalOperations,
            timedOutOperations: this.stats.timedOutOperations,
            averageOperationTime: this.stats.averageOperationTime,
            timeoutRate: this.stats.timeoutRate,
            perOperationStats,
        };
    }

    /**
     * Reset timeout statistics
     */
    public resetStats(): void {
        this.stats = {
            totalOperations: 0,
            timedOutOperations: 0,
            totalOperationTime: 0,
            averageOperationTime: 0,
            timeoutRate: 0,
            perOperationStats: new Map(),
        };
    }

    /**
     * Health check for timeout manager
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = true; // Timeout manager is always healthy

        return {
            healthy,
            message: 'Timeout manager is operational',
            details: {
                name: this.name,
                config: this.config,
                operationTimeouts: Object.fromEntries(this.operationTimeouts),
                statistics: this.getStats(),
            },
        };
    }
}