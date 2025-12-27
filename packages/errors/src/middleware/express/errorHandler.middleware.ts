import { ExpressResponder, HTTP_STATUS } from '@naman_deep_singh/http-response'
import type { NextFunction, Request, Response } from 'express'
import { errorMessageRegistry } from 'src/errorRegistry'
import { ERROR_CODES } from '../../constants'
import { AppError } from '../../error/AppError'

export function expressErrorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	const responder = new ExpressResponder({}, res)

	// 1. Known operational error
	if (err instanceof AppError) {
		return errorMessageRegistry.mapAppErrorToResponder(responder, err)
	}

	// 2. Log unexpected errors (never expose internals in prod)
	console.error('UNEXPECTED ERROR:', err)

	// 3. Normalize unknown error → AppError
	const internalError = new AppError(
		ERROR_CODES.INTERNAL_SERVER_ERROR,
		HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR,
		process.env.NODE_ENV === 'production' ? undefined : err,
		err instanceof Error ? err : undefined,
	)

	return errorMessageRegistry.mapAppErrorToResponder(responder, internalError)
}
