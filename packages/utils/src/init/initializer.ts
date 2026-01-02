import { extendArray } from '../array/arrayExtensions.js'
import { setPerformanceConfig } from '../core/performance.js'
import { extendNumber } from '../number/numberExtensions.js'
import { extendObject } from '../object/objectExtensions.js'
import { extendString } from '../string/stringExtensions.js'
import type { ExtensionOptions } from '../types/extensionTypes.js'

export function initExtensions(options: ExtensionOptions = {}): void {
	const {
		string = true,
		array = true,
		object = true,
		number = true,
		performance,
	} = options

	if (performance) {
		// Set performance config if provided
		setPerformanceConfig(performance)
	}

	if (string) extendString()
	if (array) extendArray()
	if (object) extendObject()
	if (number) extendNumber()
}

export function extendAll(): void {
	initExtensions()
}
