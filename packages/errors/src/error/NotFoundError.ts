import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES } from 'src/constants'
import { HTTPError } from './HTTPError'

export class NotFoundError extends HTTPError {
	constructor(details?: unknown, cause?: Error) {
		super(
			ERROR_CODES.NOT_FOUND,
			HTTP_STATUS.CLIENT_ERROR.NOT_FOUND,
			details,
			cause,
		)
	}
}
