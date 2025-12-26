import { CACHE_ERROR_CODES } from 'src/errors/cacheErrorCodes'
import { CacheError } from '../errors'

import type {
	BatchResult,
	CacheConfig,
	CacheStats,
	HealthCheckResponse,
} from '../types'
import type { ICache } from './interfaces'

/**
 * Abstract base class for all cache adapters
 */
export abstract class BaseCache<T = unknown> implements ICache<T> {
	protected readonly namespace: string
	protected readonly ttl: number
	protected stats: CacheStats = {
		hits: 0,
		misses: 0,
		sets: 0,
		deletes: 0,
	}

	constructor(protected config: CacheConfig) {
		this.namespace = config.namespace ? `${config.namespace}:` : ''
		this.ttl = config.ttl ?? 3600 // 1 hour default
	}

	/**
	 * Build full key with namespace prefix
	 */
	protected buildKey(key: string): string {
		return `${this.namespace}${key}`
	}

	/**
	 * Deserialize string to object
	 */
	protected deserialize(data: string): T {
		try {
			return JSON.parse(data)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_DESERIALIZE_ERROR, {
				adapter: this.config.adapter,
				operation: 'deserialize',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Serialize object to string
	 */
	protected serialize(value: T): string {
		try {
			return JSON.stringify(value)
		} catch (error) {
			throw new CacheError(CACHE_ERROR_CODES.CACHE_SERIALIZE_ERROR, {
				adapter: this.config.adapter,
				operation: 'serialize',
				cause: error instanceof Error ? error : undefined,
			})
		}
	}

	/**
	 * Track cache hit
	 */
	protected recordHit(): void {
		this.stats.hits++
	}

	/**
	 * Track cache miss
	 */
	protected recordMiss(): void {
		this.stats.misses++
	}

	/**
	 * Track cache set
	 */
	protected recordSet(): void {
		this.stats.sets++
	}

	/**
	 * Track cache delete
	 */
	protected recordDelete(): void {
		this.stats.deletes++
	}

	/**
	 * Reset statistics
	 */
	protected resetStats(): void {
		this.stats = {
			hits: 0,
			misses: 0,
			sets: 0,
			deletes: 0,
		}
	}

	/**
	 * Get cache statistics
	 */
	async getStats(): Promise<CacheStats> {
		return { ...this.stats }
	}

	/**
	 * Abstract methods - must be implemented by subclasses
	 */
	abstract get(key: string): Promise<T | null>
	abstract set(key: string, value: T, ttl?: number): Promise<void>
	abstract delete(key: string): Promise<boolean>
	abstract exists(key: string): Promise<boolean>
	abstract clear(): Promise<void>
	abstract isAlive(): Promise<HealthCheckResponse>
	abstract close(): Promise<void>

	/**
	 * Default implementation for getMultiple
	 */
	async getMultiple(keys: string[]): Promise<BatchResult<T>> {
		const result: BatchResult<T> = {}
		for (const key of keys) {
			result[key] = await this.get(key)
		}
		return result
	}

	/**
	 * Default implementation for setMultiple
	 */
	async setMultiple(data: Record<string, T>, ttl?: number): Promise<void> {
		for (const [key, value] of Object.entries(data)) {
			await this.set(key, value, ttl)
		}
	}

	/**
	 * Default implementation for deleteMultiple
	 */
	async deleteMultiple(keys: string[]): Promise<number> {
		let count = 0
		for (const key of keys) {
			const deleted = await this.delete(key)
			if (deleted) count++
		}
		return count
	}

	/**
	 * Default implementation for increment
	 */
	async increment(key: string, amount = 1): Promise<number> {
		const current = await this.get(key)
		const value = (typeof current === 'number' ? current : 0) + amount
		await this.set(key, value as T)
		return value
	}

	/**
	 * Default implementation for decrement
	 */
	async decrement(key: string, amount = 1): Promise<number> {
		const current = await this.get(key)
		const value = (typeof current === 'number' ? current : 0) - amount
		await this.set(key, value as T)
		return value
	}
}
