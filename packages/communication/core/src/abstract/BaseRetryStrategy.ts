/**
 * Abstract base retry strategy implementation
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type {
    IRetryStrategy,
    RetryContext,
    RetryDecision,
} from '../interfaces/RetryStrategy.interface.js';
import type { RetryPolicyConfig } from '../types/config.js';

/**
 * Abstract base retry strategy implementation
 * Provides common functionality for all retry strategy implementations
 */
export abstract class BaseRetryStrategy implements IRetryStrategy {

    /** Strategy name */
    public readonly name: string;

    /** Strategy configuration */
    public config: RetryPolicyConfig;

    /** Total retry attempts made */
    public totalAttempts: number = 0;

    /** Successful retries */
    public successfulRetries: number = 0;

    /** Failed retries */
    public failedRetries: number = 0;

    /** Retry statistics */
    protected stats: {
        totalExecutions: number;
        totalAttempts: number;
        successfulRetries: number;
        failedRetries: number;
        successRate: number;
        averageAttempts: number;
        averageDelay: number;
        totalTimeSpent: number;
    } = {
            totalExecutions: 0,
            totalAttempts: 0,
            successfulRetries: 0,
            failedRetries: 0,
            successRate: 0,
            averageAttempts: 0,
            averageDelay: 0,
            totalTimeSpent: 0,
        };

    /**
     * Create a new base retry strategy instance
     * @param name Strategy name
     * @param config Strategy configuration
     */
    constructor(name: string, config: RetryPolicyConfig) {
        this.name = name;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize retry strategy
     */
    protected initialize(): void {
        // Can be overridden by subclasses
    }

    /**
     * Execute a function with retry logic
     * @param fn Function to execute
     * @param context Initial retry context
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If all retry attempts fail
     */
    public abstract execute<T>(
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
    public abstract executeWithDecision<T>(
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
    public shouldRetry(
        error: CommunicationError,
        context: RetryContext
    ): RetryDecision {
        // Check max attempts
        if (context.attempt >= context.maxAttempts) {
            return {
                shouldRetry: false,
                reason: 'Max attempts reached',
            };
        }

        // Check retry on status codes (for HTTP errors)
        if (error.statusCode && this.config.retryOnStatus?.includes(error.statusCode)) {
            return {
                shouldRetry: true,
                delay: this.calculateDelay(context.attempt, context),
                reason: `Status code ${error.statusCode} is retryable`,
            };
        }

        // Check retry on error types
        if (this.config.retryOnErrors?.includes(error.code)) {
            return {
                shouldRetry: true,
                delay: this.calculateDelay(context.attempt, context),
                reason: `Error code ${error.code} is retryable`,
            };
        }

        // Check if error is retryable based on type
        if (this.isRetryableError(error)) {
            return {
                shouldRetry: true,
                delay: this.calculateDelay(context.attempt, context),
                reason: 'Error is retryable',
            };
        }

        return {
            shouldRetry: false,
            reason: 'Error is not retryable',
        };
    }

    /**
     * Check if an error is retryable
     * @param error Error to check
     * @returns True if error is retryable
     */
    protected isRetryableError(error: CommunicationError): boolean {
        // Default implementation: retry on network errors, timeouts, and 5xx errors
        const networkErrors = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
        const timeoutErrors = ['TIMEOUT', 'TIMEOUT_EXCEEDED'];

        return (
            networkErrors.some(code => error.code?.includes(code)) ||
            timeoutErrors.some(code => error.code?.includes(code)) ||
            (error?.statusCode >= 500 && error?.statusCode < 600)
        );
    }

    /**
     * Calculate delay for next retry attempt
     * @param attempt Current attempt number
     * @param context Current retry context
     * @returns Delay in milliseconds
     */
    public calculateDelay(
        attempt: number,
        context: RetryContext
    ): number {
        const backoff = this.config?.backoff || {};
        const strategy = this.config.backoffStrategy || 'exponential';

        switch (strategy) {
            case 'fixed':
                return backoff.initialDelay || 1000;

            case 'exponential':
                const baseDelay = backoff.initialDelay || 100;
                const multiplier = backoff.multiplier || 2;
                return Math.min(
                    baseDelay * Math.pow(multiplier, attempt - 1),
                    backoff.maxDelay || 30000
                );

            case 'linear':
                const linearDelay = backoff.initialDelay || 100;
                const increment = backoff.multiplier || 1000;
                return Math.min(
                    linearDelay + (increment * (attempt - 1)),
                    backoff.maxDelay || 30000
                );

            case 'jitter':
                const jitterDelay = backoff.initialDelay || 100;
                const jitterMultiplier = backoff.multiplier || 2;
                const base = jitterDelay * Math.pow(jitterMultiplier, attempt - 1);
                const jitter = backoff.jitter || 0.3;
                const jitterValue = base * jitter * Math.random();
                return Math.min(
                    base + jitterValue,
                    backoff.maxDelay || 30000
                );

            case 'fibonacci':
                const fibDelay = backoff.initialDelay || 100;
                let a = 0, b = 1;
                for (let i = 0; i < attempt; i++) {
                    [a, b] = [b, a + b];
                }
                return Math.min(
                    fibDelay * a,
                    backoff.maxDelay || 30000
                );

            default:
                // Custom strategy or fallback
                if (backoff.custom) {
                    return backoff.custom(attempt);
                }
                return backoff.initialDelay || 1000;
        }
    }

    /**
     * Create retry context
     * @param initialContext Initial context values
     * @returns Complete retry context
     */
    protected createRetryContext(
        initialContext?: Partial<RetryContext>
    ): RetryContext {
        const defaultContext: RetryContext = {
            attempt: 1,
            maxAttempts: this.config.maxAttempts || 3,
            lastError: undefined,
            startTime: Date.now(),
            elapsedTime: 0,
            data: new Map(),
            isRetry: false,
        };

        return {
            ...defaultContext,
            ...initialContext,
        };
    }

    /**
     * Update retry context after attempt
     * @param context Current context
     * @param error Error from attempt (if any)
     * @returns Updated context
     */
    protected updateRetryContext(
        context: RetryContext,
        error?: CommunicationError
    ): RetryContext {
        return {
            ...context,
            attempt: context.attempt + 1,
            lastError: error,
            elapsedTime: Date.now() - context.startTime,
            isRetry: context.attempt > 1,
        };
    }

    /**
     * Update retry statistics
     * @param success Whether retry was successful
     * @param attempts Number of attempts
     * @param totalDelay Total delay time
     */
    protected updateStats(success: boolean, attempts: number, totalDelay: number): void {
        this.totalAttempts += attempts;
        this.stats.totalExecutions++;
        this.stats.totalAttempts += attempts;
        this.stats.totalTimeSpent += totalDelay;

        if (success) {
            this.successfulRetries++;
            this.stats.successfulRetries++;
        } else {
            this.failedRetries++;
            this.stats.failedRetries++;
        }

        // Update calculated stats
        const totalExecutions = this.stats.totalExecutions;
        const totalAttempts = this.stats.totalAttempts;

        this.stats.successRate = totalExecutions > 0 ?
            this.stats.successfulRetries / totalExecutions : 0;
        this.stats.averageAttempts = totalExecutions > 0 ?
            totalAttempts / totalExecutions : 0;
        this.stats.averageDelay = totalAttempts > 0 ?
            this.stats.totalTimeSpent / totalAttempts : 0;
    }

    /**
     * Update retry strategy configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<RetryPolicyConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get retry strategy statistics
     */
    public getStats(): {
        totalExecutions: number;
        totalAttempts: number;
        successfulRetries: number;
        failedRetries: number;
        successRate: number;
        averageAttempts: number;
        averageDelay: number;
        totalTimeSpent: number;
    } {
        return { ...this.stats };
    }

    /**
     * Reset retry strategy statistics
     */
    public resetStats(): void {
        this.totalAttempts = 0;
        this.successfulRetries = 0;
        this.failedRetries = 0;
        this.stats = {
            totalExecutions: 0,
            totalAttempts: 0,
            successfulRetries: 0,
            failedRetries: 0,
            successRate: 0,
            averageAttempts: 0,
            averageDelay: 0,
            totalTimeSpent: 0,
        };
    }

    /**
     * Health check for the retry strategy
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = true; // Retry strategy is always healthy

        return {
            healthy,
            message: 'Retry strategy is operational',
            details: {
                name: this.name,
                config: this.config,
                statistics: this.getStats(),
            },
        };
    }
}