import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES } from '../constants'
import { HTTPError } from './HTTPError'

export class BadRequestError extends HTTPError {
	constructor(details?: unknown, cause?: Error) {
		super(
			ERROR_CODES.BAD_REQUEST,
			HTTP_STATUS.CLIENT_ERROR.BAD_REQUEST,
			details,
			cause,
		)
	}
}
