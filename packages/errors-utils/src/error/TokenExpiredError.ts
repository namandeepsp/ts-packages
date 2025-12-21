import { HTTP_STATUS } from '@naman_deep_singh/response-utils'
import { ERROR_CODES } from 'src/constants'
import { UnauthorizedError } from './UnauthorizedError'

export class TokenExpiredError extends UnauthorizedError {
	constructor(details?: unknown, cause?: Error) {
		super(
			ERROR_CODES.TOKEN_EXPIRED,
			HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED,
			details,
			cause,
		)
	}
}
