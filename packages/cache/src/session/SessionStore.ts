import { CacheError } from '../errors'

import { CACHE_ERROR_CODES } from 'src/errors/cacheErrorCodes'
import type { ICache } from '../core/interfaces'
import type { SessionData, SessionOptions } from '../types'

/**
 * Session store wrapper around cache adapters
 * Provides session management functionality
 */
export class SessionStore {
	private cache: ICache<SessionData>
	private options: Required<SessionOptions>

	constructor(cache: ICache<SessionData>, options: SessionOptions = {}) {
		this.cache = cache
		this.options = {
			ttl: options.ttl ?? 3600, // 1 hour default
			serialize: options.serialize ?? ((data) => JSON.stringify(data)),
			deserialize: options.deserialize ?? ((data) => JSON.parse(data)),
		}
	}

	/**
	 * Create a new session
	 */
	async create(
		sessionId: string,
		data: SessionData,
		ttl?: number,
	): Promise<void> {
		try {
			const ttlValue = ttl ?? this.options.ttl
			await this.cache.set(sessionId, data, ttlValue)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_CREATE_ERROR, {
				adapter: 'session',
				operation: 'create',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Get session data
	 */
	async get(sessionId: string): Promise<SessionData | null> {
		try {
			return await this.cache.get(sessionId)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_GET_ERROR, {
				adapter: 'session',
				operation: 'get',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Update/merge session data
	 */
	async update(sessionId: string, data: Partial<SessionData>): Promise<void> {
		try {
			const current = await this.cache.get(sessionId)

			if (!current) {
				throw new CacheError(CACHE_ERROR_CODES.SESSION_NOT_FOUND, {
					adapter: 'session',
					operation: 'update',
					details: { sessionId },
				})
			}

			const merged = { ...current, ...data }
			await this.cache.set(sessionId, merged, this.options.ttl)
		} catch (error) {
			if (error instanceof CacheError) {
				throw error
			}
			throw new CacheError(CACHE_ERROR_CODES.SESSION_UPDATE_ERROR, {
				adapter: 'session',
				operation: 'update',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Delete session
	 */
	async delete(sessionId: string): Promise<boolean> {
		try {
			return await this.cache.delete(sessionId)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_DELETE_ERROR, {
				adapter: 'session',
				operation: 'delete',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Check if session exists
	 */
	async exists(sessionId: string): Promise<boolean> {
		try {
			return await this.cache.exists(sessionId)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_EXISTS_ERROR, {
				adapter: 'session',
				operation: 'exists',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Clear all sessions
	 */
	async clear(): Promise<void> {
		try {
			await this.cache.clear()
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_CLEAR_ERROR, {
				adapter: 'session',
				operation: 'clear',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Get all session keys (limited use - may be slow with large datasets)
	 */
	async getMultiple(
		sessionIds: string[],
	): Promise<Record<string, SessionData | null>> {
		try {
			return await this.cache.getMultiple(sessionIds)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_GET_MULTIPLE_ERROR, {
				adapter: 'session',
				operation: 'getMultiple',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Delete multiple sessions
	 */
	async deleteMultiple(sessionIds: string[]): Promise<number> {
		try {
			return await this.cache.deleteMultiple(sessionIds)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.SESSION_DELETE_MULTIPLE_ERROR, {
				adapter: 'session',
				operation: 'deleteMultiple',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Extend session expiry
	 */
	async extend(sessionId: string, ttl?: number): Promise<void> {
		try {
			const current = await this.cache.get(sessionId)

			if (!current) {
				throw new CacheError(CACHE_ERROR_CODES.SESSION_NOT_FOUND, {
					adapter: 'session',
					operation: 'extend',
					details: { sessionId },
				})
			}

			const ttlValue = ttl ?? this.options.ttl
			await this.cache.set(sessionId, current, ttlValue)
		} catch (error) {
			if (error instanceof CacheError) {
				throw error
			}
			throw new CacheError(CACHE_ERROR_CODES.SESSION_EXTEND_ERROR, {
				adapter: 'session',
				operation: 'extend',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Get session data and extend expiry in one operation
	 */
	async getAndExtend(
		sessionId: string,
		ttl?: number,
	): Promise<SessionData | null> {
		try {
			const data = await this.get(sessionId)

			if (data) {
				await this.extend(sessionId, ttl)
			}

			return data
		} catch (error) {
			if (error instanceof CacheError) {
				throw error
			}
			throw new CacheError(CACHE_ERROR_CODES.SESSION_GET_EXTEND_ERROR, {
				adapter: 'session',
				operation: 'getAndExtend',
				details: { sessionId },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Optional close hook for graceful shutdowns.
	 * Present to allow callers to call `close()` during shutdown without
	 * requiring every store implementation to provide one.
	 */
	async close(): Promise<void> {
		return
	}
}
