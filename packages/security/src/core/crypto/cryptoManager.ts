import {
	decrypt as functionalDecrypt,
	encrypt as functionalEncrypt,
	hmacSign as functionalHmacSign,
	hmacVerify as functionalHmacVerify,
	randomToken as functionalRandomToken,
} from './index'

/**
 * Configuration options for CryptoManager
 */
export interface CryptoManagerConfig {
	defaultAlgorithm?: string
	defaultEncoding?: BufferEncoding
	hmacAlgorithm?: string
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<CryptoManagerConfig> = {
	defaultAlgorithm: 'aes-256-gcm',
	defaultEncoding: 'utf8',
	hmacAlgorithm: 'sha256',
}

/**
 * CryptoManager - Class-based wrapper for all cryptographic operations
 * Provides a consistent interface for encryption, decryption, HMAC generation, and secure random generation
 */
export class CryptoManager {
	private config: Required<CryptoManagerConfig>

	constructor(config: CryptoManagerConfig = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config }
	}

	/**
	 * Update configuration
	 */
	public updateConfig(config: Partial<CryptoManagerConfig>): void {
		this.config = { ...this.config, ...config }
	}

	/**
	 * Get current configuration
	 */
	public getConfig(): Required<CryptoManagerConfig> {
		return { ...this.config }
	}

	/**
	 * Encrypt data using the default or specified algorithm
	 */
	public encrypt(
		plaintext: string,
		key: string,
		options?: {
			algorithm?: string
			encoding?: BufferEncoding
			iv?: string
		},
	): string {
		// For now, use the basic encrypt function
		// TODO: Enhance to support different algorithms and options
		return functionalEncrypt(plaintext, key)
	}

	/**
	 * Decrypt data using the default or specified algorithm
	 */
	public decrypt(
		encryptedData: string,
		key: string,
		options?: {
			algorithm?: string
			encoding?: BufferEncoding
			iv?: string
		},
	): string {
		// For now, use the basic decrypt function
		// TODO: Enhance to support different algorithms and options
		return functionalDecrypt(encryptedData, key)
	}

	/**
	 * Generate HMAC signature
	 */
	public generateHmac(
		data: string,
		secret: string,
		options?: {
			algorithm?: string
			encoding?: BufferEncoding
		},
	): string {
		// Use the basic HMAC sign function for now
		// TODO: Add support for different algorithms
		return functionalHmacSign(data, secret)
	}

	/**
	 * Generate cryptographically secure random bytes
	 */
	public generateSecureRandom(
		length: number,
		encoding: BufferEncoding = 'hex',
	): string {
		// Use the basic random token function
		return functionalRandomToken(length)
	}

	/**
	 * Verify HMAC signature
	 */
	public verifyHmac(
		data: string,
		secret: string,
		signature: string,
		options?: {
			algorithm?: string
			encoding?: BufferEncoding
		},
	): boolean {
		// Use the basic HMAC verify function
		return functionalHmacVerify(data, secret, signature)
	}

	/**
	 * Create a key derivation function using PBKDF2
	 */
	public deriveKey(
		password: string,
		salt: string,
		iterations = 100000,
		keyLength = 32,
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			crypto.pbkdf2(
				password,
				salt,
				iterations,
				keyLength,
				'sha256',
				(err: Error, derivedKey: Buffer) => {
					if (err) {
						reject(err)
					} else {
						resolve(derivedKey.toString('hex'))
					}
				},
			)
		})
	}

	/**
	 * Hash data using SHA-256
	 */
	public sha256(data: string, encoding: BufferEncoding = 'hex'): string {
		const crypto = require('crypto')
		return crypto.createHash('sha256').update(data).digest(encoding)
	}

	/**
	 * Hash data using SHA-512
	 */
	public sha512(data: string, encoding: BufferEncoding = 'hex'): string {
		const crypto = require('crypto')
		return crypto.createHash('sha512').update(data).digest(encoding)
	}

	/**
	 * Generate a secure key pair for asymmetric encryption
	 */
	public generateKeyPair(options?: {
		modulusLength?: number
		publicKeyEncoding?: { type: string; format: string }
		privateKeyEncoding?: { type: string; format: string }
	}): Promise<{ publicKey: string; privateKey: string }> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			const keyPair = crypto.generateKeyPairSync('rsa', {
				modulusLength: options?.modulusLength || 2048,
				publicKeyEncoding: options?.publicKeyEncoding || {
					type: 'spki',
					format: 'pem',
				},
				privateKeyEncoding: options?.privateKeyEncoding || {
					type: 'pkcs8',
					format: 'pem',
				},
			})

			resolve(keyPair)
		})
	}

	/**
	 * Encrypt data using RSA public key
	 */
	public rsaEncrypt(data: string, publicKey: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			const buffer = Buffer.from(data, 'utf8')
			const encrypted = crypto.publicEncrypt(publicKey, buffer)
			resolve(encrypted.toString('base64'))
		})
	}

	/**
	 * Decrypt data using RSA private key
	 */
	public rsaDecrypt(
		encryptedData: string,
		privateKey: string,
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			const buffer = Buffer.from(encryptedData, 'base64')
			const decrypted = crypto.privateDecrypt(privateKey, buffer)
			resolve(decrypted.toString('utf8'))
		})
	}

	/**
	 * Create digital signature using RSA private key
	 */
	public rsaSign(
		data: string,
		privateKey: string,
		algorithm = 'sha256',
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			const sign = crypto.createSign(algorithm)
			sign.update(data)
			sign.end()

			try {
				const signature = sign.sign(privateKey, 'base64')
				resolve(signature)
			} catch (error) {
				reject(error)
			}
		})
	}

	/**
	 * Verify digital signature using RSA public key
	 */
	public rsaVerify(
		data: string,
		signature: string,
		publicKey: string,
		algorithm = 'sha256',
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const crypto = require('crypto')

			const verify = crypto.createVerify(algorithm)
			verify.update(data)
			verify.end()

			try {
				const isValid = verify.verify(publicKey, signature, 'base64')
				resolve(isValid)
			} catch (error) {
				reject(error)
			}
		})
	}
}

/**
 * Create a CryptoManager instance with default configuration
 */
export const createCryptoManager = (
	config?: CryptoManagerConfig,
): CryptoManager => {
	return new CryptoManager(config)
}

/**
 * Default CryptoManager instance
 */
export const cryptoManager = new CryptoManager()
