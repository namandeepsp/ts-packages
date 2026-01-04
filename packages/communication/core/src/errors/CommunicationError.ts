import { AppError, type ErrorCode } from "@naman_deep_singh/errors";
import { type CommunicationErrorCode } from "./communicationErrorCodes.js";

/**
 * Base communication error class
 * Extends AppError from errors package
 */
export class CommunicationError extends AppError {
    constructor(
        code: CommunicationErrorCode,
        statusCode: number = 500,
        details?: unknown,
        cause?: Error
    ) {
        super(code as ErrorCode, statusCode, details, cause);
        this.name = 'CommunicationError';
    }
}

export type CommunicationErrorType = CommunicationError;