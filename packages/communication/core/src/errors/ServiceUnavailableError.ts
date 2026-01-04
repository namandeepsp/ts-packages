import {
    ServiceUnavailableError as BaseServiceUnavailableError,
} from '@naman_deep_singh/errors';

/**
 * Service unavailable error for communication layer
 * Extends the existing ServiceUnavailableError
 */
export class ServiceUnavailableError extends BaseServiceUnavailableError {
    constructor(
        details?: { service: string; reason?: string },
        cause?: Error
    ) {
        super(details, cause);
        this.name = 'ServiceUnavailableError';
    }
}

export type ServiceUnavailableErrorType = ServiceUnavailableError;