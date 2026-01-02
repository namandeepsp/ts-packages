// Re-export all utilities
export {
	validateConfig,
	validatePerformanceSettings,
	mergeConfigs,
} from './config.js'

export {
	isValidArrayIndex,
	ensurePositiveInteger,
	safeClone,
	getPathSegments,
	hasOwnProperty,
} from './helpers.js'

export { defineExtension } from './defineExtension.js'
