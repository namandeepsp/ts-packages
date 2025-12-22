import crypto from 'crypto'
import { BadRequestError } from '@naman_deep_singh/errors-utils'

/**
 * Ensure password is a valid non-empty string
 */
export function ensureValidPassword(password: string): void {
	if (!password || typeof password !== 'string') {
		throw new BadRequestError({ message: 'Invalid password provided' })
	}
}

/**
 * Timing-safe comparison between two strings
 */
export function safeCompare(a: string, b: string): boolean {
	const bufA = Buffer.from(a)
	const bufB = Buffer.from(b)

	if (bufA.length !== bufB.length) return false

	return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Estimate password entropy based on character pool
 */
export function estimatePasswordEntropy(password: string): number {
	let pool = 0

	if (/[a-z]/.test(password)) pool += 26
	if (/[A-Z]/.test(password)) pool += 26
	if (/[0-9]/.test(password)) pool += 10
	if (/[^A-Za-z0-9]/.test(password)) pool += 32

	// If no characters matched, fallback to 1 to avoid log2(0)
	if (pool === 0) pool = 1

	return password.length * Math.log2(pool)
}

/**
 * Normalize password string to a consistent form
 */
export function normalizePassword(password: string): string {
	return password.normalize('NFKC')
}
