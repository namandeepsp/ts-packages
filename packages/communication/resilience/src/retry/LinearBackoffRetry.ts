import { BaseRetryStrategy } from '@naman_deep_singh/communication-core';
import type { RetryPolicyConfig, RetryContext, RetryDecision } from '@naman_deep_singh/communication-core';

export interface LinearBackoffConfig extends Partial<RetryPolicyConfig> {
    initialDelayMs?: number;
    incrementMs?: number;
    maxDelayMs?: number;
}

const DEFAULTS: Required<LinearBackoffConfig> = {
    enabled: true,
    maxAttempts: 3,
    initialDelayMs: 100,
    incrementMs: 100,
    maxDelayMs: 1000,
    backoffStrategy: 'linear',
    backoff: {
        initialDelay: 100,
        multiplier: 100,
        maxDelay: 1000,
    },
    retryOnStatus: [],
    retryOnErrors: [],
    options: {},
} as any;

export class LinearBackoffRetry extends BaseRetryStrategy {
    private cfg: Required<LinearBackoffConfig>;

    constructor(name: string, config?: LinearBackoffConfig) {
        const mergedConfig = { ...DEFAULTS, ...config };
        super(name, mergedConfig as RetryPolicyConfig);
        this.cfg = mergedConfig;
    }

    async execute<T>(
        fn: () => Promise<T>,
        context?: Partial<RetryContext>
    ): Promise<T> {
        const retryContext = this.createRetryContext(context);
        let lastError: any;

        for (let attempt = 1; attempt <= retryContext.maxAttempts; attempt++) {
            try {
                const result = await fn();
                this.updateStats(true, attempt, retryContext.elapsedTime);
                return result;
            } catch (error) {
                lastError = error;
                const updatedContext = this.updateRetryContext(retryContext, error as any);

                if (attempt === retryContext.maxAttempts) {
                    this.updateStats(false, attempt, updatedContext.elapsedTime);
                    throw error;
                }

                const decision = this.shouldRetry(error as any, updatedContext);
                if (!decision.shouldRetry) {
                    this.updateStats(false, attempt, updatedContext.elapsedTime);
                    throw error;
                }

                const delay = decision.delay || this.computeDelay(attempt);
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    async executeWithDecision<T>(
        fn: () => Promise<T>,
        shouldRetry: (error: any, context: RetryContext) => RetryDecision,
        context?: Partial<RetryContext>
    ): Promise<T> {
        const retryContext = this.createRetryContext(context);
        let lastError: any;

        for (let attempt = 1; attempt <= retryContext.maxAttempts; attempt++) {
            try {
                const result = await fn();
                this.updateStats(true, attempt, retryContext.elapsedTime);
                return result;
            } catch (error) {
                lastError = error;
                const updatedContext = this.updateRetryContext(retryContext, error as any);

                if (attempt === retryContext.maxAttempts) {
                    this.updateStats(false, attempt, updatedContext.elapsedTime);
                    throw error;
                }

                const decision = shouldRetry(error as any, updatedContext);
                if (!decision.shouldRetry) {
                    this.updateStats(false, attempt, updatedContext.elapsedTime);
                    throw error;
                }

                const delay = decision.delay || this.computeDelay(attempt);
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    private computeDelay(attempt: number): number {
        const delay = this.cfg.initialDelayMs + (this.cfg.incrementMs * (attempt - 1));
        return Math.min(delay, this.cfg.maxDelayMs);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}