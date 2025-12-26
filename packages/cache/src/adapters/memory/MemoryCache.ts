import { CACHE_ERROR_CODES } from 'src/errors/cacheErrorCodes'
import { BaseCache } from '../../core/BaseCache'
import { CacheError } from '../../errors'
import type { HealthCheckResponse, MemoryCacheConfig } from '../../types'

/**
 * In-memory cache adapter for development and testing
 */
export class MemoryCache<T = unknown> extends BaseCache<T> {
	private store: Map<string, { value: T; expiresAt?: number }> = new Map()
	private cleanupInterval: ReturnType<typeof setInterval> | null = null

	constructor(private memoryCacheConfig: MemoryCacheConfig) {
		super(memoryCacheConfig)
		this.startCleanup()
	}

	/**
	 * Start periodic cleanup of expired items
	 */
	private startCleanup(): void {
		if (this.cleanupInterval) return

		this.cleanupInterval = setInterval(() => {
			const now = Date.now()
			for (const [key, entry] of this.store.entries()) {
				if (entry.expiresAt && entry.expiresAt < now) {
					this.store.delete(key)
				}
			}
		}, 30000) // Cleanup every 30 seconds
	}

	/**
	 * Get a value from memory
	 */
	async get(key: string): Promise<T | null> {
		try {
			const fullKey = this.buildKey(key)
			const entry = this.store.get(fullKey)

			if (!entry) {
				this.recordMiss()
				return null
			}

			// Check if expired
			if (entry.expiresAt && entry.expiresAt < Date.now()) {
				this.store.delete(fullKey)
				this.recordMiss()
				return null
			}

			this.recordHit()
			return entry.value
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_KEY_NOT_FOUND, {
				adapter: 'memory',
				operation: 'get',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Set a value in memory
	 */
	async set(key: string, value: T, ttl?: number): Promise<void> {
		try {
			const fullKey = this.buildKey(key)
			const expiry = ttl ?? this.ttl

			const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined

			// Check max size
			const maxSize = this.memoryCacheConfig.maxSize
			if (maxSize && this.store.size >= maxSize && !this.store.has(fullKey)) {
				// Remove oldest entry
				const firstKey = this.store.keys().next().value
				if (firstKey) {
					this.store.delete(firstKey)
				}
			}

			this.store.set(fullKey, { value, expiresAt })
			this.recordSet()
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'set',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Delete a key from memory
	 */
	async delete(key: string): Promise<boolean> {
		try {
			const fullKey = this.buildKey(key)
			const deleted = this.store.delete(fullKey)
			if (deleted) {
				this.recordDelete()
			}
			return deleted
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'delete',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Check if key exists
	 */
	async exists(key: string): Promise<boolean> {
		try {
			const fullKey = this.buildKey(key)
			const entry = this.store.get(fullKey)

			if (!entry) {
				return false
			}

			// Check if expired
			if (entry.expiresAt && entry.expiresAt < Date.now()) {
				this.store.delete(fullKey)
				return false
			}

			return true
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'exists',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Clear all keys with current namespace
	 */
	async clear(): Promise<void> {
		try {
			if (this.namespace) {
				// Clear only keys with current namespace
				for (const key of this.store.keys()) {
					if (key.startsWith(this.namespace)) {
						this.store.delete(key)
					}
				}
			} else {
				// Clear all
				this.store.clear()
			}
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_OPERATION_TIMEOUT, {
				adapter: 'memory',
				operation: 'clear',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Get multiple values at once
	 */
	async getMultiple(keys: string[]): Promise<Record<string, T | null>> {
		try {
			const result: Record<string, T | null> = {}
			const now = Date.now()

			for (const key of keys) {
				const fullKey = this.buildKey(key)
				const entry = this.store.get(fullKey)

				if (!entry) {
					this.recordMiss()
					result[key] = null
					continue
				}

				// Check if expired
				if (entry.expiresAt && entry.expiresAt < now) {
					this.store.delete(fullKey)
					this.recordMiss()
					result[key] = null
				} else {
					this.recordHit()
					result[key] = entry.value
				}
			}

			return result
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'getMultiple',
				details: { keys },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Set multiple values at once
	 */
	async setMultiple(data: Record<string, T>, ttl?: number): Promise<void> {
		try {
			const expiry = ttl ?? this.ttl
			const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined

			for (const [key, value] of Object.entries(data)) {
				const fullKey = this.buildKey(key)
				this.store.set(fullKey, { value, expiresAt })
			}

			this.stats.sets += Object.keys(data).length
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'setMultiple',
				details: { keys: Object.keys(data) },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Delete multiple keys at once
	 */
	async deleteMultiple(keys: string[]): Promise<number> {
		try {
			let count = 0
			for (const key of keys) {
				const fullKey = this.buildKey(key)
				if (this.store.delete(fullKey)) {
					count++
				}
			}
			this.stats.deletes += count
			return count
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'deleteMultiple',
				details: { keys },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Increment a numeric value
	 */
	async increment(key: string, amount = 1): Promise<number> {
		try {
			const fullKey = this.buildKey(key)
			const entry = this.store.get(fullKey)

			const current =
				entry && (!entry.expiresAt || entry.expiresAt >= Date.now())
					? typeof entry.value === 'number'
						? entry.value
						: 0
					: 0

			const value = current + amount

			const expiry = this.ttl
			const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined

			this.store.set(fullKey, { value: value as T, expiresAt })
			return value
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'increment',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Decrement a numeric value
	 */
	async decrement(key: string, amount = 1): Promise<number> {
		try {
			const fullKey = this.buildKey(key)
			const entry = this.store.get(fullKey)

			const current =
				entry && (!entry.expiresAt || entry.expiresAt >= Date.now())
					? typeof entry.value === 'number'
						? entry.value
						: 0
					: 0

			const value = current - amount

			const expiry = this.ttl
			const expiresAt = expiry > 0 ? Date.now() + expiry * 1000 : undefined

			this.store.set(fullKey, { value: value as T, expiresAt })
			return value
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'decrement',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Check if memory cache is alive
	 */
	async isAlive(): Promise<HealthCheckResponse> {
		return {
			isAlive: true,
			adapter: 'memory',
			timestamp: new Date(),
		}
	}

	/**
	 * Close memory cache
	 */
	async close(): Promise<void> {
		try {
			if (this.cleanupInterval) {
				clearInterval(this.cleanupInterval)
				this.cleanupInterval = null
			}
			this.store.clear()
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memory',
				operation: 'close',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}
}
