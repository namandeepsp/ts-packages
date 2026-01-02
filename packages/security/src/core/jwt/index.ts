export { decodeToken, decodeTokenStrict } from './decode.js'
export { extractToken, type TokenSources } from './extractToken.js'
export { generateTokens, rotateRefreshToken } from './generateTokens.js'
export { parseDuration } from './parseDuration.js'
export { signToken } from './signToken.js'
export {
	type AccessToken,
	type RefreshToken,
	type TokenPair,
	type VerificationResult,
	type TokenValidationOptions,
} from './types.js'
export {
	validateTokenPayload,
	isTokenExpired,
	type TokenRequirements,
} from './validateToken.js'
export {
	verifyToken,
	verifyTokenWithOptions,
	safeVerifyToken,
	safeVerifyTokenWithOptions,
} from './verify.js'
export { JWTManager } from './JWTManager.js'
