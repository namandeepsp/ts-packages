// Extension initialization logic
import { extendArray } from '../array'
import { setPerformanceConfig } from '../core/performance'
import { extendNumber } from '../number'
import { extendObject } from '../object'
import { extendString } from '../string'

import type { ExtensionOptions } from '../types/extension-types'

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
