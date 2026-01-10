/**
 * Abstract base circuit breaker implementation
 * @packageDocumentation
 */

import type { CommunicationErrorType } from '../errors/CommunicationError.js';
import type { ICircuitBreaker } from '../interfaces/CircuitBreaker.interface.js';
import type { CircuitBreakerConfig } from '../types/config.js';

/**
 * Abstract base circuit breaker implementation
 * Provides common functionality for all circuit breaker implementations
 */
export abstract class BaseCircuitBreaker implements ICircuitBreaker {

    /** Circuit breaker name */
    public readonly name: string;

    /** Current state */
    public state: 'closed' | 'open' | 'half-open' = 'closed';

    /** Circuit breaker configuration */
    public config: CircuitBreakerConfig;

    /** Failure count */
    public failureCount: number = 0;

    /** Success count */
    public successCount: number = 0;

    /** Last failure timestamp */
    public lastFailureTime?: number;

    /** Last success timestamp */
    public lastSuccessTime?: number;

    /** Time when circuit will attempt to reset */
    public nextResetTime?: number;

    /** Circuit breaker statistics */
    protected stats: {
        totalExecutions: number;
        totalSuccesses: number;
        totalFailures: number;
        successRate: number;
        failureRate: number;
        totalTimeOpen: number;
        totalTimeClosed: number;
        lastStateChange: number;
    } = {
            totalExecutions: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            successRate: 0,
            failureRate: 0,
            totalTimeOpen: 0,
            totalTimeClosed: 0,
            lastStateChange: Date.now(),
        };

    /** Time when current state was entered */
    protected stateEnteredTime: number = Date.now();

    /**
     * Create a new base circuit breaker instance
     * @param name Circuit breaker name
     * @param config Circuit breaker configuration
     */
    constructor(name: string, config: CircuitBreakerConfig) {
        this.name = name;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize circuit breaker
     */
    protected initialize(): void {
        // Can be overridden by subclasses
    }

    /**
     * Execute a function with circuit breaker protection
     * @param fn Function to execute
     * @returns Promise resolving to function result
     * @throws {CommunicationError} If circuit is open or function fails
     */
    public abstract execute<T>(fn: () => Promise<T>): Promise<T>;

    /**
     * Execute a function with circuit breaker protection and context
     * @param fn Function to execute
     * @param context Execution context
     * @returns Promise resolving to function result
     */
    public abstract executeWithContext<T, C = unknown>(
        fn: (context: C) => Promise<T>,
        context: C
    ): Promise<T>;

    /**
     * Check if circuit breaker should allow execution
     * @returns True if execution is allowed
     */
    protected shouldAllowExecution(): boolean {
        switch (this.state) {
            case 'closed':
                return true;

            case 'open':
                if (this.nextResetTime && Date.now() >= this.nextResetTime) {
                    this.transitionToHalfOpen();
                    return true;
                }
                return false;

            case 'half-open':
                return this.failureCount < (this.config.halfOpenMaxAttempts || 1);

            default:
                return false;
        }
    }

    /**
     * Transition circuit breaker to closed state
     */
    protected transitionToClosed(): void {
        const previousState = this.state;
        this.state = 'closed';
        this.failureCount = 0;
        this.successCount = 0;
        this.nextResetTime = undefined;
        this.updateStateTime(previousState);
        this.onStateChange('closed', previousState);
    }

    /**
     * Transition circuit breaker to open state
     * @param error Optional error that caused the transition
     */
    protected transitionToOpen(error?: CommunicationErrorType): void {
        const previousState = this.state;
        this.state = 'open';
        this.nextResetTime = Date.now() + (this.config.resetTimeout || 30000);
        this.updateStateTime(previousState);
        this.onStateChange('open', previousState, error);
    }

    /**
     * Transition circuit breaker to half-open state
     */
    protected transitionToHalfOpen(): void {
        const previousState = this.state;
        this.state = 'half-open';
        this.failureCount = 0;
        this.successCount = 0;
        this.updateStateTime(previousState);
        this.onStateChange('half-open', previousState);
    }

    /**
     * Update state timing statistics
     * @param previousState Previous state
     */
    protected updateStateTime(previousState: string): void {
        const now = Date.now();
        const timeInState = now - this.stateEnteredTime;

        if (previousState === 'open') {
            this.stats.totalTimeOpen += timeInState;
        } else if (previousState === 'closed') {
            this.stats.totalTimeClosed += timeInState;
        }

        this.stateEnteredTime = now;
        this.stats.lastStateChange = now;
    }

    /**
     * Hook for state changes
     * @param newState New state
     * @param previousState Previous state
     * @param error Optional error that caused state change
     */
    protected onStateChange(
        newState: string,
        previousState: string,
        error?: CommunicationErrorType
    ): void {
        // Can be overridden by subclasses
        // Emit events, log, etc.
    }

    /**
     * Check if failure threshold is reached
     * @returns True if failure threshold reached
     */
    protected isFailureThresholdReached(): boolean {
        return this.failureCount >= (this.config.failureThreshold || 5);
    }

    /**
     * Check if success threshold is reached
     * @returns True if success threshold reached
     */
    protected isSuccessThresholdReached(): boolean {
        return this.successCount >= (this.config.successThreshold || 1);
    }

    /**
     * Manually trip the circuit breaker to open state
     * @param error Error that caused the trip
     */
    public trip(error?: CommunicationErrorType): void {
        this.transitionToOpen(error);
    }

    /**
     * Manually reset the circuit breaker to closed state
     */
    public reset(): void {
        this.transitionToClosed();
    }

    /**
     * Check if circuit breaker is currently open
     */
    public isOpen(): boolean {
        return this.state === 'open';
    }

    /**
     * Check if circuit breaker is currently closed
     */
    public isClosed(): boolean {
        return this.state === 'closed';
    }

    /**
     * Check if circuit breaker is in half-open state
     */
    public isHalfOpen(): boolean {
        return this.state === 'half-open';
    }

    /**
     * Record a successful execution
     */
    public recordSuccess(): void {
        this.successCount++;
        this.lastSuccessTime = Date.now();
        this.stats.totalSuccesses++;

        if (this.state === 'half-open' && this.isSuccessThresholdReached()) {
            this.transitionToClosed();
        }
    }

    /**
     * Record a failed execution
     * @param error Error that occurred
     */
    public recordFailure(error: CommunicationErrorType): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        this.stats.totalFailures++;

        if (this.state === 'half-open') {
            this.transitionToOpen(error);
        } else if (this.state === 'closed' && this.isFailureThresholdReached()) {
            this.transitionToOpen(error);
        }
    }

    /**
     * Get circuit breaker statistics
     */
    public getStats(): {
        totalExecutions: number;
        totalSuccesses: number;
        totalFailures: number;
        successRate: number;
        failureRate: number;
        totalTimeOpen: number;
        totalTimeClosed: number;
        lastStateChange: number;
    } {
        const total = this.stats.totalSuccesses + this.stats.totalFailures;

        return {
            ...this.stats,
            successRate: total > 0 ? this.stats.totalSuccesses / total : 0,
            failureRate: total > 0 ? this.stats.totalFailures / total : 0,
        };
    }

    /**
     * Reset circuit breaker statistics
     */
    public resetStats(): void {
        this.stats = {
            totalExecutions: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            successRate: 0,
            failureRate: 0,
            totalTimeOpen: 0,
            totalTimeClosed: 0,
            lastStateChange: Date.now(),
        };
    }

    /**
     * Update circuit breaker configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<CircuitBreakerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Health check for the circuit breaker
     */
    public healthCheck(): {
        healthy: boolean;
        state: 'closed' | 'open' | 'half-open';
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = this.state === 'closed' || this.state === 'half-open';

        return {
            healthy,
            state: this.state,
            message: healthy ? 'Circuit breaker is operational' : 'Circuit breaker is open',
            details: {
                name: this.name,
                failureCount: this.failureCount,
                successCount: this.successCount,
                lastFailureTime: this.lastFailureTime,
                lastSuccessTime: this.lastSuccessTime,
                nextResetTime: this.nextResetTime,
                config: this.config,
            },
        };
    }
}