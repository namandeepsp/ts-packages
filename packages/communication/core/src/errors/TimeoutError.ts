import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES } from "./communicationErrorCodes.js";

/**
 * Timeout error - when operation times out
 */
export class TimeoutError extends CommunicationError {
    constructor(
        details?: { timeout: number; operation: string },
        cause?: Error
    ) {
        super(
            COMMUNICATION_ERROR_CODES.TIMEOUT_EXHAUSTED,
            504, // Gateway Timeout
            details,
            cause
        );
        this.name = 'TimeoutError';
    }
}

export type TimeoutErrorType = TimeoutError;