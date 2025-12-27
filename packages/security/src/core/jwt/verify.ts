import { UnauthorizedError } from '@naman_deep_singh/errors'
import {
	type JwtPayload,
	type Secret,
	type VerifyOptions,
	verify,
} from 'jsonwebtoken'
import type { VerificationResult } from './types'

/**
 * Verify token (throws UnauthorizedError if invalid or expired)
 */
export const verifyToken = (
	token: string,
	secret: Secret,
): string | JwtPayload => {
	try {
		return verify(token, secret)
	} catch (error: any) {
		if (error.name === 'TokenExpiredError') {
			throw new UnauthorizedError({ reason: 'Token has expired' }, error)
		}
		if (error.name === 'JsonWebTokenError') {
			throw new UnauthorizedError({ reason: 'Invalid token' }, error)
		}
		throw new UnauthorizedError({ reason: 'Failed to verify token' }, error)
	}
}

/**
 * Verify token with options
 */
export const verifyTokenWithOptions = (
	token: string,
	secret: Secret,
	options: VerifyOptions = {},
): string | JwtPayload => {
	try {
		return verify(token, secret, options)
	} catch (error: any) {
		if (error.name === 'TokenExpiredError') {
			throw new UnauthorizedError({ reason: 'Token has expired' }, error)
		}
		if (error.name === 'JsonWebTokenError') {
			throw new UnauthorizedError({ reason: 'Invalid token' }, error)
		}
		throw new UnauthorizedError({ reason: 'Failed to verify token' }, error)
	}
}

/**
 * Safe verify — never throws, returns structured result with UnauthorizedError on failure
 */
export const safeVerifyToken = (
	token: string,
	secret: Secret,
): VerificationResult => {
	try {
		const decoded = verify(token, secret)
		return { valid: true, payload: decoded }
	} catch (error: any) {
		let wrappedError: UnauthorizedError

		if (error.name === 'TokenExpiredError') {
			wrappedError = new UnauthorizedError(
				{ reason: 'Token has expired' },
				error,
			)
		} else if (error.name === 'JsonWebTokenError') {
			wrappedError = new UnauthorizedError({ reason: 'Invalid token' }, error)
		} else {
			wrappedError = new UnauthorizedError(
				{ reason: 'Failed to verify token' },
				error,
			)
		}

		return { valid: false, error: wrappedError }
	}
}

/**
 * Safe verify with options — never throws, returns structured result with UnauthorizedError on failure
 */
export const safeVerifyTokenWithOptions = (
	token: string,
	secret: Secret,
	options: VerifyOptions = {},
): VerificationResult => {
	try {
		const decoded = verify(token, secret, options)
		return { valid: true, payload: decoded }
	} catch (error: any) {
		let wrappedError: UnauthorizedError

		if (error.name === 'TokenExpiredError') {
			wrappedError = new UnauthorizedError(
				{ reason: 'Token has expired' },
				error instanceof Error ? error : undefined,
			)
		} else if (error.name === 'JsonWebTokenError') {
			wrappedError = new UnauthorizedError(
				{
					reason: 'Invalid token',
				},
				error instanceof Error ? error : undefined,
			)
		} else {
			wrappedError = new UnauthorizedError(
				{ reason: 'Failed to verify token' },
				error instanceof Error ? error : undefined,
			)
		}

		return { valid: false, error: wrappedError }
	}
}
