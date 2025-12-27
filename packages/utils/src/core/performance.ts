import { getPackageVersion } from "./version"

// Performance optimization utilities
export interface PerformanceConfig {
	enableCaching?: boolean
	maxCacheSize?: number
	enableValidation?: boolean
}

const defaultConfig: PerformanceConfig = {
	enableCaching: false,
	maxCacheSize: 100,
	enableValidation: true,
}

let config: PerformanceConfig = { ...defaultConfig }

export function setPerformanceConfig(
	newConfig: Partial<PerformanceConfig>,
): void {
	const oldMaxSize = config.maxCacheSize
	config = { ...config, ...newConfig }

	// Recreate cache if maxCacheSize changed
	if (cache && oldMaxSize !== config.maxCacheSize) {
		cache = new LRUCache(config.maxCacheSize)
	}
}

export function getPerformanceConfig(): PerformanceConfig {
	return { ...config }
}

// Simple LRU cache for expensive operations
export class LRUCache<K, V> {
	private cache = new Map<K, V>()
	private maxSize: number

	constructor(maxSize = 100) {
		this.maxSize = maxSize
	}

	get(key: K): V | undefined {
		const value = this.cache.get(key)
		if (value !== undefined) {
			// Move to end (most recently used)
			this.cache.delete(key)
			this.cache.set(key, value)
		}
		return value
	}

	set(key: K, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key)
		} else if (this.cache.size >= this.maxSize) {
			// Remove least recently used (first item)
			const firstKey = this.cache.keys().next().value
			if (firstKey !== undefined) {
				this.cache.delete(firstKey)
			}
		}
		this.cache.set(key, value)
	}

	clear(): void {
		this.cache.clear()
	}
}

let cache: LRUCache<string, any> | null = null

function getOrCreateCache(): LRUCache<string, any> {
	if (!cache) {
		cache = new LRUCache(config.maxCacheSize)
	}
	return cache
}


export function makeInternalCacheKey(
	domain: string,
	key: string | number,
): string {
	const INTERNAL_CACHE_PREFIX = '@js-ext' + getPackageVersion();
	return `${INTERNAL_CACHE_PREFIX}:${domain}:${key}`;
}

export function withCache<T>(key: string, fn: () => T): T {
	if (!config.enableCaching) {
		return fn()
	}

	const currentCache = getOrCreateCache()
	const cached = currentCache.get(key)
	if (cached !== undefined) {
		return cached as T
	}

	const result = fn()
	currentCache.set(key, result)
	return result
}
