// Import types first
import '../types/global-augmentations'

import { extendArray } from './array'
import { extendNumber } from './number'

import { extendObject } from './object'
// Import extension modules
import { extendString } from './string'

// Import core utilities
import {
	LRUCache,
	getPerformanceConfig,
	setPerformanceConfig,
	withCache,
} from './core/performance'

// Import validation utilities
import {
	validateArrayInput,
	validateExtensionInput,
	validateNumberRange,
	validatePositiveInteger,
} from './core/validation'

// Import utility functions
import {
	mergeConfigs,
	validateConfig,
	validatePerformanceSettings,
} from './utils/config'

import {
	ensurePositiveInteger,
	getPathSegments,
	hasOwnProperty,
	isValidArrayIndex,
	safeClone,
} from './utils/helpers'

// Re-export types
import { ExtensionOptions, PerformanceConfig } from './types/extension-types'
export { ExtensionOptions, PerformanceConfig }

// Export withCache for use in extensions
export { withCache }

// Import initialization functions
import { extendAll, initExtensions } from './init/initializer'

/**
 * Initialize JavaScript prototype extensions
 * @param options - Configure which extensions to enable (default: all enabled)
 */
export function initializeExtensions(options: ExtensionOptions = {}): void {
	initExtensions(options)
}

/**
 * Initialize all extensions (convenience function)
 */
export { extendAll }

/**
 * Selective prototype extension helpers
 * Initialize only specific extensions
 */
export const extend = {
	string: extendString,
	array: extendArray,
	object: extendObject,
	number: extendNumber,
}

// Export validation utilities
export {
	validateExtensionInput,
	validateArrayInput,
	validateNumberRange,
	validatePositiveInteger,
}

// Export utility functions
export {
	validateConfig,
	validatePerformanceSettings,
	mergeConfigs,
	isValidArrayIndex,
	ensurePositiveInteger,
	safeClone,
	getPathSegments,
	hasOwnProperty,
}

// Export performance utilities
export { LRUCache, setPerformanceConfig, getPerformanceConfig }

// Default export
export default {
	initializeExtensions,
	extendAll,
	extend,
	LRUCache,
	setPerformanceConfig,
	getPerformanceConfig,
	// Validation utilities
	validateExtensionInput,
	validateArrayInput,
	validateNumberRange,
	validatePositiveInteger,
	// Utility functions
	validateConfig,
	validatePerformanceSettings,
	mergeConfigs,
	isValidArrayIndex,
	ensurePositiveInteger,
	safeClone,
	getPathSegments,
	hasOwnProperty,
}
