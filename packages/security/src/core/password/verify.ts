import { UnauthorizedError } from '@naman_deep_singh/errors-utils'
import bcrypt from 'bcryptjs'

/**
 * Compare a password with a stored hash asynchronously.
 */
export const verifyPassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	try {
		const result = await bcrypt.compare(password, hash)
		if (!result) throw new UnauthorizedError({ message: 'Password verification failed' })
		return result
	} catch {
		throw new UnauthorizedError({ message: 'Password verification failed' })
	}
}

export async function verifyPasswordWithPepper(
	password: string,
	pepper: string,
	hash: string,
) {
	return verifyPassword(password + pepper, hash)
}

/**
 * Compare a password with a stored hash synchronously.
 */
export const verifyPasswordSync = (password: string, hash: string): boolean => {
	try {
		const result = bcrypt.compareSync(password, hash)
		if (!result) throw new UnauthorizedError({ message: 'Password verification failed' })
		return result
	} catch (_error) {
		throw new UnauthorizedError({ message: 'Password verification failed' })
	}
}

export async function verifyPasswordWithPepperSync(
	password: string,
	pepper: string,
	hash: string,
) {
	return verifyPasswordSync(password + pepper, hash)
}
