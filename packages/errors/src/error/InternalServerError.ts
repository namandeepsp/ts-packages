import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES, type ErrorCode } from 'src/constants'
import { HTTPError } from './HTTPError'

export class InternalServerError extends HTTPError {
	constructor(
		errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
		details?: unknown,
		cause?: Error,
	) {
		super(
			errorCode,
			HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR,
			details,
			cause,
		)
	}
}
