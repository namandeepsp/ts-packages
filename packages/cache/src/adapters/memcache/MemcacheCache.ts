import Memcached from 'memcached'
import { BaseCache } from '../../core/index.js'
import { CACHE_ERROR_CODES, CacheError } from '../../errors/index.js'
import type { HealthCheckResponse, MemcacheCacheConfig } from '../../types.js'

export class MemcacheCache<T = unknown> extends BaseCache<T> {
	private client: Memcached | null = null
	private isConnected = false

	constructor(private memcacheConfig: MemcacheCacheConfig) {
		super(memcacheConfig)
	}

	async connect(): Promise<void> {
		try {
			const servers = Array.isArray(this.memcacheConfig.servers)
				? this.memcacheConfig.servers
				: [this.memcacheConfig.servers]

			this.client = new Memcached(servers, {
				retries: 2,
				retry: 30000,
				remove: true,
				maxValue: 1048576,
				idle: 30000,
			})

			this.isConnected = true
			await this.ping()
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_CONNECTION_FAILED, {
				adapter: 'memcache',
				operation: 'connect',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	private async ensureConnected(): Promise<void> {
		if (!this.client) {
			await this.connect()
		}
	}

	private async ping(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.client) return reject(new Error('Client not initialized'))
			this.client.touch('__ping', 1, (err) => (err ? reject(err) : resolve()))
		})
	}

	async exists(key: string): Promise<boolean> {
		try {
			const value = await this.get(key)
			return value !== null
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memcache',
				operation: 'exists',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	async get(key: string): Promise<T | null> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)

			return new Promise((resolve, reject) => {
				this.client!.get(fullKey, (err, data) => {
					if (err) return reject(err)
					if (data == null) return resolve(null)

					try {
						resolve(
							this.deserialize(Buffer.isBuffer(data) ? data.toString() : data),
						)
					} catch (e) {
						reject(e)
					}
				})
			})
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_KEY_NOT_FOUND, {
				adapter: 'memcache',
				operation: 'get',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	async set(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)

			return new Promise((resolve, reject) => {
				this.client!.set(
					fullKey,
					this.serialize(value),
					ttl ?? this.ttl,
					(err) => (err ? reject(err) : resolve()),
				)
			})
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memcache',
				operation: 'set',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			await this.ensureConnected()
			const fullKey = this.buildKey(key)

			return new Promise((resolve, reject) => {
				this.client!.del(fullKey, (err) => (err ? reject(err) : resolve(true)))
			})
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memcache',
				operation: 'delete',
				details: { key },
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	async clear(): Promise<void> {
		try {
			await this.ensureConnected()
			return new Promise((resolve, reject) => {
				this.client!.flush((err) => (err ? reject(err) : resolve()))
			})
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_OPERATION_TIMEOUT, {
				adapter: 'memcache',
				operation: 'clear',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	async isAlive(): Promise<HealthCheckResponse> {
		try {
			await this.ping()
			return { isAlive: true, adapter: 'memcache', timestamp: new Date() }
		} catch (error) {
			return {
				isAlive: false,
				adapter: 'memcache',
				timestamp: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	async close(): Promise<void> {
		try {
			this.client?.end()
			this.client = null
			this.isConnected = false
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_ERROR, {
				adapter: 'memcache',
				operation: 'close',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}
}
