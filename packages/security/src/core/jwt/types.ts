import type { JwtPayload } from 'jsonwebtoken'

// Branded types to prevent token mixing
export interface AccessTokenBrand {
	readonly access: unique symbol
}
export interface RefreshTokenBrand {
	readonly refresh: unique symbol
}

export type AccessToken = string & AccessTokenBrand
export type RefreshToken = string & RefreshTokenBrand

export interface TokenPair {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

// Enhanced verification result types
export interface VerificationResult<T = JwtPayload> {
	valid: boolean
	payload?: T | string
	error?: Error
}

export interface TokenValidationOptions {
	ignoreExpiration?: boolean
	ignoreIssuedAt?: boolean
}
