/**
 * Utils package exports
 * @packageDocumentation
 */

// Export configuration utilities
export {
	validateConfig,
	validatePerformanceSettings,
	mergeConfigs,
} from './config.js'

// Export helper utilities
export {
	isValidArrayIndex,
	ensurePositiveInteger,
	safeClone,
	getPathSegments,
	hasOwnProperty,
} from './helpers.js'

// Export extension utilities
export { defineExtension } from './defineExtension.js'

// Export timeout utilities
export {
	TimeoutManager,
	withTimeout,
} from './timeout.js'

// Export pool utilities
export {
	GenericPool,
	PoolManager,
} from './pool.js'
export type {
	PoolConfig,
	Connection,
} from './pool.js'

// Export compression utilities
export {
	Compression,
	compress,
	decompress,
	compressWithMetrics,
	CompressionAlgorithm,
	type CompressionResult,
	type CompressionOptions,
} from './compression.js'
