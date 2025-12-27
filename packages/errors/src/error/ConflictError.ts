import { HTTP_STATUS } from '@naman_deep_singh/response-utils'
import { ERROR_CODES } from 'src/constants'
import { HTTPError } from './HTTPError'

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
