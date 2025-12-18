import type { JwtPayload, Secret } from 'jsonwebtoken'

export interface AccessToken extends String {
	readonly __type: 'AccessToken'
}

export interface RefreshToken extends String {
	readonly __type: 'RefreshToken'
}

export interface TokenPair {
	accessToken: AccessToken
	refreshToken: RefreshToken
}

export interface JWTConfig {
	accessSecret: Secret
	refreshSecret: Secret
	accessExpiry?: string | number
	refreshExpiry?: string | number
	enableCaching?: boolean
	maxCacheSize?: number
}

export interface TokenValidationOptions {
	ignoreExpiration?: boolean
	ignoreNotBefore?: boolean
	audience?: string | string[]
	issuer?: string
	algorithms?: string[]
}

export interface TokenGenerationOptions {
	algorithm?: string
	expiresIn?: string | number
	audience?: string | string[]
	issuer?: string
	subject?: string
	kid?: string
}

export interface ITokenManager {
	generateTokens(payload: Record<string, unknown>): Promise<TokenPair>
	generateAccessToken(payload: Record<string, unknown>): Promise<AccessToken>
	generateRefreshToken(payload: Record<string, unknown>): Promise<RefreshToken>
	verifyAccessToken(token: string): Promise<JwtPayload | string>
	verifyRefreshToken(token: string): Promise<JwtPayload | string>
	decodeToken(token: string, complete?: boolean): JwtPayload | string | null
	extractTokenFromHeader(authHeader: string): string | null
	validateToken(
		token: string,
		secret: Secret,
		options?: TokenValidationOptions,
	): boolean
	rotateRefreshToken(oldToken: string): Promise<RefreshToken>
	isTokenExpired(token: string): boolean
	getTokenExpiration(token: string): Date | null
}
