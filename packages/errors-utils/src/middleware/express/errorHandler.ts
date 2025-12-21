import { ExpressResponder } from '@naman_deep_singh/response-utils'
import type { NextFunction, Request, Response } from 'express'
import { ERROR_CODES } from '../../constants'
import { AppError } from '../../error/AppError'
import { mapAppErrorToResponder } from '../../utils/mapAppErrorToResponder'

export function expressErrorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	const responder = new ExpressResponder({}, res)

	// 1. Known operational error
	if (err instanceof AppError) {
		return mapAppErrorToResponder(responder, err)
	}

	// 2. Log unexpected errors (never expose internals in prod)
	console.error('UNEXPECTED ERROR:', err)

	// 3. Normalize unknown error → AppError
	const internalError = new AppError(
		ERROR_CODES.INTERNAL_SERVER_ERROR,
		500,
		process.env.NODE_ENV === 'production' ? undefined : err,
		err instanceof Error ? err : undefined,
	)

	return mapAppErrorToResponder(responder, internalError)
}
