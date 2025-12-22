import type { JwtPayload } from 'jsonwebtoken'
import { ValidationError } from '@naman_deep_singh/errors-utils'

export interface TokenRequirements {
	requiredFields?: string[]
	forbiddenFields?: string[]
	validateTypes?: Record<string, 'string' | 'number' | 'boolean'>
}

/**
 * Validates a JWT payload according to the provided rules.
 * Throws ValidationError if validation fails.
 */
export function validateTokenPayload(
	payload: Record<string, unknown>,
	rules: TokenRequirements = { requiredFields: ['exp', 'iat'] },
): void {
	const { requiredFields = [], forbiddenFields = [], validateTypes = {} } = rules

	// 1. Required fields
	for (const field of requiredFields) {
		if (!(field in payload)) {
			throw new ValidationError(`Missing required field: ${field}`)
		}
	}

	// 2. Forbidden fields
	for (const field of forbiddenFields) {
		if (field in payload) {
			throw new ValidationError(`Forbidden field in token: ${field}`)
		}
	}

	// 3. Type validation
	for (const key in validateTypes) {
		const expectedType = validateTypes[key]
		if (key in payload && typeof payload[key] !== expectedType) {
			throw new ValidationError(
				`Invalid type for ${key}. Expected ${expectedType}, got ${typeof payload[key]}`
			)
		}
	}
}

/**
 * Checks if a JWT payload is expired.
 * Returns true if expired or missing 'exp'.
 */
export function isTokenExpired(payload: JwtPayload): boolean {
	if (!payload.exp) return true
	return Date.now() >= payload.exp * 1000
}
