/**
 * Retry strategy interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { RetryPolicyConfig } from '../types/config.js';
import type { RetryEvent } from '../types/events.js';

/**
 * Retry decision result
 */
export interface RetryDecision {
    /** Whether to retry */
    shouldRetry: boolean;

    /** Delay before next retry in milliseconds */
    delay?: number;

    /** Reason for decision */
    reason?: string;
}

/**
 * Retry context for each attempt
 */
export interface RetryContext {
    /** Current attempt number (starting from 1) */
    attempt: number;

    /** Maximum allowed attempts */
    maxAttempts: number;

    /** Last error that occurred */
    lastError?: CommunicationError;

    /** Start time of first attempt */
    startTime: number;

    /** Total elapsed time in milliseconds */
    elapsedTime: number;

    /** ✅ ADD THIS: Is this a retry attempt? */
    isRetry: boolean;

    /** Custom context data */
    data?: Map<string, unknown>;
}

/**
 * Retry strategy interface for handling retry logic
 */
export interface IRetryStrategy {
    /** Strategy name */
    readonly name: string;

    /** Strategy configuration */
    readonly config: RetryPolicyConfig;

    /** Total retry attempts made */
    readonly totalAttempts: number;

    /** Successful retries */
    readonly successfulRetries: number;

    /** Failed retries */
    readonly failedRetries: number;

    /**
     * Execute a function with retry logic
     * @param fn Function to execute
     * @param context Initial retry context
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If all retry attempts fail
     */
    execute<T>(
        fn: () => Promise<T>,
        context?: Partial<RetryContext>
    ): Promise<T>;

    /**
     * Execute a function with retry logic and custom decision function
     * @param fn Function to execute
     * @param shouldRetry Custom retry decision function
     * @param context Initial retry context
     * @returns Promise resolving to function result
     */
    executeWithDecision<T>(
        fn: () => Promise<T>,
        shouldRetry: (error: CommunicationError, context: RetryContext) => RetryDecision,
        context?: Partial<RetryContext>
    ): Promise<T>;

    /**
     * Determine if a retry should be attempted
     * @param error Error that occurred
     * @param context Current retry context
     * @returns Retry decision
     */
    shouldRetry(
        error: CommunicationError,
        context: RetryContext
    ): RetryDecision;

    /**
     * Calculate delay for next retry attempt
     * @param attempt Current attempt number
     * @param context Current retry context
     * @returns Delay in milliseconds
     */
    calculateDelay(
        attempt: number,
        context: RetryContext
    ): number;

    /**
     * Update retry strategy configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<RetryPolicyConfig>): void;

    /**
     * Get retry strategy statistics
     */
    getStats(): {
        totalExecutions: number;
        totalAttempts: number;
        successfulRetries: number;
        failedRetries: number;
        successRate: number;
        averageAttempts: number;
        averageDelay: number;
        totalTimeSpent: number;
    };

    /**
     * Reset retry strategy statistics
     */
    resetStats(): void;

    /**
     * Health check for the retry strategy
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };

    /**
     * Event emitter for retry events
     */
    readonly events?: {
        /**
         * Subscribe to retry events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        on(event: string | string[], listener: (event: RetryEvent) => void): void;

        /**
         * Unsubscribe from retry events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        off(event: string | string[], listener: (event: RetryEvent) => void): void;
    };
}

/**
 * Retry strategy factory interface
 */
export interface IRetryStrategyFactory {
    /**
     * Create a new retry strategy instance
     * @param name Strategy name
     * @param config Strategy configuration
     * @returns New retry strategy instance
     */
    create(
        name: string,
        config?: Partial<RetryPolicyConfig>
    ): IRetryStrategy;

    /**
     * Get an existing retry strategy instance
     * @param name Strategy name
     */
    get(name: string): IRetryStrategy | undefined;

    /**
     * Get all retry strategy instances
     */
    getAll(): IRetryStrategy[];

    /**
     * Register a custom retry strategy
     * @param name Strategy name
     * @param strategy Strategy instance or constructor
     */
    register(name: string, strategy: IRetryStrategy | (new (config: RetryPolicyConfig) => IRetryStrategy)): void;

    /**
     * Get available retry strategy names
     */
    getAvailableStrategies(): string[];
}