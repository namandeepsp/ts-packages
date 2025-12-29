import { ERROR_CODES } from '../constants/errorCodes.js'
import { InternalServerError } from './InternalServerError.js'

export class ServiceUnavailableError extends InternalServerError {
	constructor(details?: unknown, cause?: Error) {
		super(ERROR_CODES.SERVICE_UNAVAILABLE, details, cause)
	}
}
