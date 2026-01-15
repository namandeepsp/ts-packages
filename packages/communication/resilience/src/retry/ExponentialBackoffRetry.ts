import { BaseRetryStrategy } from '@naman_deep_singh/communication-core';
import type { RetryPolicyConfig, RetryContext, RetryDecision } from '@naman_deep_singh/communication-core';

export interface ExponentialBackoffConfig extends Partial<RetryPolicyConfig> {
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
}

const DEFAULTS: Required<ExponentialBackoffConfig> = {
    enabled: true,
    maxAttempts: 4,
    baseDelayMs: 100,
    maxDelayMs: 2000,
    jitter: true,
    backoffStrategy: 'exponential',
    backoff: {
        initialDelay: 100,
        maxDelay: 2000,
        multiplier: 2,
        jitter: 0.3,
    },
    retryOnStatus: [],
    retryOnErrors: [],
    options: {},
} as any;

export class ExponentialBackoffRetry extends BaseRetryStrategy {
    private cfg: Required<ExponentialBackoffConfig>;

    constructor(name: string, config?: ExponentialBackoffConfig) {
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
        const raw = Math.min(this.cfg.maxDelayMs, this.cfg.baseDelayMs * 2 ** (attempt - 1));
        if (!this.cfg.jitter) return raw;
        const jitter = Math.floor(Math.random() * raw * 0.5);
        return Math.floor(raw / 2 + jitter);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}