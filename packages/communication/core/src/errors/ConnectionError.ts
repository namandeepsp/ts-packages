import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Connection error - when connection fails
 */
export class ConnectionError extends CommunicationError {
    constructor(
        code: CommunicationErrorCode = COMMUNICATION_ERROR_CODES.CONNECTION_ERROR,
        details?: unknown,
        cause?: Error
    ) {
        super(code, 503, details, cause);
        this.name = 'ConnectionError';
    }
}

export type ConnectionErrorType = ConnectionError