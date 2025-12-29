import type { ErrorCode } from '../constants/errorCodes.js'
import { AppError } from './AppError.js'

export class HTTPError extends AppError {
	public status: 'fail' | 'error'

	constructor(
		errorCode: ErrorCode,
		statusCode: number,
		details?: unknown,
		cause?: Error,
	) {
		super(errorCode, statusCode, details, cause)

		this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
	}
}
