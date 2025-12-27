import { HTTP_STATUS } from '@naman_deep_singh/http-response'
import type { NextFunction, Request, Response } from 'express'
import { ERROR_CODES, type ErrorCode } from '../../constants'
import { AppError } from '../../error/AppError'

export function errorConverter(
	err: unknown,
	_req: Request,
	_res: Response,
	next: NextFunction,
) {
	// 1. Already a known AppError → pass through
	if (err instanceof AppError) {
		return next(err)
	}

	let code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR
	let statusCode: number = HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR
	let details: unknown = undefined
	let cause: Error | undefined = undefined

	// 2. Handle unknown objects safely
	if (typeof err === 'object' && err !== null) {
		const e = err as Record<string, unknown>

		if (typeof e.code === 'string' && e.code in ERROR_CODES) {
			code = e.code as ErrorCode
		}

		if (typeof e.statusCode === 'number') {
			statusCode = e.statusCode
		}

		if ('details' in e) {
			details = e.details
		}

		if (err instanceof Error) {
			cause = err
		}
	}

	// 3. Handle string errors
	if (typeof err === 'string') {
		details = err
	}

	// 4. Convert to AppError
	const convertedError = new AppError(code, statusCode, details, cause)

	next(convertedError)
}
