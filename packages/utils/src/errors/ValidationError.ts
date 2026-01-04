import { AppError, ERROR_CODES, type ErrorCode } from '@naman_deep_singh/errors'

/**
 * Validation error - when utility input validation fails
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public readonly field?: string,
		public readonly value?: unknown,
		details?: unknown,
		cause?: Error,
	) {
		super(
			ERROR_CODES.VALIDATION_FAILED as ErrorCode,
			400, // 400 = Bad Request
			{
				message,
				field,
				value,
				...(details ? { details } : {}),
			},
			cause,
		)
		this.name = 'ValidationError'
	}
}
