import { AppError, ERROR_CODES, type ErrorCode } from '@naman_deep_singh/errors'

/**
 * Compression error - when compression/decompression fails
 */
export class CompressionError extends AppError {
	constructor(
		message: string,
		public readonly algorithm?: string,
		details?: unknown,
		cause?: Error,
	) {
		super(
			ERROR_CODES.FILE_ERROR as ErrorCode,
			500,
			{
				message,
				algorithm,
				...(details ? { details } : {}),
			},
			cause,
		)
		this.name = 'CompressionError'
	}
}
