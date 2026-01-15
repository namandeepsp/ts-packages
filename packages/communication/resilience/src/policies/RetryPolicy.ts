import type { RetryPolicyConfig, IRetryStrategy } from '@naman_deep_singh/communication-core';
import { FixedDelayRetry, ExponentialBackoffRetry, JitterRetry, LinearBackoffRetry } from '../retry/index.js';

export interface IRetryPolicyConfig {
    strategy?: 'fixed' | 'exponential' | 'jitter' | 'linear';
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
}

export class RetryPolicy {
    constructor(public config: IRetryPolicyConfig) { }

    createStrategy(name: string): IRetryStrategy {
        const strategy = this.config.strategy || 'fixed';

        switch (strategy) {
            case 'fixed':
                return new FixedDelayRetry(name, {
                    maxAttempts: this.config.maxAttempts,
                    delayMs: this.config.baseDelayMs,
                });

            case 'exponential':
                return new ExponentialBackoffRetry(name, {
                    maxAttempts: this.config.maxAttempts,
                    baseDelayMs: this.config.baseDelayMs,
                    maxDelayMs: this.config.maxDelayMs,
                    jitter: false,
                });

            case 'jitter':
                return new JitterRetry(name, {
                    maxAttempts: this.config.maxAttempts,
                    baseDelayMs: this.config.baseDelayMs,
                    maxDelayMs: this.config.maxDelayMs,
                });

            case 'linear':
                return new LinearBackoffRetry(name, {
                    maxAttempts: this.config.maxAttempts,
                    initialDelayMs: this.config.baseDelayMs,
                    maxDelayMs: this.config.maxDelayMs,
                });

            default:
                return new FixedDelayRetry(name, {
                    maxAttempts: this.config.maxAttempts,
                    delayMs: this.config.baseDelayMs,
                });
        }
    }
}