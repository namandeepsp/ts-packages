import { UnauthorizedError } from '@naman_deep_singh/errors-utils'
import { extractToken, safeVerifyToken } from '@naman_deep_singh/security'

import type {
	NextFunction,
	Request,
	RequestHandler,
	Response,
} from 'node_modules/@types/express'

// Authentication middleware helper
export interface AuthConfig {
	secret: string
	unauthorizedMessage?: string
	tokenExtractor?: (req: Request) => string | null
}

export function createAuthMiddleware(config: AuthConfig): RequestHandler {
	const {
		secret,
		unauthorizedMessage = 'Unauthorized access',

		tokenExtractor = (req) =>
			extractToken({
				header: req.headers.authorization || undefined,
				cookies: req.cookies,
				query: req.query as Record<string, any>,
				body: req.body,
			}),
	} = config

	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			// Extract token from request
			const token = tokenExtractor(req)

			if (!token) {
				const error = new UnauthorizedError(unauthorizedMessage, {
					reason: 'No token provided',
				})
				return next(error)
			}

			// Use safe verify token from security package
			const result = safeVerifyToken(token, secret)

			if (!result.valid) {
				const error = new UnauthorizedError(unauthorizedMessage, {
					reason: 'Invalid or expired token',
					originalError: result.error?.message,
				})
				return next(error)
			}

			// Attach the verified payload as user
			req.user = result.payload
			next()
		} catch (error) {
			const unauthorizedError = new UnauthorizedError(
				unauthorizedMessage,
				error instanceof Error ? { originalError: error.message } : error,
			)
			return next(unauthorizedError)
		}
	}
}
