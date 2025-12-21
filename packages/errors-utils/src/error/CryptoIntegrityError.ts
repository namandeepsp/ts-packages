import { ERROR_CODES } from 'src/constants'
import { InternalServerError } from './InternalServerError'

export class CryptoIntegrityError extends InternalServerError {
	constructor(details?: unknown, cause?: Error) {
		super(ERROR_CODES.CRYPTO_INTEGRITY_ERROR, details, cause)
	}
}
