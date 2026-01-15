import { EventEmitter } from 'events';
import { BaseCircuitBreaker } from '@naman_deep_singh/communication-core';
import type { CircuitBreakerConfig, CommunicationError } from '@naman_deep_singh/communication-core';

export class CircuitBreakerImpl extends BaseCircuitBreaker {
    private eventEmitter = new EventEmitter();

    constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
        const defaultConfig: CircuitBreakerConfig = {
            failureThreshold: 5,
            resetTimeout: 60_000,
            successThreshold: 2,
            halfOpenMaxAttempts: 1,
            ...config,
        };
        super(name, defaultConfig);
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (!this.shouldAllowExecution()) {
            this.eventEmitter.emit('reject', { reason: 'circuit-open', name: this.name });
            throw Object.assign(new Error('Circuit is open'), { code: 'ECIRCUITOPEN' });
        }

        this.stats.totalExecutions++;

        try {
            const result = await fn();
            this.recordSuccess();
            this.eventEmitter.emit('success', { name: this.name });
            return result;
        } catch (error) {
            this.recordFailure(error as CommunicationError);
            this.eventEmitter.emit('failure', { name: this.name, failures: this.failureCount, error });
            throw error;
        }
    }

    async executeWithContext<T, C = unknown>(
        fn: (context: C) => Promise<T>,
        context: C
    ): Promise<T> {
        if (!this.shouldAllowExecution()) {
            this.eventEmitter.emit('reject', { reason: 'circuit-open', name: this.name });
            throw Object.assign(new Error('Circuit is open'), { code: 'ECIRCUITOPEN' });
        }

        this.stats.totalExecutions++;

        try {
            const result = await fn(context);
            this.recordSuccess();
            this.eventEmitter.emit('success', { name: this.name });
            return result;
        } catch (error) {
            this.recordFailure(error as CommunicationError);
            this.eventEmitter.emit('failure', { name: this.name, failures: this.failureCount, error });
            throw error;
        }
    }

    // Override base class methods to emit events
    protected onStateChange(
        newState: string,
        previousState: string,
        error?: any
    ): void {
        super.onStateChange(newState, previousState, error);

        if (newState === 'open') {
            this.eventEmitter.emit('open', { name: this.name, at: Date.now() });
        } else if (newState === 'closed') {
            this.eventEmitter.emit('close', { name: this.name, at: Date.now() });
        }
        this.eventEmitter.emit('state', { name: this.name, state: newState, previousState });
    }

    // Legacy methods for backward compatibility
    getState() {
        return this.state.toUpperCase();
    }

    forceOpen() {
        this.trip();
    }

    forceClose() {
        this.reset();
    }

    getMetrics() {
        const stats = this.getStats();
        return {
            failures: stats.totalFailures,
            successes: stats.totalSuccesses,
            stateChanges: 0, // Not tracked in base class
            openedAt: this.state === 'open' ? this.stateEnteredTime : null,
        };
    }
}