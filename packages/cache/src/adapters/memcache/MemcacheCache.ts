import Memcached from 'memcached'
import { BaseCache } from '../../core/BaseCache'
import { CacheError } from '../../errors'
import type { HealthCheckResponse, MemcacheCacheConfig } from '../../types'

/**
 * Memcache adapter
 */
export class MemcacheCache<T = unknown> extends BaseCache<T> {
	private client: Memcached | null = null
	private isConnected = false

	constructor(private memcacheConfig: MemcacheCacheConfig) {
		super(memcacheConfig)
	}

	/**
	 * Connect to Memcache
	 */
	async connect(): Promise<void> {
		try {
			const servers = Array.isArray(this.memcacheConfig.servers)
				? this.memcacheConfig.servers
				: [this.memcacheConfig.servers]

			const options: Memcached.options = {
				retries: 2,
				retry: 30000,
				remove: true,
				failOverServers: [],
				maxValue: 1048576, // 1MB default
				idle: 30000,
			}

			if (this.memcacheConfig.username) {
				;(options as any).username = this.memcacheConfig.username
			}

			if (this.memcacheConfig.password) {
				;(options as any).password = this.memcacheConfig.password
			}

			this.client = new Memcached(servers, options)
			this.isConnected = true

			// Test connection
			await this.ping()
		} catch (err) {
			throw new CacheError(
				'Failed to connect to Memcache',
				'MEMCACHE_CONNECTION_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Ensure client is connected
	 */
	private async ensureConnected(): Promise<void> {
		if (!this.client) {
			await this.connect()
		}
	}

	/**
	 * Ping memcache
	 */
	private async ping(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.client) {
				reject(new Error('Memcache client not initialized'))
				return
			}

			this.client.touch('__ping', 1, (err: Error | null) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}

	/**
	 * Get a value from Memcache
	 */
	async get(key: string): Promise<T | null> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)

			return new Promise((resolve, reject) => {
				this.client!.get(fullKey, (err: Error | null, data: unknown) => {
					if (err) {
						reject(err)
						return
					}

					if (data === undefined || data === null) {
						this.recordMiss()
						resolve(null)
						return
					}

					this.recordHit()
					try {
						if (typeof data === 'string') {
							resolve(this.deserialize(data))
						} else if (Buffer.isBuffer(data)) {
							resolve(this.deserialize(data.toString()))
						} else {
							// Unknown shape from memcached client - treat as miss
							this.recordMiss()
							resolve(null)
						}
					} catch (parseErr) {
						reject(parseErr)
					}
				})
			})
		} catch (err) {
			throw new CacheError(
				`Failed to get key "${key}" from Memcache`,
				'MEMCACHE_GET_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Set a value in Memcache
	 */
	async set(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			const serialized = this.serialize(value)
			const expiry = ttl ?? this.ttl

			return new Promise((resolve, reject) => {
				this.client!.set(fullKey, serialized, expiry, (err: Error | null) => {
					if (err) {
						reject(err)
					} else {
						this.recordSet()
						resolve()
					}
				})
			})
		} catch (err) {
			throw new CacheError(
				`Failed to set key "${key}" in Memcache`,
				'MEMCACHE_SET_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Delete a key from Memcache
	 */
	async delete(key: string): Promise<boolean> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)

			return new Promise((resolve, reject) => {
				this.client!.del(fullKey, (err: Error | null) => {
					if (err) {
						reject(err)
					} else {
						this.recordDelete()
						resolve(true)
					}
				})
			})
		} catch (err) {
			throw new CacheError(
				`Failed to delete key "${key}" from Memcache`,
				'MEMCACHE_DELETE_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Check if key exists
	 */
	async exists(key: string): Promise<boolean> {
		try {
			const value = await this.get(key)
			return value !== null
		} catch (err) {
			throw new CacheError(
				`Failed to check existence of key "${key}" in Memcache`,
				'MEMCACHE_EXISTS_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Clear all keys (Memcache limitation: flushes entire cache)
	 */
	async clear(): Promise<void> {
		try {
			await this.ensureConnected()

			return new Promise((resolve, reject) => {
				this.client!.flush((err: Error | null) => {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				})
			})
		} catch (err) {
			throw new CacheError(
				'Failed to clear Memcache',
				'MEMCACHE_CLEAR_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Get multiple values at once
	 */
	async getMultiple(keys: string[]): Promise<Record<string, T | null>> {
		try {
			await this.ensureConnected()
			const fullKeys = keys.map((k) => this.buildKey(k))

			return new Promise((resolve, reject) => {
				this.client!.getMulti(fullKeys, (err: Error | null, data: unknown) => {
					if (err) {
						reject(err)
						return
					}

					const result: Record<string, T | null> = {}

					if (!data || typeof data !== 'object') {
						// Treat as all misses
						for (const key of keys) {
							this.recordMiss()
							result[key] = null
						}
						resolve(result)
						return
					}

					const map = data as Record<string, unknown>
					keys.forEach((key) => {
						const fullKey = this.buildKey(key)
						const value = map[fullKey]
						if (value === undefined || value === null) {
							this.recordMiss()
							result[key] = null
						} else {
							this.recordHit()
							try {
								if (typeof value === 'string') {
									result[key] = this.deserialize(value)
								} else if (Buffer.isBuffer(value)) {
									result[key] = this.deserialize(value.toString())
								} else {
									// Unknown, treat as miss
									this.recordMiss()
									result[key] = null
								}
							} catch (parseErr) {
								reject(parseErr)
							}
						}
					})

					resolve(result)
				})
			})
		} catch (err) {
			throw new CacheError(
				'Failed to get multiple keys from Memcache',
				'MEMCACHE_GET_MULTIPLE_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Set multiple values at once
	 */
	async setMultiple(data: Record<string, T>, ttl?: number): Promise<void> {
		try {
			await this.ensureConnected()
			const expiry = ttl ?? this.ttl

			const promises: Promise<void>[] = []
			for (const [key, value] of Object.entries(data)) {
				const fullKey = this.buildKey(key)
				const serialized = this.serialize(value)
				promises.push(
					new Promise((resolve, reject) => {
						this.client!.set(
							fullKey,
							serialized,
							expiry,
							(err: Error | null) => {
								if (err) reject(err)
								else resolve()
							},
						)
					}),
				)
			}

			return Promise.all(promises).then(() => {
				this.stats.sets += Object.keys(data).length
			})
		} catch (err) {
			throw new CacheError(
				'Failed to set multiple keys in Memcache',
				'MEMCACHE_SET_MULTIPLE_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Delete multiple keys at once
	 */
	async deleteMultiple(keys: string[]): Promise<number> {
		try {
			await this.ensureConnected()
			const fullKeys = keys.map((k) => this.buildKey(k))

			let deletedCount = 0
			await Promise.all(
				fullKeys.map(
					(key) =>
						new Promise<void>((resolve, reject) => {
							this.client!.del(key, (err: Error | null) => {
								if (err) {
									reject(err)
								} else {
									deletedCount++
									resolve()
								}
							})
						}),
				),
			)

			this.stats.deletes += deletedCount
			return deletedCount
		} catch (err) {
			throw new CacheError(
				'Failed to delete multiple keys from Memcache',
				'MEMCACHE_DELETE_MULTIPLE_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Increment a numeric value (not natively supported by Memcache in this library)
	 */
	async increment(key: string, amount = 1): Promise<number> {
		try {
			const current = await this.get(key)
			const value = (typeof current === 'number' ? current : 0) + amount
			await this.set(key, value as T)
			return value
		} catch (err) {
			throw new CacheError(
				`Failed to increment key "${key}" in Memcache`,
				'MEMCACHE_INCREMENT_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Decrement a numeric value
	 */
	async decrement(key: string, amount = 1): Promise<number> {
		try {
			const current = await this.get(key)
			const value = (typeof current === 'number' ? current : 0) - amount
			await this.set(key, value as T)
			return value
		} catch (err) {
			throw new CacheError(
				`Failed to decrement key "${key}" in Memcache`,
				'MEMCACHE_DECREMENT_ERROR',
				'memcache',
				err as Error,
			)
		}
	}

	/**
	 * Check if Memcache is alive
	 */
	async isAlive(): Promise<HealthCheckResponse> {
		try {
			await this.ping()
			return {
				isAlive: true,
				adapter: 'memcache',
				timestamp: new Date(),
			}
		} catch (err) {
			return {
				isAlive: false,
				adapter: 'memcache',
				timestamp: new Date(),
				error: (err as Error).message,
			}
		}
	}

	/**
	 * Close Memcache connection
	 */
	async close(): Promise<void> {
		try {
			if (this.client && this.isConnected) {
				this.client.end()
				this.isConnected = false
				this.client = null
			}
		} catch (err) {
			throw new CacheError(
				'Failed to close Memcache connection',
				'MEMCACHE_CLOSE_ERROR',
				'memcache',
				err as Error,
			)
		}
	}
}
