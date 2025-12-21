import { HTTP_STATUS } from '@naman_deep_singh/response-utils'
import { ERROR_CODES, type ErrorCode } from 'src/constants'
import { HTTPError } from './HTTPError'

export class UnauthorizedError extends HTTPError {
	constructor(
		errorCodes: ErrorCode = ERROR_CODES.UNAUTHORIZED,
		status: number = HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED,
		details?: unknown,
		cause?: Error,
	) {
		super(errorCodes, status, details, cause)
	}
}
