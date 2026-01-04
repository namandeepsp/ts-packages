import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES } from "./communicationErrorCodes.js";

/**
 * Circuit breaker error - when circuit is open
 */
export class CircuitBreakerError extends CommunicationError {
    constructor(
        details?: unknown,
        cause?: Error
    ) {
        super(
            COMMUNICATION_ERROR_CODES.CIRCUIT_BREAKER_OPEN,
            503, // Service Unavailable
            details,
            cause
        );
        this.name = 'CircuitBreakerError';
    }
}

export type CircuitBreakerErrorType = CircuitBreakerError;