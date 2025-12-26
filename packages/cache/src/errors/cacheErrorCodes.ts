export const CACHE_ERROR_CODES = {
	CACHE_ERROR: 'Temporary caching issue, please retry',
	CACHE_CONNECTION_FAILED: 'Failed to connect to the cache server',
	CACHE_UNSUPPORTED_ADAPTER: 'The specified cache adapter is not supported',
	CACHE_INVALID_CONFIG: 'The provided cache configuration is invalid',
	CACHE_KEY_NOT_FOUND: 'The requested cache key was not found',
	CACHE_OPERATION_TIMEOUT: 'The cache operation timed out',
	CACHE_SERIALIZE_ERROR: 'Failed to serialize cached data',
	CACHE_DESERIALIZE_ERROR: 'Failed to deserialize cached data',
	SESSION_CREATE_ERROR: 'Failed to create a new session',
	SESSION_GET_ERROR: 'Failed to get session data',
	SESSION_UPDATE_ERROR: 'Failed to update session data',
	SESSION_DELETE_ERROR: 'Failed to delete session data',
	SESSION_EXISTS_ERROR: 'Failed to check session existence',
	SESSION_CLEAR_ERROR: 'Failed to clear sessions',
	SESSION_GET_MULTIPLE_ERROR: 'Failed to get multiple sessions',
	SESSION_DELETE_MULTIPLE_ERROR: 'Failed to delete multiple sessions',
	SESSION_EXTEND_ERROR: 'Failed to extend session expiry',
	SESSION_GET_EXTEND_ERROR: 'Failed to get and extend session data',
	SESSION_NOT_FOUND: 'Session not found',
} as const

export type CacheErrorCode =
	(typeof CACHE_ERROR_CODES)[keyof typeof CACHE_ERROR_CODES]
