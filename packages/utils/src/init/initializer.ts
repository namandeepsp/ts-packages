import { extendArray } from "../array/index.js"
import { setPerformanceConfig } from "../core/index.js"
import { extendNumber } from "../number/index.js"
import { extendObject } from "../object/index.js"
import { extendString } from "../string/index.js"
import type { ExtensionOptions } from "../types/index.js"


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
