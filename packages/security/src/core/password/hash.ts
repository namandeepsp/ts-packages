import { InternalServerError } from '@naman_deep_singh/errors-utils'
import bcrypt from 'bcryptjs'
import { ensureValidPassword } from './utils'

/**
 * Hash a password asynchronously using bcrypt.
 */
export const hashPassword = async (
	password: string,
	saltRounds = 10,
): Promise<string> => {
	try {
		ensureValidPassword(password)
		const salt = await bcrypt.genSalt(saltRounds)
		return bcrypt.hash(password, salt)
	} catch (error) {
		throw new InternalServerError(
			{ reason: 'Password hashing failed' },
			error instanceof Error ? error : undefined,
		)
	}
}

export function hashPasswordWithPepper(password: string, pepper: string) {
	return hashPassword(password + pepper)
}

/**
 * Hash a password synchronously using bcrypt.
 */
export const hashPasswordSync = (password: string, saltRounds = 10): string => {
	try {
		ensureValidPassword(password)
		const salt = bcrypt.genSaltSync(saltRounds)
		return bcrypt.hashSync(password, salt)
	} catch (error) {
		throw new InternalServerError(
			{ reason: 'Password hashing failed' },
			error instanceof Error ? error : undefined,
		)
	}
}

export function hashPasswordWithPepperSync(password: string, pepper: string) {
	return hashPasswordSync(password + pepper)
}
