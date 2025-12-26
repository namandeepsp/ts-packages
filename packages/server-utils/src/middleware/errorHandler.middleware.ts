import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from 'express'

import { AppError } from '@naman_deep_singh/errors-utils'

export function createErrorHandler(): ErrorRequestHandler {
	return (error: unknown, _req: Request, res: Response, next: NextFunction) => {
		if (res.headersSent) {
			return next(error)
		}

		// Use responder if available
		const responder = (res as any).responder?.() ?? null

		// Known application error
		if (error instanceof AppError) {
			if (responder) {
				return responder
					.status(error.statusCode)
					.error(error.code, error.details)
			}

			// Fallback (if responder middleware is not mounted)
			return res.status(error.statusCode).json({
				success: false,
				message: error.code,
				error: {
					message: error.code,
					details: error.details,
				},
				data: undefined,
				meta: null,
			})
		}

		// Unknown / unhandled error
		console.error('Unhandled error:', error)

		const status = 500
		const message = 'Internal Server Error'

		if (responder) {
			return responder.status(status).error(message)
		}

		// Final fallback
		return res.status(status).json({
			success: false,
			message,
			error: { message },
			data: undefined,
			meta: null,
		})
	}
}
