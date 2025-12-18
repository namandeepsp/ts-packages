import crypto from 'crypto'
import { BadRequestError } from '@naman_deep_singh/errors-utils'

export function ensureValidPassword(password: string) {
	if (!password || typeof password !== 'string') {
		throw new BadRequestError('Invalid password provided')
	}
}

export function safeCompare(a: string, b: string): boolean {
	const bufA = Buffer.from(a)
	const bufB = Buffer.from(b)

	if (bufA.length !== bufB.length) return false

	return crypto.timingSafeEqual(bufA, bufB)
}

export function estimatePasswordEntropy(password: string): number {
	let pool = 0
	if (/[a-z]/.test(password)) pool += 26
	if (/[A-Z]/.test(password)) pool += 26
	if (/[0-9]/.test(password)) pool += 10
	if (/[^A-Za-z0-9]/.test(password)) pool += 32

	return password.length * Math.log2(pool)
}

export function normalizePassword(password: string) {
	return password.normalize('NFKC')
}
