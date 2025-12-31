import { BadRequestError, ValidationError } from '@naman_deep_singh/errors'
import type { PasswordStrengthOptions } from './types.js'

export const isPasswordStrong = (
	password: string,
	options: PasswordStrengthOptions = {},
): boolean => {
	if (!password)
		throw new BadRequestError({ reason: 'Invalid password provided' })

	const {
		minLength = 8,
		requireUppercase = true,
		requireLowercase = true,
		requireNumbers = true,
		requireSymbols = false,
	} = options

	if (password.length < minLength)
		throw new ValidationError({
			reason: `Password must be at least ${minLength} characters long`,
		})
	if (requireUppercase && !/[A-Z]/.test(password))
		throw new ValidationError({
			reason: 'Password must include uppercase letters',
		})
	if (requireLowercase && !/[a-z]/.test(password))
		throw new ValidationError({
			reason: 'Password must include lowercase letters',
		})
	if (requireNumbers && !/[0-9]/.test(password))
		throw new ValidationError({ reason: 'Password must include numbers' })
	if (requireSymbols && !/[^A-Za-z0-9]/.test(password))
		throw new ValidationError({ reason: 'Password must include symbols' })

	return true
}
