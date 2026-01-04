import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Service discovery error
 */
export class DiscoveryError extends CommunicationError {
    constructor(
        code: CommunicationErrorCode = COMMUNICATION_ERROR_CODES.DISCOVERY_ERROR,
        details?: unknown,
        cause?: Error
    ) {
        super(code, 503, details, cause); // 503 Service Unavailable
        this.name = 'DiscoveryError';
    }
}

export type DiscoveryErrorType = DiscoveryError;