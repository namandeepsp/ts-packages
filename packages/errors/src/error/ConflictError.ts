import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { HTTPError } from './HTTPError.js'

export class ConflictError extends HTTPError {
	constructor(details?: unknown, cause?: Error) {
		super(
			ERROR_CODES.CONFLICT,
			HTTP_STATUS.CLIENT_ERROR.CONFLICT,
			details,
			cause,
		)
	}
}
