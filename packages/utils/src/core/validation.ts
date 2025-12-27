// Validation utilities for extensions
export function validateExtensionInput(
	value: any,
	type: string,
	methodName: string,
): void {
	if (value == null) {
		throw new TypeError(`Cannot call ${methodName} on ${value}`)
	}

	const actualType = typeof value
	if (actualType !== type) {
		throw new TypeError(
			`${methodName} can only be called on ${type} values, got ${actualType}`,
		)
	}
}

export function validateArrayInput<T>(arr: T[], methodName: string): void {
	if (!Array.isArray(arr)) {
		throw new TypeError(`${methodName} can only be called on arrays`)
	}
}

export function validateNumberRange(
	num: number,
	min: number,
	max: number,
	methodName: string,
): void {
	if (num < min || num > max) {
		throw new RangeError(
			`${methodName}: number must be between ${min} and ${max}, got ${num}`,
		)
	}
}

export function validatePositiveInteger(num: number, methodName: string): void {
	if (!Number.isInteger(num) || num < 0) {
		throw new TypeError(`${methodName}: expected positive integer, got ${num}`)
	}
}
