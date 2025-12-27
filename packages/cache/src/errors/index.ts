import { errorMessageRegistry } from '@naman_deep_singh/errors'
import { CACHE_ERROR_CODES } from './cacheErrorCodes'

errorMessageRegistry.register(CACHE_ERROR_CODES)

export { CacheError } from './CacheError'
