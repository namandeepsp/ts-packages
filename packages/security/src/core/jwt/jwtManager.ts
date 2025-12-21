import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken'

import type {
	AccessToken,
	ITokenManager,
	JWTConfig,
	RefreshToken,
	TokenPair,
	TokenValidationOptions,
} from '../../interfaces/jwt.interface'
import { signToken } from './signToken'
import { safeVerifyToken, verifyToken } from './verify'

import {
	BadRequestError,
	UnauthorizedError,
	ValidationError,
} from '@naman_deep_singh/errors-utils'
import { LRUCache } from '@naman_deep_singh/js-extensions'

export class JWTManager implements ITokenManager {
	private accessSecret: Secret
	private refreshSecret: Secret
	private accessExpiry: string | number
	private refreshExpiry: string | number
	private cache?: LRUCache<
		string,
		{ valid: boolean; payload: JwtPayload | string; timestamp: number }
	>
	private cacheTTL: number

	constructor(config: JWTConfig) {
		this.accessSecret = config.accessSecret
		this.refreshSecret = config.refreshSecret
		this.accessExpiry = config.accessExpiry || '15m'
		this.refreshExpiry = config.refreshExpiry || '7d'
		this.cacheTTL = 5 * 60 * 1000 // 5 minutes default TTL

		if (config.enableCaching) {
			this.cache = new LRUCache(config.maxCacheSize || 100)
		}
	}

	/**
	 * Generate both access and refresh tokens
	 */
	async generateTokens(payload: Record<string, unknown>): Promise<TokenPair> {
		try {
			this.validatePayload(payload)

			const accessToken = await this.generateAccessToken(payload)
			const refreshToken = await this.generateRefreshToken(payload)

			return {
				accessToken,
				refreshToken,
			}
		} catch (error) {
			if (
				error instanceof BadRequestError ||
				error instanceof ValidationError
			) {
				throw error
			}
			throw new BadRequestError('Failed to generate tokens')
		}
	}

	/**
	 * Generate access token
	 */
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
			if (
				error instanceof BadRequestError ||
				error instanceof ValidationError
			) {
				throw error
			}
			throw new BadRequestError('Failed to generate access token')
		}
	}

	/**
	 * Generate refresh token
	 */
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
			if (
				error instanceof BadRequestError ||
				error instanceof ValidationError
			) {
				throw error
			}
			throw new BadRequestError('Failed to generate refresh token')
		}
	}

	/**
	 * Verify access token
	 */
	async verifyAccessToken(token: string): Promise<JwtPayload | string> {
		try {
			if (!token || typeof token !== 'string') {
				throw new ValidationError('Access token must be a non-empty string')
			}

			const cacheKey = `access_${token}`
			if (this.cache) {
				const cached = this.cache.get(cacheKey)
				if (cached && Date.now() - cached.timestamp <= this.cacheTTL) {
					if (!cached.valid) {
						throw new UnauthorizedError('Access token is invalid or expired')
					}
					return cached.payload
				}
			}

			const decoded = verifyToken(token, this.accessSecret)

			if (this.cache) {
				this.cache.set(cacheKey, {
					valid: true,
					payload: decoded,
					timestamp: Date.now(),
				})
			}

			return decoded
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof UnauthorizedError
			) {
				throw error
			}

			if (error instanceof Error && error.name === 'TokenExpiredError') {
				throw new UnauthorizedError('Access token has expired')
			}

			if (error instanceof Error && error.name === 'JsonWebTokenError') {
				throw new UnauthorizedError('Access token is invalid')
			}

			throw new UnauthorizedError('Failed to verify access token')
		}
	}

	/**
	 * Verify refresh token
	 */
	async verifyRefreshToken(token: string): Promise<JwtPayload | string> {
		try {
			if (!token || typeof token !== 'string') {
				throw new ValidationError('Refresh token must be a non-empty string')
			}

			const cacheKey = `refresh_${token}`
			if (this.cache) {
				const cached = this.cache.get(cacheKey)
				if (cached) {
					if (!cached.valid) {
						throw new UnauthorizedError('Refresh token is invalid or expired')
					}
					return cached.payload
				}
			}

			const decoded = verifyToken(token, this.refreshSecret)

			if (this.cache) {
				this.cache.set(cacheKey, {
					valid: true,
					payload: decoded,
					timestamp: Date.now(),
				})
			}

			return decoded
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof UnauthorizedError
			) {
				throw error
			}

			if (error instanceof Error && error.name === 'TokenExpiredError') {
				throw new UnauthorizedError('Refresh token has expired')
			}

			if (error instanceof Error && error.name === 'JsonWebTokenError') {
				throw new UnauthorizedError('Refresh token is invalid')
			}

			throw new UnauthorizedError('Failed to verify refresh token')
		}
	}

	/**
	 * Decode token without verification
	 */
	decodeToken(token: string, complete = false): JwtPayload | string | null {
		try {
			if (!token || typeof token !== 'string') {
				throw new ValidationError('Token must be a non-empty string')
			}

			return jwt.decode(token, { complete }) as JwtPayload | string | null
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error
			}
			return null
		}
	}

	/**
	 * Extract token from Authorization header
	 */
	extractTokenFromHeader(authHeader: string): string | null {
		try {
			if (!authHeader || typeof authHeader !== 'string') {
				return null
			}

			const parts = authHeader.split(' ')
			if (parts.length !== 2 || parts[0] !== 'Bearer') {
				return null
			}

			return parts[1]
		} catch {
			return null
		}
	}

	/**
	 * Validate token without throwing exceptions
	 */
	validateToken(
		token: string,
		secret: Secret,
		_options: TokenValidationOptions = {},
	): boolean {
		try {
			if (!token || typeof token !== 'string') {
				return false
			}

			const result = safeVerifyToken(token, secret)
			return result.valid
		} catch {
			return false
		}
	}

	/**
	 * Rotate refresh token
	 */
	async rotateRefreshToken(oldToken: string): Promise<RefreshToken> {
		try {
			if (!oldToken || typeof oldToken !== 'string') {
				throw new ValidationError(
					'Old refresh token must be a non-empty string',
				)
			}

			const decoded = await this.verifyRefreshToken(oldToken)

			if (typeof decoded === 'string') {
				throw new ValidationError(
					'Invalid token payload — expected JWT payload object',
				)
			}

			// Create new payload without issued/expired timestamps
			const payload: JwtPayload = { ...decoded }
			delete payload.iat
			delete payload.exp

			// Generate new refresh token
			const newToken = signToken(
				payload,
				this.refreshSecret,
				this.refreshExpiry,
			)

			return newToken as unknown as RefreshToken
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof UnauthorizedError
			) {
				throw error
			}
			throw new BadRequestError('Failed to rotate refresh token')
		}
	}

	/**
	 * Check if token is expired
	 */
	isTokenExpired(token: string): boolean {
		try {
			const decoded = this.decodeToken(token) as JwtPayload | null
			if (!decoded || !decoded.exp) {
				return true
			}

			const currentTime = Math.floor(Date.now() / 1000)
			return decoded.exp < currentTime
		} catch {
			return true
		}
	}

	/**
	 * Get token expiration date
	 */
	getTokenExpiration(token: string): Date | null {
		try {
			const decoded = this.decodeToken(token) as JwtPayload | null
			if (!decoded || !decoded.exp) {
				return null
			}

			return new Date(decoded.exp * 1000)
		} catch {
			return null
		}
	}

	/**
	 * Clear token cache
	 */
	clearCache(): void {
		this.cache?.clear()
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; maxSize: number } | null {
		if (!this.cache) return null

		// Note: LRUCache doesn't expose internal size, so we return maxSize only
		return {
			size: -1, // Size not available from LRUCache
			maxSize: (this.cache as any).maxSize,
		}
	}

	// Private helper methods
	private validatePayload(payload: Record<string, unknown>): void {
		if (!payload || typeof payload !== 'object') {
			throw new ValidationError('Payload must be a non-null object')
		}

		if (Object.keys(payload).length === 0) {
			throw new ValidationError('Payload cannot be empty')
		}
	}
}
