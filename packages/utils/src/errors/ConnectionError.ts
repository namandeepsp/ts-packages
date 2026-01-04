/**
 * Connection error - when connection fails
 * @packageDocumentation
 */

import { AppError, ERROR_CODES, type ErrorCode } from '@naman_deep_singh/errors'

export class ConnectionError extends AppError {
	constructor(
		message: string,
		public readonly endpoint?: string,
		details?: unknown,
		cause?: Error,
	) {
		super(
			ERROR_CODES.DEPENDENCY_FAILURE as ErrorCode,
			502, // 502 = Bad Gateway
			{
				message,
				endpoint,
				...(details ? { details } : {}),
			},
			cause,
		)
		this.name = 'ConnectionError'
	}
}
