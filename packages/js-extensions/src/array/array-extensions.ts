import { defineExtension } from "src/utils"

let arrayExtended = false

export function extendArray() {
	if (arrayExtended) return
	arrayExtended = true

	defineExtension(
		Array.prototype,
		'unique',
		function <T>(this: readonly T[]): T[] {
			return [...new Set(this)]
		},
	)

	defineExtension(
		Array.prototype,
		'shuffle',
		function <T>(this: readonly T[]): T[] {
			const arr = [...this]
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
					;[arr[i], arr[j]] = [arr[j], arr[i]]
			}
			return arr
		},
	)

	defineExtension(
		Array.prototype,
		'chunk',
		function <T>(this: readonly T[], size: number): T[][] {
			if (!Number.isInteger(size) || size <= 0) {
				throw new TypeError(`chunk: size must be a positive integer, got ${size}`)
			}
			const chunks: T[][] = []
			for (let i = 0; i < this.length; i += size) {
				chunks.push(this.slice(i, i + size))
			}
			return chunks
		},
	)

	defineExtension(
		Array.prototype,
		'groupBy',
		function <T>(
			this: readonly T[],
			keyFn: (item: T) => string | number,
		): Record<string | number, T[]> {
			if (typeof keyFn !== 'function') {
				throw new TypeError(
					`groupBy: keyFn must be a function, got ${typeof keyFn}`,
				)
			}

			return this.reduce(
				(groups, item) => {
					const key = keyFn(item)
					if (!groups[key]) groups[key] = []
					groups[key].push(item)
					return groups
				},
				{} as Record<string | number, T[]>,
			)
		},
	)

	defineExtension(
		Array.prototype,
		'sum',
		function (this: readonly number[]): number {
			if (this.length === 0) {
				throw new TypeError('sum: array must contain at least one number')
			}
			return this.reduce((sum, num) => sum + num, 0)
		},
	)

	defineExtension(
		Array.prototype,
		'average',
		function (this: readonly number[]): number {
			if (this.length === 0) {
				throw new TypeError('average: array must contain at least one number')
			}
			return this.reduce((sum, num) => sum + num, 0) / this.length
		},
	)

	defineExtension(
		Array.prototype,
		'compact',
		function <T>(this: readonly T[]): T[] {
			return this.filter(
				(item) => item !== null && item !== undefined && item !== '',
			)
		},
	)

	defineExtension(
		Array.prototype,
		'compactTruthy',
		function <T>(this: readonly T[]): T[] {
			return this.filter(Boolean)
		},
	)

	defineExtension(
		Array.prototype,
		'pluck',
		function <T extends Record<PropertyKey, any>, K extends keyof T>(
			this: readonly T[],
			key: K,
		): T[K][] {
			return this
				.map((item) => item[key])
				.filter((val): val is T[K] => val !== undefined)
		},
	)


	defineExtension(
		Array.prototype,
		'findLast',
		function <T>(
			this: readonly T[],
			predicate: (item: T) => boolean,
		): T | undefined {
			if (typeof predicate !== 'function') {
				throw new TypeError(
					`findLast: predicate must be a function, got ${typeof predicate}`,
				)
			}

			for (let i = this.length - 1; i >= 0; i--) {
				if (predicate(this[i])) return this[i]
			}
			return undefined
		},
	)

	defineExtension(
		Array.prototype,
		'partition',
		function <T>(
			this: readonly T[],
			predicate: (item: T) => boolean,
		): [T[], T[]] {
			if (typeof predicate !== 'function') {
				throw new TypeError(
					`partition: predicate must be a function, got ${typeof predicate}`,
				)
			}

			const truthy: T[] = []
			const falsy: T[] = []

			this.forEach((item) =>
				predicate(item) ? truthy.push(item) : falsy.push(item),
			)

			return [truthy, falsy]
		},
	)

	defineExtension(
		Array.prototype,
		'flatten',
		function (this: readonly any[], depth = 1): any[] {
			return depth > 0
				? this.reduce(
					(acc: any[], val) =>
						acc.concat(
							Array.isArray(val) ? val.flatten(depth - 1) : val,
						),
					[],
				)
				: this.slice()
		},
	)

	defineExtension(
		Array.prototype,
		'deepFlatten',
		function (this: readonly any[]): any[] {
			return this.reduce(
				(acc: any[], val) =>
					acc.concat(Array.isArray(val) ? val.deepFlatten() : val),
				[],
			)
		},
	)

	defineExtension(
		Array.prototype,
		'difference',
		function <T>(this: readonly T[], other: T[]): T[] {
			if (!Array.isArray(other)) {
				throw new TypeError(
					`difference: other must be an array, got ${typeof other}`,
				)
			}
			return this.filter((item) => !other.includes(item))
		},
	)

	defineExtension(
		Array.prototype,
		'intersection',
		function <T>(this: readonly T[], other: T[]): T[] {
			if (!Array.isArray(other)) {
				throw new TypeError(
					`intersection: other must be an array, got ${typeof other}`,
				)
			}
			return this.filter((item) => other.includes(item))
		},
	)

	defineExtension(
		Array.prototype,
		'union',
		function <T>(this: readonly T[], other: T[]): T[] {
			if (!Array.isArray(other)) {
				throw new TypeError(`union: other must be an array, got ${typeof other}`)
			}
			return [...new Set([...this, ...other])]
		},
	)

	defineExtension(
		Array.prototype,
		'sample',
		function <T>(this: readonly T[]): T | undefined {
			return this.length > 0
				? this[Math.floor(Math.random() * this.length)]
				: undefined
		},
	)

	defineExtension(
		Array.prototype,
		'take',
		function <T>(this: readonly T[], count: number): T[] {
			return this.slice(0, Math.max(0, count))
		},
	)

	defineExtension(
		Array.prototype,
		'drop',
		function <T>(this: readonly T[], count: number): T[] {
			return this.slice(Math.max(0, count))
		},
	)

	defineExtension(Array.prototype, 'uniqueBy', function <T, K>(this: readonly T[], keyFn: (item: T) => K): T[] {
		if (typeof keyFn !== 'function') {
			throw new TypeError(`uniqueBy: keyFn must be a function, got ${typeof keyFn}`);
		}
		const seen = new Set<K>();
		const result: T[] = [];
		for (const item of this) {
			const key = keyFn(item);
			if (!seen.has(key)) {
				seen.add(key);
				result.push(item);
			}
		}
		return result;
	});

	defineExtension(Array.prototype, 'sortBy', function <T>(this: readonly T[], keyFn: (item: T) => any): T[] {
		if (typeof keyFn !== 'function') {
			throw new TypeError(`sortBy: keyFn must be a function, got ${typeof keyFn}`);
		}
		return [...this].sort((a, b) => {
			const aVal = keyFn(a);
			const bVal = keyFn(b);
			if (aVal < bVal) return -1;
			if (aVal > bVal) return 1;
			return 0;
		});
	});

	defineExtension(Array.prototype, 'last', function <T>(this: readonly T[]): T | undefined {
		return this.length > 0 ? this[this.length - 1] : undefined;
	});

}
