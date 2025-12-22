import {
	TokenExpiredError,
	TokenMalformedError,
	UnauthorizedError,
} from '@naman_deep_singh/errors-utils'
import { extractToken, safeVerifyToken } from '@naman_deep_singh/security'

import type { NextFunction, Request, RequestHandler, Response } from 'express'

export interface AuthConfig {
	secret: string
	tokenExtractor?: (req: Request) => string | null
}

export function createAuthMiddleware(config: AuthConfig): RequestHandler {
	const {
		secret,
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
			// 1️⃣ Extract token
			const token = tokenExtractor(req)

			if (!token) {
				// No cause → client mistake
				return next(
					new TokenMalformedError({
						reason: 'No token provided',
					}),
				)
			}

			// 2️⃣ Verify token
			const result = safeVerifyToken(token, secret)

			if (!result.valid) {
				// Token expired
				if (result.error?.name === 'TokenExpiredError') {
					return next(
						new TokenExpiredError(
							{ reason: 'Token expired' },
							result.error, // ✅ cause
						),
					)
				}

				// Token invalid / malformed
				return next(
					new TokenMalformedError(
						{
							reason: 'Invalid token',
						},
						result.error, // ✅ cause
					),
				)
			}

			// 3️⃣ Attach payload
			req.user = result.payload
			next()
		} catch (error) {
			// Unexpected error → always pass cause
			return next(
				new UnauthorizedError(
					undefined,
					undefined,
					{ reason: 'Authentication failed' },
					error instanceof Error ? error : undefined,
				),
			)
		}
	}
}
