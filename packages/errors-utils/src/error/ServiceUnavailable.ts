import { ERROR_CODES } from 'src/constants'
import { InternalServerError } from './InternalServerError'

export class ServiceUnavailableError extends InternalServerError {
	constructor(details?: unknown, cause?: Error) {
		super(ERROR_CODES.SERVICE_UNAVAILABLE, details, cause)
	}
}
