import { type RedisClientOptions, createClient, createCluster } from 'redis'
import { BaseCache } from '../../core/index.js'
import { CACHE_ERROR_CODES, CacheError } from '../../errors/index.js'
import type { HealthCheckResponse, RedisCacheConfig } from '../../types.js'

/**
 * Redis cache adapter
 */
export class RedisCache<T = unknown> extends BaseCache<T> {
	private client:
		| ReturnType<typeof createClient>
		| ReturnType<typeof createCluster>
		| null = null
	private isConnected = false

	constructor(private redisConfig: RedisCacheConfig) {
		super(redisConfig)
	}

	/**
	 * Connect to Redis
	 */
	async connect(): Promise<void> {
		try {
			const cluster = this.redisConfig.cluster
			const hasCluster =
				cluster &&
				(Array.isArray(cluster)
					? cluster.length > 0
					: cluster.nodes?.length > 0)

			if (hasCluster && cluster) {
				// Cluster mode
				let nodes: Array<{ host: string; port: number }> = []

				if (Array.isArray(cluster)) {
					nodes = cluster
				} else {
					nodes = cluster.nodes
				}

				this.client = createCluster({
					rootNodes: nodes.map((node) => ({
						url: `redis://${node.host}:${node.port}`,
					})),
				})
			} else {
				// Single instance mode
				const options: Record<string, unknown> = {
					host: this.redisConfig.host ?? 'localhost',
					port: this.redisConfig.port ?? 6379,
					db: this.redisConfig.db ?? 0,
				}

				if (this.redisConfig.username) {
					options.username = this.redisConfig.username
				}

				if (this.redisConfig.password) {
					options.password = this.redisConfig.password
				}

				if (this.redisConfig.tls) {
					options.tls = true
				}

				this.client = createClient(options as unknown as RedisClientOptions)
			}

			if (this.client) {
				this.client.on('error', (err) => {
					this.isConnected = false
					console.error('Redis connection error:', err)
				})

				this.client.on('connect', () => {
					this.isConnected = true
				})

				await this.client.connect()
				this.isConnected = true
			}
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_CONNECTION_FAILED, {
				adapter: 'redis',
				operation: 'connect',
				cause: error instanceof Error ? error : undefined,
			})
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
	 * Get a value from Redis
	 */
	async get(key: string): Promise<T | null> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			const value = await this.client!.get(fullKey)

			if (value === null) {
				this.recordMiss()
				return null
			}

			this.recordHit()
			return this.deserialize(value)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
				operation: 'get',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Set a value in Redis
	 */
	async set(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			const serialized = this.serialize(value)
			const expiry = ttl ?? this.ttl

			if (expiry > 0) {
				await this.client!.setEx(fullKey, expiry, serialized)
			} else {
				await this.client!.set(fullKey, serialized)
			}

			this.recordSet()
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
				operation: 'set',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Delete a key from Redis
	 */
	async delete(key: string): Promise<boolean> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			const result = await this.client!.del(fullKey)
			this.recordDelete()
			return result > 0
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			const result = await this.client!.exists(fullKey)
			return result > 0
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()

			if (this.namespace) {
				// For cluster mode, we can't use FLUSHDB, so we skip clearing in cluster
				// In production, use explicit key tracking or Redis ACL scoping
				console.warn(
					'Cluster mode: namespace clear requires explicit key tracking',
				)
			} else {
				// Clear all keys only in single-instance mode
				const client = this.client as ReturnType<typeof createClient>
				if (client && typeof (client as any).flushDb === 'function') {
					await (client as any).flushDb()
				} else {
					console.warn('Clear operation not supported in cluster mode')
				}
			}
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_OPERATION_TIMEOUT, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const fullKeys = keys.map((k) => this.buildKey(k))
			const values = await this.client!.mGet(fullKeys)

			const result: Record<string, T | null> = {}
			keys.forEach((key, index) => {
				const value = values[index]
				if (value === null) {
					this.recordMiss()
					result[key] = null
				} else {
					this.recordHit()
					result[key] = this.deserialize(value)
				}
			})

			return result
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const expiry = ttl ?? this.ttl

			if (expiry > 0) {
				// Use pipeline for batch operations with TTL
				const pipeline = this.client!.multi()
				for (const [key, value] of Object.entries(data)) {
					const fullKey = this.buildKey(key)
					const serialized = this.serialize(value)
					pipeline.setEx(fullKey, expiry, serialized)
				}
				await pipeline.exec()
			} else {
				// Use mSet for batch operations without TTL
				const flatData: Record<string, string> = {}
				for (const [key, value] of Object.entries(data)) {
					const fullKey = this.buildKey(key)
					flatData[fullKey] = this.serialize(value)
				}
				await this.client!.mSet(flatData)
			}

			this.stats.sets += Object.keys(data).length
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const fullKeys = keys.map((k) => this.buildKey(k))
			const result = await this.client!.del(fullKeys)
			this.stats.deletes += result
			return result
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			return await this.client!.incrBy(fullKey, amount)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
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
			await this.ensureConnected()
			const fullKey = this.buildKey(key)
			return await this.client!.decrBy(fullKey, amount)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
				operation: 'decrement',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Check if Redis is alive
	 */
	async isAlive(): Promise<HealthCheckResponse> {
		try {
			await this.ensureConnected()
			// Use sendCommand which works for both single and cluster
			// `sendCommand` exists on both single and cluster clients in runtime; cast narrowly for the call
			if (
				this.client &&
				typeof (this.client as any).sendCommand === 'function'
			) {
				await (this.client as any).sendCommand(['PING'])
			} else if (
				this.client &&
				typeof (this.client as any).ping === 'function'
			) {
				await (this.client as any).ping()
			}
			return {
				isAlive: true,
				adapter: 'redis',
				timestamp: new Date(),
			}
		} catch (error) {
			return {
				isAlive: false,
				adapter: 'redis',
				timestamp: new Date(),
				error: (error as Error).message,
			}
		}
	}

	/**
	 * Close Redis connection
	 */
	async close(): Promise<void> {
		try {
			if (this.client && this.isConnected) {
				await this.client.quit()
				this.isConnected = false
				this.client = null
			}
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'redis',
				operation: 'close',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}
}
