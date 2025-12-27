import { AppError, type ErrorCode } from '@naman_deep_singh/errors'
import type { CacheErrorCode } from './cacheErrorCodes'

export class CacheError extends AppError {
	readonly adapter?: string
	readonly operation?: string

	constructor(
		code: CacheErrorCode,
		options?: {
			adapter?: string
			operation?: string
			details?: unknown
			cause?: Error
		},
	) {
		super(code as ErrorCode, undefined, options?.details, options?.cause)
		this.adapter = options?.adapter
		this.operation = options?.operation
	}
}
