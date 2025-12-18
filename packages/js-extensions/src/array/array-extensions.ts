// Array prototype extensions
export function extendArray() {
	Array.prototype.unique = function <T>(): T[] {
		return [...new Set(this)]
	}

	Array.prototype.shuffle = function <T>(): T[] {
		const arr = [...this]
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[j]] = [arr[j], arr[i]]
		}
		return arr
	}

	Array.prototype.chunk = function <T>(size: number): T[][] {
		if (!Number.isInteger(size) || size <= 0) {
			throw new TypeError(`chunk: size must be a positive integer, got ${size}`)
		}
		const chunks: T[][] = []
		for (let i = 0; i < this.length; i += size) {
			chunks.push(this.slice(i, i + size))
		}
		return chunks
	}

	Array.prototype.groupBy = function <T>(
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
	}

	Array.prototype.sum = function (): number {
		const numbers = this.filter((item) => typeof item === 'number')
		if (numbers.length === 0) {
			throw new TypeError('sum: array must contain at least one number')
		}
		return numbers.reduce((sum, num) => sum + num, 0)
	}

	Array.prototype.average = function (): number {
		const numbers = this.filter((item) => typeof item === 'number')
		if (numbers.length === 0) {
			throw new TypeError('average: array must contain at least one number')
		}
		return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
	}

	Array.prototype.compact = function <T>(): T[] {
		return this.filter((item) => item != null && item !== '' && item !== false)
	}

	Array.prototype.pluck = function <T, K extends keyof T>(key: K): T[K][] {
		if (
			typeof key !== 'string' &&
			typeof key !== 'number' &&
			typeof key !== 'symbol'
		) {
			throw new TypeError(
				`pluck: key must be a string, number, or symbol, got ${typeof key}`,
			)
		}

		return this.map((item) =>
			item && typeof item === 'object' ? item[key] : undefined,
		).filter((val) => val !== undefined)
	}

	Array.prototype.findLast = function <T>(
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
	}

	Array.prototype.partition = function <T>(
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
	}

	Array.prototype.flatten = function (depth = 1): any[] {
		return depth > 0
			? this.reduce(
					(acc: any[], val) =>
						acc.concat(Array.isArray(val) ? val.flatten(depth - 1) : val),
					[],
				)
			: this.slice()
	}

	Array.prototype.deepFlatten = function (): any[] {
		return this.reduce(
			(acc: any[], val) =>
				acc.concat(Array.isArray(val) ? val.deepFlatten() : val),
			[],
		)
	}

	Array.prototype.difference = function <T>(other: T[]): T[] {
		if (!Array.isArray(other)) {
			throw new TypeError(
				`difference: other must be an array, got ${typeof other}`,
			)
		}

		return this.filter((item) => !other.includes(item))
	}

	Array.prototype.intersection = function <T>(other: T[]): T[] {
		if (!Array.isArray(other)) {
			throw new TypeError(
				`intersection: other must be an array, got ${typeof other}`,
			)
		}

		return this.filter((item) => other.includes(item))
	}

	Array.prototype.union = function <T>(other: T[]): T[] {
		if (!Array.isArray(other)) {
			throw new TypeError(`union: other must be an array, got ${typeof other}`)
		}

		return [...new Set([...this, ...other])]
	}

	Array.prototype.sample = function <T>(): T | undefined {
		return this.length > 0
			? this[Math.floor(Math.random() * this.length)]
			: undefined
	}

	Array.prototype.take = function <T>(count: number): T[] {
		return this.slice(0, Math.max(0, count))
	}

	Array.prototype.drop = function <T>(count: number): T[] {
		return this.slice(Math.max(0, count))
	}
}
