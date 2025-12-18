import type jwt from 'jsonwebtoken'
import { type JwtPayload, type Secret, verify } from 'jsonwebtoken'
import type { VerificationResult } from './types'

/**
 * Verify token (throws if invalid or expired)
 */
export const verifyToken = (
	token: string,
	secret: Secret,
): string | JwtPayload => {
	return verify(token, secret)
}

/**
 * Safe verify — never throws, returns structured result
 */
export const safeVerifyToken = (
	token: string,
	secret: Secret,
): VerificationResult => {
	try {
		const decoded = verify(token, secret)
		return { valid: true, payload: decoded }
	} catch (error) {
		return { valid: false, error: error as Error }
	}
}

/**
 * Verify token with validation options
 */
export const verifyTokenWithOptions = (
	token: string,
	secret: Secret,
	options: jwt.VerifyOptions = {},
): string | JwtPayload => {
	return verify(token, secret, options)
}

/**
 * Safe verify with validation options
 */
export const safeVerifyTokenWithOptions = (
	token: string,
	secret: Secret,
	options: jwt.VerifyOptions = {},
): VerificationResult => {
	try {
		const decoded = verify(token, secret, options)
		return { valid: true, payload: decoded }
	} catch (error) {
		return { valid: false, error: error as Error }
	}
}
