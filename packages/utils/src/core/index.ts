// Re-export core utilities
export {
	validateExtensionInput,
	validateArrayInput,
	validateNumberRange,
	validatePositiveInteger,
} from './validation.js'

export {
	type PerformanceConfig,
	setPerformanceConfig,
	getPerformanceConfig,
	LRUCache,
	makeInternalCacheKey,
	withCache,
} from './performance.js'

export { getPackageVersion } from './version.js'
