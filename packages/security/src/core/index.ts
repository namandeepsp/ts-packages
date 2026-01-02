// Re-export everything from crypto module
export {
	CryptoManager,
	encrypt,
	decrypt,
	hmacSign,
	hmacVerify,
	randomToken,
	generateStrongPassword,
} from './crypto/index.js'

// Re-export everything from jwt module
export {
	decodeToken,
	decodeTokenStrict,
	extractToken,
	generateTokens,
	rotateRefreshToken,
	parseDuration,
	signToken,
	validateTokenPayload,
	isTokenExpired,
	verifyToken,
	verifyTokenWithOptions,
	safeVerifyToken,
	safeVerifyTokenWithOptions,
	JWTManager,
	type TokenSources,
	type AccessToken,
	type RefreshToken,
	type TokenPair,
	type VerificationResult,
	type TokenValidationOptions,
	type TokenRequirements,
} from './jwt/index.js'

// Re-export everything from password module
export {
	hashPassword,
	hashPasswordWithPepper,
	hashPasswordSync,
	hashPasswordWithPepperSync,
	isPasswordStrong,
	verifyPassword,
	verifyPasswordWithPepper,
	verifyPasswordSync,
	verifyPasswordWithPepperSync,
	PasswordManager,
	type PasswordStrengthOptions,
	ensureValidPassword,
	safeCompare,
	estimatePasswordEntropy,
	normalizePassword,
} from './password/index.js'
