import { errorMessageRegistry } from '@naman_deep_singh/errors'
import { CACHE_ERROR_CODES } from './cacheErrorCodes.js'

errorMessageRegistry.register(CACHE_ERROR_CODES)

export * from './CacheError.js'
export * from './cacheErrorCodes.js'
