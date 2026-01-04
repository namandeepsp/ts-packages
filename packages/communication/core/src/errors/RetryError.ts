import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES } from "./communicationErrorCodes.js";

/**
 * Retry exhausted error - when all retry attempts fail
 */
export class RetryError extends CommunicationError {
    constructor(
        details?: { attempts: number; lastError?: Error },
        cause?: Error
    ) {
        super(
            COMMUNICATION_ERROR_CODES.RETRY_EXHAUSTED,
            503, // Service Unavailable
            details,
            cause
        );
        this.name = 'RetryError';
    }
}

export type RetryErrorType = RetryError;