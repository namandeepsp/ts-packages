import { CommunicationError } from "./CommunicationError.js";
import { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Load balancer error - when load balancing fails
 */
export class LoadBalancerError extends CommunicationError {
    constructor(
        code: CommunicationErrorCode = COMMUNICATION_ERROR_CODES.LOAD_BALANCER_ERROR,
        details?: unknown,
        cause?: Error
    ) {
        super(code, 503, details, cause);
        this.name = 'LoadBalancerError';
    }
}

export type LoadBalancerErrorType = LoadBalancerError;