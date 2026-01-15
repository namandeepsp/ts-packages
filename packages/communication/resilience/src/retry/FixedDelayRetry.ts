import { BaseRetryStrategy } from '@naman_deep_singh/communication-core';
import type { RetryPolicyConfig, RetryContext, RetryDecision } from '@naman_deep_singh/communication-core';

export interface FixedDelayConfig extends Partial<RetryPolicyConfig> {
    delayMs?: number;
}

const DEFAULTS: Required<FixedDelayConfig> = {
    enabled: true,
    maxAttempts: 3,
    delayMs: 200,
    backoffStrategy: 'fixed',
    backoff: {
        initialDelay: 200,
    },
    retryOnStatus: [],
    retryOnErrors: [],
    options: {},
} as any;

export class FixedDelayRetry extends BaseRetryStrategy {
    private cfg: Required<FixedDelayConfig>;

    constructor(name: string, config?: FixedDelayConfig) {
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

                const delay = decision.delay || this.cfg.delayMs;
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

                const delay = decision.delay || this.cfg.delayMs;
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}