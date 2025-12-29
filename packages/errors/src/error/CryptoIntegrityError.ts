import { ERROR_CODES } from '../constants/errorCodes.js'
import { InternalServerError } from './InternalServerError.js'

export class CryptoIntegrityError extends InternalServerError {
	constructor(details?: unknown, cause?: Error) {
		super(ERROR_CODES.CRYPTO_INTEGRITY_ERROR, details, cause)
	}
}
