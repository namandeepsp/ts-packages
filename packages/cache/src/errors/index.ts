import { errorMessageRegistry } from '@naman_deep_singh/errors'
import { CACHE_ERROR_CODES } from './cacheErrorCodes.js'

errorMessageRegistry.register(CACHE_ERROR_CODES)

export { CacheError } from './CacheError.js'
export { CACHE_ERROR_CODES, type CacheErrorCode } from './cacheErrorCodes.js'