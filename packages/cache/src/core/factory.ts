import { MemcacheCache } from '../adapters/memcache'
import { MemoryCache } from '../adapters/memory'
import { RedisCache } from '../adapters/redis'
import { CacheError } from '../errors'

import type {
	CacheConfig,
	MemcacheCacheConfig,
	MemoryCacheConfig,
	RedisCacheConfig,
} from '../types'
import type { ICache } from './interfaces'

/**
 * Factory for creating cache instances
 */
export class CacheFactory {
	/**
	 * Create a cache instance based on configuration
	 */
	static create<T = unknown>(config: CacheConfig): ICache<T> {
		switch (config.adapter) {
			case 'redis':
				const redisConfig = config as RedisCacheConfig

				// Validate: can't use both single + cluster
				if (redisConfig.host && redisConfig.cluster) {
					throw new CacheError(
						'Cannot specify both host and cluster config',
						'INVALID_CONFIG',
					)
				}

				// Require either single or cluster
				if (!redisConfig.host && !redisConfig.cluster) {
					throw new CacheError(
						'Redis requires either host or cluster config',
						'INVALID_CONFIG',
					)
				}
				return new RedisCache<T>(redisConfig)

			case 'memcache':
				return new MemcacheCache<T>(config as MemcacheCacheConfig)

			case 'memory':
				return new MemoryCache<T>(config as MemoryCacheConfig)

			default:
				throw new CacheError(
					`Unknown cache adapter: ${config.adapter}`,
					'UNKNOWN_ADAPTER',
				)
		}
	}

	/**
	 * Create a cache with fallback support
	 * If primary adapter fails to connect, falls back to memory cache
	 */
	static async createWithFallback<T = unknown>(
		config: CacheConfig,
	): Promise<ICache<T>> {
		const cache = this.create<T>(config)

		// Check if primary cache is alive
		const health = await cache.isAlive()

		if (health.isAlive) {
			return cache
		}

		// If primary cache failed and fallback is enabled, use memory cache
		if (config.fallback !== false) {
			console.warn(
				`Failed to connect to ${config.adapter} cache, falling back to memory cache`,
			)

			return new MemoryCache<T>({
				adapter: 'memory',
				namespace: config.namespace,
				ttl: config.ttl,
			})
		}

		// No fallback, throw error
		throw new CacheError(
			`Failed to initialize ${config.adapter} cache and fallback is disabled`,
			'CACHE_INIT_ERROR',
		)
	}
}
