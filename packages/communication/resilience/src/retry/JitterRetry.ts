import { ExponentialBackoffRetry } from './ExponentialBackoffRetry.js';
import type { ExponentialBackoffConfig } from './ExponentialBackoffRetry.js';

export interface JitterRetryConfig extends ExponentialBackoffConfig {
    // Inherits all ExponentialBackoffConfig properties
}

export class JitterRetry extends ExponentialBackoffRetry {
    constructor(name: string, config?: JitterRetryConfig) {
        super(name, { ...(config || {}), jitter: true });
    }
}