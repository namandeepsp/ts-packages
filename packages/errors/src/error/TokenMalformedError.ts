import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import { ERROR_CODES } from 'src/constants'
import { HTTPError } from './HTTPError'

export class TokenMalformedError extends HTTPError {
	constructor(details?: unknown, cause?: Error) {
		super(
			ERROR_CODES.TOKEN_INVALID,
			HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED,
			details,
			cause,
		)
	}
}
