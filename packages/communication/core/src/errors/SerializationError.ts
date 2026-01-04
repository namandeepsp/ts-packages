import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Serialization error - when serialization/deserialization fails
 */
export class SerializationError extends CommunicationError {
    constructor(
        code: CommunicationErrorCode = COMMUNICATION_ERROR_CODES.SERIALIZATION_ERROR,
        details?: unknown,
        cause?: Error
    ) {
        super(code, 500, details, cause);
        this.name = 'SerializationError';
    }
}

export type SerializationErrorType = SerializationError;