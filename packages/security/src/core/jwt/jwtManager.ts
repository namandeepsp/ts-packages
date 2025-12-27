import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken'

import type {
	AccessToken,
	ITokenManager,
	JWTConfig,
	RefreshToken,
	TokenPair,
} from '../../interfaces/jwt.interface'
import { signToken } from './signToken'
import { safeVerifyToken } from './verify'

import {
	BadRequestError,
	UnauthorizedError,
	ValidationError,
} from '@naman_deep_singh/errors'
import { LRUCache } from '@naman_deep_singh/utils'

export class JWTManager implements ITokenManager {
	private accessSecret: Secret
	private refreshSecret: Secret
	private accessExpiry: string | number
	private refreshExpiry: string | number
	private cache?: LRUCache<
		string,
		{ valid: boolean; payload: JwtPayload; timestamp: number }
	>
	private cacheTTL: number

	constructor(config: JWTConfig) {
		this.accessSecret = config.accessSecret
		this.refreshSecret = config.refreshSecret
		this.accessExpiry = config.accessExpiry || '15m'
		this.refreshExpiry = config.refreshExpiry || '7d'
		this.cacheTTL = 5 * 60 * 1000 // 5 minutes

		if (config.enableCaching) {
			this.cache = new LRUCache(config.maxCacheSize || 100)
		}
	}

	/** Generate both access and refresh tokens */
	async generateTokens(payload: Record<string, unknown>): Promise<TokenPair> {
		try {
			this.validatePayload(payload)

			const accessToken = await this.generateAccessToken(payload)
			const refreshToken = await this.generateRefreshToken(payload)

			return { accessToken, refreshToken }
		} catch (error) {
			if (error instanceof BadRequestError || error instanceof ValidationError)
				throw error
			throw new BadRequestError(
				{ reason: 'Failed to generate tokens' },
				error instanceof Error ? error : undefined,
			)
		}
	}

	/** Generate access token */
	async generateAccessToken(
		payload: Record<string, unknown>,
	): Promise<AccessToken> {
		try {
			this.validatePayload(payload)
			const token = signToken(payload, this.accessSecret, this.accessExpiry, {
				algorithm: 'HS256',
			})
			return token as unknown as AccessToken
		} catch (error) {
			if (error instanceof BadRequestError || error instanceof ValidationError)
				throw error
			throw new BadRequestError(
				{ reason: 'Failed to generate access token' },
				error instanceof Error ? error : undefined,
			)
		}
	}

	/** Generate refresh token */
	async generateRefreshToken(
		payload: Record<string, unknown>,
	): Promise<RefreshToken> {
		try {
			this.validatePayload(payload)
			const token = signToken(payload, this.refreshSecret, this.refreshExpiry, {
				algorithm: 'HS256',
			})
			return token as unknown as RefreshToken
		} catch (error) {
			if (error instanceof BadRequestError || error instanceof ValidationError)
				throw error
			throw new BadRequestError(
				{ reason: 'Failed to generate refresh token' },
				error instanceof Error ? error : undefined,
			)
		}
	}

	/** Verify access token */
	async verifyAccessToken(token: string): Promise<JwtPayload> {
		return this.verifyTokenWithCache(token, this.accessSecret, 'access')
	}

	/** Verify refresh token */
	async verifyRefreshToken(token: string): Promise<JwtPayload> {
		return this.verifyTokenWithCache(token, this.refreshSecret, 'refresh')
	}

	/** Decode token without verification */
	decodeToken(token: string, complete = false): JwtPayload | string | null {
		if (!token || typeof token !== 'string') return null
		return jwt.decode(token, { complete }) as JwtPayload | string | null
	}

	/** Extract token from Authorization header */
	extractTokenFromHeader(authHeader: string): string | null {
		if (!authHeader || typeof authHeader !== 'string') return null
		const parts = authHeader.split(' ')
		if (parts.length !== 2 || parts[0] !== 'Bearer') return null
		return parts[1]
	}

	/** Validate token without throwing exceptions */
	validateToken(token: string, secret: Secret): boolean {
		if (!token || typeof token !== 'string') return false
		return safeVerifyToken(token, secret).valid
	}

	/** Rotate refresh token */
	async rotateRefreshToken(oldToken: string): Promise<RefreshToken> {
		if (!oldToken || typeof oldToken !== 'string') {
			throw new ValidationError({
				reason: 'Old refresh token must be a non-empty string',
			})
		}

		const decoded = await this.verifyRefreshToken(oldToken)
		const payload: JwtPayload = { ...decoded }
		delete payload.iat
		delete payload.exp

		const newToken = signToken(payload, this.refreshSecret, this.refreshExpiry)
		return newToken as unknown as RefreshToken
	}

	/** Check if token is expired */
	isTokenExpired(token: string): boolean {
		try {
			const decoded = this.decodeToken(token) as JwtPayload | null
			if (!decoded || !decoded.exp) return true
			return decoded.exp < Math.floor(Date.now() / 1000)
		} catch {
			return true
		}
	}

	/** Get token expiration date */
	getTokenExpiration(token: string): Date | null {
		try {
			const decoded = this.decodeToken(token) as JwtPayload | null
			if (!decoded || !decoded.exp) return null
			return new Date(decoded.exp * 1000)
		} catch {
			return null
		}
	}

	/** Clear token cache */
	clearCache(): void {
		this.cache?.clear()
	}

	/** Get cache statistics */
	getCacheStats(): { size: number; maxSize: number } | null {
		if (!this.cache) return null
		return { size: -1, maxSize: (this.cache as any).maxSize }
	}

	/** Private helper methods */
	private validatePayload(payload: Record<string, unknown>): void {
		if (!payload || typeof payload !== 'object') {
			throw new ValidationError({
				reason: 'Payload must be a non-null object',
			})
		}
		if (Object.keys(payload).length === 0) {
			throw new ValidationError({ reason: 'Payload cannot be empty' })
		}
	}

	private async verifyTokenWithCache(
		token: string,
		secret: Secret,
		type: 'access' | 'refresh',
	): Promise<JwtPayload> {
		if (!token || typeof token !== 'string') {
			throw new ValidationError({
				reason: `${type} token must be a non-empty string`,
			})
		}

		const cacheKey = `${type}_${token}`
		if (this.cache) {
			const cached = this.cache.get(cacheKey)
			if (cached && Date.now() - cached.timestamp <= this.cacheTTL) {
				if (!cached.valid)
					throw new UnauthorizedError({
						reason: `${type} token is invalid or expired`,
					})
				return cached.payload
			}
		}

		const { valid, payload, error } = safeVerifyToken(token, secret)
		if (!valid || !payload || typeof payload === 'string') {
			this.cache?.set(cacheKey, {
				valid: false,
				payload: {} as JwtPayload,
				timestamp: Date.now(),
			})
			throw new UnauthorizedError({
				reason: `${type} token is invalid or expired`,
				cause: error,
			})
		}

		this.cache?.set(cacheKey, { valid: true, payload, timestamp: Date.now() })
		return payload
	}
}
