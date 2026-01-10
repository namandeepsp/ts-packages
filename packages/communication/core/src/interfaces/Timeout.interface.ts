/**
 * Timeout interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { TimeoutConfig } from '../types/config.js';

/**
 * Timeout options for individual operations
 */
export interface TimeoutOptions {
    /** Operation timeout in milliseconds */
    timeout?: number;

    /** Operation name for logging */
    name?: string;

    /** Should throw on timeout */
    throwOnTimeout?: boolean;

    /** Cleanup function to call on timeout */
    cleanup?: () => void | Promise<void>;

    /** Custom error message */
    errorMessage?: string;
}

/**
 * Timeout manager interface
 */
export interface ITimeoutManager {
    /** Timeout configuration */
    readonly config: TimeoutConfig;

    /**
     * Execute a function with timeout
     * @param fn Function to execute
     * @param options Timeout options
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If timeout occurs
     */
    execute<T>(
        fn: () => Promise<T>,
        options?: TimeoutOptions
    ): Promise<T>;

    /**
     * Create a timeout promise
     * @param timeout Timeout in milliseconds
     * @param message Error message
     * @returns Promise that rejects after timeout
     */
    createTimeout(
        timeout: number,
        message?: string
    ): Promise<never>;

    /**
     * Create an abort signal for timeout
     * @param timeout Timeout in milliseconds
     * @returns AbortSignal
     */
    createAbortSignal(timeout: number): AbortSignal;

    /**
     * Execute multiple promises with timeout
     * @param promises Array of promises
     * @param timeout Timeout in milliseconds
     * @returns Promise that resolves when first promise resolves or times out
     */
    race<T>(
        promises: Promise<T>[],
        timeout: number
    ): Promise<T>;

    /**
     * Delay execution for specified time
     * @param delay Delay in milliseconds
     * @returns Promise that resolves after delay
     */
    delay(delay: number): Promise<void>;

    /**
     * Set operation timeout
     * @param operation Operation identifier
     * @param timeout Timeout in milliseconds
     */
    setOperationTimeout(operation: string, timeout: number): void;

    /**
     * Get operation timeout
     * @param operation Operation identifier
     * @returns Timeout in milliseconds or undefined
     */
    getOperationTimeout(operation: string): number | undefined;

    /**
     * Update timeout configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<TimeoutConfig>): void;

    /**
     * Get timeout statistics
     */
    getStats(): {
        totalOperations: number;
        timedOutOperations: number;
        averageOperationTime: number;
        timeoutRate: number;
        perOperationStats: Record<string, {
            calls: number;
            timeouts: number;
            averageTime: number;
        }>;
    };

    /**
     * Reset timeout statistics
     */
    resetStats(): void;

    /**
     * Health check for timeout manager
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Timeout manager factory interface
 */
export interface ITimeoutManagerFactory {
    /**
     * Create a new timeout manager instance
     * @param name Timeout manager name
     * @param config Timeout configuration
     * @returns New timeout manager instance
     */
    create(
        name: string,
        config?: Partial<TimeoutConfig>
    ): ITimeoutManager;

    /**
     * Get an existing timeout manager instance
     * @param name Timeout manager name
     */
    get(name: string): ITimeoutManager | undefined;

    /**
     * Get all timeout manager instances
     */
    getAll(): ITimeoutManager[];

    /**
     * Register a custom timeout manager
     * @param name Timeout manager name
     * @param manager Timeout manager instance or constructor
     */
    register(
        name: string,
        manager: ITimeoutManager | (new (config: TimeoutConfig) => ITimeoutManager)
    ): void;

    /**
     * Get available timeout manager names
     */
    getAvailableManagers(): string[];
}