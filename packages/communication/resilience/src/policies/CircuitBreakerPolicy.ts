import type { CircuitBreakerConfig } from '@naman_deep_singh/communication-core';
import { CircuitBreakerImpl } from '../circuit-breaker/index.js';
import type { ICircuitBreaker } from '@naman_deep_singh/communication-core';

export class CircuitBreakerPolicy {
    constructor(public config: CircuitBreakerConfig) { }

    createCircuitBreaker(name: string): ICircuitBreaker {
        return new CircuitBreakerImpl(name, this.config);
    }
}