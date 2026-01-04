/**
 * Utility-specific error classes
 * @packageDocumentation
 */

import { AppError, ERROR_CODES, type ErrorCode } from '@naman_deep_singh/errors'

/**
 * Timeout error - when operation times out
 */
export class TimeoutError extends AppError {
	constructor(
		message: string = 'Operation timed out',
		public readonly timeoutMs: number,
		details?: unknown,
		cause?: Error,
	) {
		super(
			ERROR_CODES.TIMEOUT_ERROR as ErrorCode,
			408, // 408 = Request Timeout
			{
				message,
				timeoutMs,
				...(details ? { details } : {}),
			},
			cause,
		)
		this.name = 'TimeoutError'
	}
}
