import { AppError, ERROR_CODES, type ErrorCode } from '@naman_deep_singh/errors'

/**
 * Pool error - when pool operations fail
 */
export class PoolError extends AppError {
	constructor(
		message: string,
		public readonly poolName?: string,
		details?: unknown,
		cause?: Error,
	) {
		super(
			ERROR_CODES.RESOURCE_EXHAUSTED as ErrorCode,
			503, // 503 = Service Unavailable
			{
				message,
				poolName,
				...(details ? { details } : {}),
			},
			cause,
		)
		this.name = 'PoolError'
	}
}
