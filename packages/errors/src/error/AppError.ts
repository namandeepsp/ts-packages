import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import type { ErrorCode } from '../constants/errorCodes.js'
import { errorMessageRegistry } from '../errorRegistry/index.js'

export class AppError extends Error {
	public statusCode: number
	public isOperational: boolean
	public code: ErrorCode
	public details?: unknown
	public cause?: Error

	constructor(
		code: ErrorCode,
		statusCode: number = HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR,
		details?: unknown,
		cause?: Error,
	) {
		super(errorMessageRegistry.resolve(code)) // message comes from mapping
		this.code = code
		this.statusCode = statusCode
		this.isOperational = true
		this.details = details

		if (cause) this.cause = cause
		Error.captureStackTrace(this, this.constructor)
	}

	toJSON() {
		return {
			success: false,
			code: this.code,
			message: this.message,
			details: this.details ?? null,
		}
	}
}
