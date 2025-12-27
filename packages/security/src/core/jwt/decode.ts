import { BadRequestError } from '@naman_deep_singh/errors'
// src/jwt/decodeToken.ts
import { type JwtPayload, decode } from 'jsonwebtoken'

/**
 * Flexible decode
 * Returns: null | string | JwtPayload
 * Mirrors jsonwebtoken.decode()
 */
export function decodeToken(token: string): null | string | JwtPayload {
	return decode(token)
}

/**
 * Strict decode
 * Always returns JwtPayload or throws error
 */
export function decodeTokenStrict(token: string): JwtPayload {
	const decoded = decode(token)

	if (!decoded || typeof decoded === 'string') {
		throw new BadRequestError({
			reason: 'Invalid JWT payload structure',
		})
	}

	return decoded
}
