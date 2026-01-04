import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Protocol error - when protocol communication fails
 */
export class ProtocolError extends CommunicationError {
    constructor(
        code: CommunicationErrorCode = COMMUNICATION_ERROR_CODES.PROTOCOL_ERROR,
        details?: unknown,
        cause?: Error
    ) {
        super(code, 502, details, cause); // 502 Bad Gateway
        this.name = 'ProtocolError';
    }
}

export type ProtocolErrorType = ProtocolError;