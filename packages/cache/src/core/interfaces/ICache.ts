import type {
	BatchResult,
	CacheStats,
	HealthCheckResponse,
} from '../../types.js'

/**
 * Main cache interface - defines all cache operations
 */
export interface ICache<T = unknown> {
	/**
	 * Get a value from cache
	 */
	get(key: string): Promise<T | null>

	/**
	 * Set a value in cache
	 */
	set(key: string, value: T, ttl?: number): Promise<void>

	/**
	 * Delete a value from cache
	 */
	delete(key: string): Promise<boolean>

	/**
	 * Check if key exists
	 */
	exists(key: string): Promise<boolean>

	/**
	 * Clear all cache entries
	 */
	clear(): Promise<void>

	/**
	 * Get multiple values at once
	 */
	getMultiple(keys: string[]): Promise<BatchResult<T>>

	/**
	 * Set multiple values at once
	 */
	setMultiple(data: Record<string, T>, ttl?: number): Promise<void>

	/**
	 * Delete multiple keys at once
	 */
	deleteMultiple(keys: string[]): Promise<number>

	/**
	 * Increment a numeric value
	 */
	increment(key: string, amount?: number): Promise<number>

	/**
	 * Decrement a numeric value
	 */
	decrement(key: string, amount?: number): Promise<number>

	/**
	 * Get cache statistics
	 */
	getStats?(): Promise<CacheStats>

	/**
	 * Check cache health
	 */
	isAlive(): Promise<HealthCheckResponse>

	/**
	 * Close/disconnect cache connection
	 */
	close(): Promise<void>
}
