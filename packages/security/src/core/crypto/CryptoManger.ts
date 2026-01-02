import crypto from 'crypto'
import { BadRequestError } from '@naman_deep_singh/errors'

import { decrypt } from './decrypt.js'
import { encrypt } from './encrypt.js'
import { hmacSign, hmacVerify } from './hmac.js'

/**
 * High-level cryptography manager
 * Wraps encryption, decryption, HMAC, and random utilities
 */
export class CryptoManager {
	private readonly secret: string

	constructor(secret: string) {
		if (!secret || typeof secret !== 'string' || secret.length < 16) {
			throw new BadRequestError({
				reason:
					'CryptoManager secret must be a non-empty string (min 16 chars)',
			})
		}
		this.secret = secret
	}

	/**
	 * Encrypt data using AES-256-GCM
	 */
	encrypt(data: string): string {
		if (!data || typeof data !== 'string') {
			throw new BadRequestError({
				reason: 'Data to encrypt must be a non-empty string',
			})
		}
		return encrypt(data, this.secret)
	}

	/**
	 * Decrypt AES-256-GCM encrypted data
	 */
	decrypt(encrypted: string): string {
		if (!encrypted || typeof encrypted !== 'string') {
			throw new BadRequestError({
				reason: 'Encrypted value must be a non-empty string',
			})
		}
		return decrypt(encrypted, this.secret)
	}

	/**
	 * Create HMAC SHA-256 signature
	 */
	createHMAC(message: string): string {
		if (!message || typeof message !== 'string') {
			throw new BadRequestError({
				reason: 'Message must be a non-empty string',
			})
		}
		return hmacSign(message, this.secret)
	}

	/**
	 * Verify HMAC SHA-256 signature
	 */
	verifyHMAC(message: string, signature: string): boolean {
		if (
			!message ||
			typeof message !== 'string' ||
			!signature ||
			typeof signature !== 'string'
		) {
			return false
		}
		return hmacVerify(message, this.secret, signature)
	}

	/**
	 * Generate cryptographically secure random bytes
	 */
	generateRandomBytes(length = 32): Buffer {
		if (!Number.isInteger(length) || length <= 0) {
			throw new BadRequestError({
				reason: 'Random byte length must be a positive integer',
			})
		}
		return crypto.randomBytes(length)
	}

	/**
	 * Generate secure random hex string
	 */
	generateRandomHex(length = 32): string {
		if (!Number.isInteger(length) || length <= 0) {
			throw new BadRequestError({
				reason: 'Random hex length must be a positive integer',
			})
		}
		return crypto.randomBytes(length).toString('hex')
	}

	/**
	 * Generate secure random string (URL-safe base64)
	 */
	generateRandomString(length = 32): string {
		if (!Number.isInteger(length) || length <= 0) {
			throw new BadRequestError({
				reason: 'Random string length must be a positive integer',
			})
		}
		return crypto
			.randomBytes(Math.ceil((length * 3) / 4))
			.toString('base64url')
			.slice(0, length)
	}
}
