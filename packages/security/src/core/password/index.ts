export {
	hashPassword,
	hashPasswordWithPepper,
	hashPasswordSync,
	hashPasswordWithPepperSync,
} from './hash.js'

export { isPasswordStrong } from './strength.js'

export {
	verifyPassword,
	verifyPasswordWithPepper,
	verifyPasswordSync,
	verifyPasswordWithPepperSync,
} from './verify.js'

export { PasswordManager } from './PasswordManager.js'
export { type PasswordStrengthOptions } from './types.js'

export {
	ensureValidPassword,
	safeCompare,
	estimatePasswordEntropy,
	normalizePassword,
} from './utils.js'
