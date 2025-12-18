import crypto from 'crypto'

const ALGO = 'AES-256-GCM'

export const decrypt = (data: string, secret: string): string => {
	const [ivHex, encryptedHex] = data.split(':')

	const iv = Buffer.from(ivHex, 'hex')
	const encrypted = Buffer.from(encryptedHex, 'hex')

	const key = crypto.createHash('sha256').update(secret).digest()
	const decipher = crypto.createDecipheriv(ALGO, key, iv)

	const decrypted = Buffer.concat([
		decipher.update(encrypted),
		decipher.final(),
	])

	return decrypted.toString('utf8')
}
