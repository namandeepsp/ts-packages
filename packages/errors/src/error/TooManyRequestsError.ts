import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES, type ErrorCode } from 'src/constants'
import { HTTPError } from './HTTPError'

export class TooManyRequestsError extends HTTPError {
	constructor(
		errorCode: ErrorCode = ERROR_CODES.TOO_MANY_REQUESTS,
		details?: unknown,
		cause?: Error,
	) {
		super(errorCode, HTTP_STATUS.CLIENT_ERROR.TOO_MANY_REQUESTS, details, cause)
	}
}
