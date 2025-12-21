import type { ErrorCode } from './errorCodes'

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	BAD_REQUEST: 'Bad request',
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden',
	NOT_FOUND: 'Resource not found',
	CONFLICT: 'Conflict occurred',
	VALIDATION_FAILED: 'Validation failed',
	RATE_LIMIT_EXCEEDED: 'Too many requests',

	INTERNAL_SERVER_ERROR: 'Internal server error',

	CRYPTO_INTEGRITY_ERROR: 'Crypto integrity error',

	TOO_MANY_REQUESTS: 'Too many requests',

	TOKEN_EXPIRED: 'Token expired',
	TOKEN_INVALID: 'Invalid token',
	TOKEN_NOT_PROVIDED: 'Token not provided',
	TOKEN_NOT_FOUND: 'Token not found',
	TOKEN_NOT_CREATED: 'Token not created',
	TOKEN_NOT_UPDATED: 'Token not updated',
	TOKEN_NOT_DELETED: 'Token not deleted',
	TOKEN_NOT_VALIDATED: 'Token not validated',
	TOKEN_NOT_REFRESHED: 'Token not refreshed',
	TOKEN_NOT_REVOKED: 'Token not revoked',
	TOKEN_NOT_BLACKLISTED: 'Token not blacklisted',
	TOKEN_NOT_WHITELISTED: 'Token not whitelisted',
	TOKEN_NOT_DECODED: 'Token not decoded',
	TOKEN_NOT_ENCODED: 'Token not encoded',
	TOKEN_NOT_SIGNED: 'Token not signed',
	TOKEN_NOT_VERIFIED: 'Token not verified',
	TOKEN_NOT_DECRYPTED: 'Token not decrypted',
	TOKEN_NOT_ENCRYPTED: 'Token not encrypted',
	TOKEN_NOT_GENERATED: 'Token not generated',
}
