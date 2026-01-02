import type { ExtensionOptions } from '../types/extensionTypes.js'

export function validateExtensionOptions(
	options: Partial<ExtensionOptions>,
): ExtensionOptions {
	const validated: ExtensionOptions = {
		string: options.string !== false,
		array: options.array !== false,
		object: options.object !== false,
		number: options.number !== false,
		performance: options.performance,
	}

	return validated
}

export function createExtensionOptions(
	enableString = true,
	enableArray = true,
	enableObject = true,
	enableNumber = true,
	performanceConfig?: any,
): ExtensionOptions {
	return {
		string: enableString,
		array: enableArray,
		object: enableObject,
		number: enableNumber,
		performance: performanceConfig,
	}
}
