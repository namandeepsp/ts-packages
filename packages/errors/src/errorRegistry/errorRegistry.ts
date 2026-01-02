import {
	type ExpressResponder,
	HTTP_STATUS,
} from '@naman_deep_singh/http-response'
import type { ErrorCode } from '../constants/errorCodes.js'
import { ERROR_MESSAGES } from '../constants/errorMessages.js'
import type { AppError } from '../error/AppError.js'

export class ErrorMessageRegistry {
	private static instance: ErrorMessageRegistry
	private readonly registry = new Map<ErrorCode | string, string>()

	private constructor() {
		// Initialize with default messages
		Object.entries(ERROR_MESSAGES).forEach(([code, message]) => {
			this.registry.set(code, message)
		})
	}

	/** Singleton accessor */
	public static getInstance(): ErrorMessageRegistry {
		if (!ErrorMessageRegistry.instance) {
			ErrorMessageRegistry.instance = new ErrorMessageRegistry()
		}
		return ErrorMessageRegistry.instance
	}

	/** Register or override messages */
	public register(messages: Record<string, string>): void {
		for (const [code, message] of Object.entries(messages)) {
			this.registry.set(code, message)
		}
	}

	/** Resolve a message for a given error code */
	public resolve(
		code: ErrorCode | string,
		defaultMessage = 'Unexpected error',
	): string {
		return this.registry.get(code) ?? defaultMessage
	}

	/**
	 * Map an AppError to an ExpressResponder
	 * Centralizes error-to-HTTP mapping
	 */
	public mapAppErrorToResponder(
		responder: ExpressResponder<unknown>,
		err: AppError,
	) {
		switch (err.statusCode) {
			case HTTP_STATUS.CLIENT_ERROR.BAD_REQUEST:
				return responder.badRequest(this.resolve(err.code), {
					details: err.details,
				})
			case HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED:
				return responder.unauthorized(this.resolve(err.code))
			case HTTP_STATUS.CLIENT_ERROR.FORBIDDEN:
				return responder.forbidden(this.resolve(err.code))
			case HTTP_STATUS.CLIENT_ERROR.NOT_FOUND:
				return responder.notFound(this.resolve(err.code))
			case HTTP_STATUS.CLIENT_ERROR.CONFLICT:
				return responder.conflict(this.resolve(err.code))
			case HTTP_STATUS.CLIENT_ERROR.UNPROCESSABLE_ENTITY:
				return responder.unprocessableEntity(this.resolve(err.code), {
					details: err.details,
				})
			case HTTP_STATUS.CLIENT_ERROR.TOO_MANY_REQUESTS:
				return responder.tooManyRequests(this.resolve(err.code))
			default:
				// Any other status maps to generic server error
				return responder.serverError(this.resolve(err.code), {
					details: err.details,
				})
		}
	}
}

/** Singleton export for easy access */
export const errorMessageRegistry = ErrorMessageRegistry.getInstance()
