// Legacy metrics interface for backward compatibility
export interface CircuitBreakerMetrics {
    failures: number;
    successes: number;
    stateChanges: number;
    openedAt?: number | null;
}

export const createDefaultMetrics = (): CircuitBreakerMetrics => ({
    failures: 0,
    successes: 0,
    stateChanges: 0,
    openedAt: null
});