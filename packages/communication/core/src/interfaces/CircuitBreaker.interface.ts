/**
 * Circuit breaker interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { CircuitBreakerConfig, CircuitBreakerState } from '../types/config.js';
import type { CircuitBreakerEvent } from '../types/events.js';


/**
 * Circuit breaker interface for resilience pattern
 * Prevents cascading failures by stopping requests when failures exceed threshold
 */
export interface ICircuitBreaker {
    /** Circuit breaker name */
    readonly name: string;

    /** Current state */
    readonly state: CircuitBreakerState;

    /** Circuit breaker configuration */
    readonly config: CircuitBreakerConfig;

    /** Failure count */
    readonly failureCount: number;

    /** Success count */
    readonly successCount: number;

    /** Last failure timestamp */
    readonly lastFailureTime?: number;

    /** Last success timestamp */
    readonly lastSuccessTime?: number;

    /** Time when circuit will attempt to reset */
    readonly nextResetTime?: number;

    /**
     * Execute a function with circuit breaker protection
     * @param fn Function to execute
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If circuit is open or function fails
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;

    /**
     * Execute a function with circuit breaker protection and context
     * @param fn Function to execute
     * @param context Execution context
     * @returns Promise resolving to function result
     */
    executeWithContext<T, C = unknown>(
        fn: (context: C) => Promise<T>,
        context: C
    ): Promise<T>;

    /**
     * Manually trip the circuit breaker to open state
     * @param error Error that caused the trip
     */
    trip(error?: CommunicationError): void;

    /**
     * Manually reset the circuit breaker to closed state
     */
    reset(): void;

    /**
     * Check if circuit breaker is currently open
     */
    isOpen(): boolean;

    /**
     * Check if circuit breaker is currently closed
     */
    isClosed(): boolean;

    /**
     * Check if circuit breaker is in half-open state
     */
    isHalfOpen(): boolean;

    /**
     * Record a successful execution
     */
    recordSuccess(): void;

    /**
     * Record a failed execution
     * @param error Error that occurred
     */
    recordFailure(error: CommunicationError): void;

    /**
     * Get circuit breaker statistics
     */
    getStats(): {
        totalExecutions: number;
        totalSuccesses: number;
        totalFailures: number;
        successRate: number;
        failureRate: number;
        totalTimeOpen: number;
        totalTimeClosed: number;
        lastStateChange: number;
    };

    /**
     * Reset circuit breaker statistics
     */
    resetStats(): void;

    /**
     * Update circuit breaker configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<CircuitBreakerConfig>): void;

    /**
     * Health check for the circuit breaker
     */
    healthCheck(): {
        healthy: boolean;
        state: CircuitBreakerState;
        message?: string;
        details?: Record<string, unknown>;
    };

    /**
     * Event emitter for circuit breaker events
     */
    readonly events?: {
        /**
         * Subscribe to circuit breaker events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        on(event: string | string[], listener: (event: CircuitBreakerEvent) => void): void;

        /**
         * Unsubscribe from circuit breaker events
         * @param event Event name or array of events
         * @param listener Event listener
         */
        off(event: string | string[], listener: (event: CircuitBreakerEvent) => void): void;
    };
}

/**
 * Circuit breaker factory interface
 */
export interface ICircuitBreakerFactory {
    /**
     * Create a new circuit breaker instance
     * @param name Circuit breaker name
     * @param config Circuit breaker configuration
     * @returns New circuit breaker instance
     */
    create(
        name: string,
        config?: Partial<CircuitBreakerConfig>
    ): ICircuitBreaker;

    /**
     * Get an existing circuit breaker instance
     * @param name Circuit breaker name
     */
    get(name: string): ICircuitBreaker | undefined;

    /**
     * Get all circuit breaker instances
     */
    getAll(): ICircuitBreaker[];

    /**
     * Reset all circuit breaker instances
     */
    resetAll(): void;

    /**
     * Close all circuit breaker instances
     */
    closeAll(): Promise<void>;
}