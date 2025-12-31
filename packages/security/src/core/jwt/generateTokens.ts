import { TokenMalformedError } from '@naman_deep_singh/errors'
import type { JwtPayload, Secret } from 'jsonwebtoken'
import {
	type AccessToken,
	type RefreshToken,
	type TokenPair,
	signToken,
	verifyToken,
} from './index.js'

// Helper function to create branded tokens
/* const createBrandedToken = <T extends string>(token: string, _brand: T): T => {
	return token as T
} */

export const generateTokens = (
	payload: Record<string, unknown>,
	accessSecret: Secret,
	refreshSecret: Secret,
	accessExpiry: string | number = '15m',
	refreshExpiry: string | number = '7d',
): TokenPair => {
	const accessToken = signToken(payload, accessSecret, accessExpiry, {
		algorithm: 'HS256',
	})
	const refreshToken = signToken(payload, refreshSecret, refreshExpiry, {
		algorithm: 'HS256',
	})

	return {
		accessToken: accessToken as AccessToken,
		refreshToken: refreshToken as RefreshToken,
	}
}

export function rotateRefreshToken(
	oldToken: string,
	secret: Secret,
): RefreshToken {
	const decoded = verifyToken(oldToken, secret)

	if (typeof decoded === 'string') {
		throw new TokenMalformedError({
			reason: 'Invalid token payload — expected JWT payload object',
		})
	}

	const payload: JwtPayload = { ...decoded }

	delete payload.iat
	delete payload.exp

	const newToken = signToken(payload, secret, '7d')
	return newToken as RefreshToken
}
