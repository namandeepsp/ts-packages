import { ERROR_CODES } from 'src/constants'
import { TooManyRequestsError } from './TooManyRequestsError'

export class RateLimitError extends TooManyRequestsError {
	constructor(details?: unknown, cause?: Error) {
		super(ERROR_CODES.RATE_LIMIT_EXCEEDED, details, cause)
	}
}
