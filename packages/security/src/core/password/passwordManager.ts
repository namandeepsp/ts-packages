import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import type {
	HashedPassword,
	IPasswordManager,
	PasswordConfig,
	PasswordStrength,
	PasswordValidationResult,
} from '../../interfaces/password.interface'

import {
	BadRequestError,
	ValidationError,
} from '@naman_deep_singh/errors-utils'
import { ensureValidPassword, estimatePasswordEntropy } from './utils'

export class PasswordManager implements IPasswordManager {
	private defaultConfig: PasswordConfig

	constructor(config: PasswordConfig = {}) {
		this.defaultConfig = {
			saltRounds: 10,
			minLength: 8,
			maxLength: 128,
			requireUppercase: true,
			requireLowercase: true,
			requireNumbers: true,
			requireSpecialChars: false,
			...config,
		}
	}

	/**
	 * Hash a password asynchronously using bcrypt
	 */
	async hash(password: string, salt?: string): Promise<HashedPassword> {
		try {
			ensureValidPassword(password)

			// Validate password meets basic requirements
			this.validate(password)

			const saltRounds = this.defaultConfig.saltRounds!
			let passwordSalt = salt

			if (!passwordSalt) {
				passwordSalt = await bcrypt.genSalt(saltRounds)
			}

			const hash = await bcrypt.hash(password, passwordSalt)

			return {
				hash,
				salt: passwordSalt,
			}
		} catch (error) {
			if (
				error instanceof BadRequestError ||
				error instanceof ValidationError
			) {
				throw error
			}
			throw new BadRequestError('Failed to hash password')
		}
	}

	/**
	 * Verify password against hash and salt
	 */
	async verify(password: string, hash: string, salt: string): Promise<boolean> {
		try {
			if (!password || !hash || !salt) {
				return false
			}

			// First verify with the provided salt
			const isValid = await bcrypt.compare(password, hash)

			// If invalid and different salt was used, try regenerating hash with new salt
			if (!isValid && salt !== this.defaultConfig.saltRounds?.toString()) {
				const newHash = await bcrypt.hash(password, salt)
				return newHash === hash
			}

			return isValid
		} catch (_error) {
			return false
		}
	}

	/**
	 * Generate a random password
	 */
	generate(length = 16, options: PasswordConfig = {}): string {
		const config = { ...this.defaultConfig, ...options }

		if (length < config.minLength! || length > config.maxLength!) {
			throw new ValidationError(
				`Password length must be between ${config.minLength} and ${config.maxLength}`,
			)
		}

		let charset = 'abcdefghijklmnopqrstuvwxyz'

		if (config.requireUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		if (config.requireNumbers) charset += '0123456789'
		if (config.requireSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

		let password = ''
		const randomBytes = crypto.randomBytes(length)

		for (let i = 0; i < length; i++) {
			password += charset[randomBytes[i] % charset.length]
		}

		// Ensure all requirements are met
		if (config.requireUppercase && !/[A-Z]/.test(password)) {
			password = password.replace(/[a-z]/, 'A')
		}
		if (config.requireLowercase && !/[a-z]/.test(password)) {
			password = password.replace(/[A-Z]/, 'a')
		}
		if (config.requireNumbers && !/[0-9]/.test(password)) {
			password = password.replace(/[A-Za-z]/, '0')
		}
		if (config.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
			password = password.replace(/[A-Za-z0-9]/, '!')
		}

		return password
	}

	/**
	 * Validate password against configuration
	 */
	validate(
		password: string,
		config: PasswordConfig = {},
	): PasswordValidationResult {
		const finalConfig = { ...this.defaultConfig, ...config }
		const errors: string[] = []

		// Basic validation
		if (!password || typeof password !== 'string') {
			errors.push('Password must be a non-empty string')
		}

		// Length validation
		if (password.length < finalConfig.minLength!) {
			errors.push(
				`Password must be at least ${finalConfig.minLength} characters long`,
			)
		}

		if (password.length > finalConfig.maxLength!) {
			errors.push(
				`Password must not exceed ${finalConfig.maxLength} characters`,
			)
		}

		// Complexity requirements
		if (finalConfig.requireUppercase && !/[A-Z]/.test(password)) {
			errors.push('Password must contain at least one uppercase letter')
		}

		if (finalConfig.requireLowercase && !/[a-z]/.test(password)) {
			errors.push('Password must contain at least one lowercase letter')
		}

		if (finalConfig.requireNumbers && !/[0-9]/.test(password)) {
			errors.push('Password must contain at least one number')
		}

		if (finalConfig.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
			errors.push('Password must contain at least one special character')
		}

		// Custom rules
		if (finalConfig.customRules) {
			finalConfig.customRules.forEach((rule) => {
				if (!rule.test(password)) {
					errors.push(rule.message)
				}
			})
		}

		const strength = this.checkStrength(password)
		const isValid = errors.length === 0

		return {
			isValid,
			errors,
			strength,
		}
	}

	/**
	 * Check password strength
	 */
	checkStrength(password: string): PasswordStrength {
		const entropy = estimatePasswordEntropy(password)

		let score = 0
		const feedback: string[] = []
		const suggestions: string[] = []

		/* ---------------- Entropy baseline ---------------- */

		if (entropy < 28) {
			feedback.push('Password is easy to guess')
			suggestions.push('Use more unique characters and length')
		} else if (entropy < 36) {
			score += 1
		} else if (entropy < 60) {
			score += 2
		} else {
			score += 3
		}

		/* ---------------- Length scoring ---------------- */

		if (password.length >= 12) score++
		if (password.length >= 16) score++

		/* ---------------- Character variety ---------------- */

		if (/[a-z]/.test(password)) score++
		if (/[A-Z]/.test(password)) score++
		if (/[0-9]/.test(password)) score++
		if (/[^A-Za-z0-9]/.test(password)) score++

		/* ---------------- Pattern deductions ---------------- */

		if (/^[A-Za-z]+$/.test(password)) {
			score--
			feedback.push('Consider adding numbers or symbols')
		}

		if (/^[0-9]+$/.test(password)) {
			score -= 2
			feedback.push('Avoid using only numbers')
		}

		if (/([a-zA-Z0-9])\1{2,}/.test(password)) {
			score--
			feedback.push('Avoid repeated characters')
		}

		if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
			score--
			feedback.push('Avoid sequential patterns')
		}

		/* ---------------- Common passwords ---------------- */

		const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
		if (
			commonPasswords.some((common) => password.toLowerCase().includes(common))
		) {
			score = 0
			feedback.push('Avoid common passwords')
		}

		/* ---------------- Clamp score ---------------- */

		score = Math.max(0, Math.min(4, score))

		/* ---------------- Strength label ---------------- */

		let label: PasswordStrength['label']

		switch (score) {
			case 0:
				label = 'very-weak'
				suggestions.push('Use a longer password with mixed characters')
				break
			case 1:
				label = 'weak'
				suggestions.push('Add more character variety')
				break
			case 2:
				label = 'fair'
				suggestions.push('Consider increasing length or randomness')
				break
			case 3:
				label = 'good'
				suggestions.push('Your password is reasonably secure')
				break
			case 4:
				label = 'strong'
				suggestions.push('Your password is very secure')
				break
			default:
				label = 'very-weak'
		}

		return {
			score,
			label,
			feedback,
			suggestions,
		}
	}

	/**
	 * Check if password hash needs upgrade (different salt rounds)
	 */
	needsUpgrade(_hash: string, _currentConfig: PasswordConfig): boolean {
		// Simple heuristic: if the hash doesn't match current salt rounds pattern
		// In practice, you'd need to store the salt rounds with the hash
		return false
	}
}
