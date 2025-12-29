export { }

declare global {
	// ─────────────────────────────────────────────────────────────
	// String extensions
	// ─────────────────────────────────────────────────────────────
	interface String {
		toCapitalize(): string
		toCamelCase(): string
		toKebabCase(): string
		toSnakeCase(): string

		truncate(length: number, suffix?: string): string
		truncateWords(count: number, suffix?: string): string

		toTitleCase(): string
		capitalizeWords(): string
		reverseWords(): string

		isEmail(): boolean
		isUrl(): boolean
		isPalindrome(): boolean

		removeWhitespace(): string
		stripHtml(): string

		padStart(targetLength: number, padString?: string): string
		padEnd(targetLength: number, padString?: string): string

		count(substring: string): number
		words(): string[]
		lines(): string[]

		reverse(): string
		slugify(): string
	}

	// ─────────────────────────────────────────────────────────────
	// Number extensions
	// ─────────────────────────────────────────────────────────────
	interface Number {
		toPercent(decimals?: number): string
		toCurrency(currency?: string, locale?: string): string

		clamp(min: number, max: number): number
		inRange(min: number, max: number): boolean

		isEven(): boolean
		isOdd(): boolean
		isPrime(): boolean

		factorial(): number
		toOrdinal(): string
		toRoman(): string

		round(decimals?: number): number
		ceil(decimals?: number): number
		floor(decimals?: number): number
		toFixedNumber(decimals?: number): number

		abs(): number
		sign(): number

		times(callback: (index: number) => void): void
		randomUpTo(): number
	}

	// ─────────────────────────────────────────────────────────────
	// Array extensions
	// ─────────────────────────────────────────────────────────────
	interface Array<T> {
		unique(): T[]
		uniqueBy<K>(keyFn: (item: T) => K): T[]

		shuffle(): T[]
		chunk(size: number): T[][]

		groupBy<K extends string | number>(
			keyFn: (item: T) => K,
		): Record<K, T[]>

		sum(): number
		average(): number

		compact(): T[]
		compactTruthy(): T[]

		pluck<K extends keyof T>(key: K): T[K][]

		findLast(predicate: (item: T) => boolean): T | undefined
		partition(predicate: (item: T) => boolean): [T[], T[]]

		flatten(depth?: number): any[]
		deepFlatten(): any[]

		difference(other: T[]): T[]
		intersection(other: T[]): T[]
		union(other: T[]): T[]

		sample(): T | undefined
		take(count: number): T[]
		drop(count: number): T[]

		sortBy(keyFn: (item: T) => any): T[]
		last(): T | undefined
	}

	// ─────────────────────────────────────────────────────────────
	// Object extensions
	// ─────────────────────────────────────────────────────────────
	interface Object {
		isEmpty(): boolean

		pick<T extends Record<string, any>, K extends keyof T>(
			keys: K[],
		): Pick<T, K>

		omit<T extends Record<string, any>, K extends keyof T>(
			keys: K[],
		): Omit<T, K>

		merge<T extends object>(other: Partial<T>): T
		deepClone<T>(): T
		deepFreeze<T>(): T

		hasPath(path: string): boolean
		getPath(path: string, defaultValue?: any): any
		setPath(path: string, value: any): this

		mapValues<T extends Record<string, any>>(
			fn: (value: T[keyof T], key: keyof T) => any,
		): Record<string, any>

		mapKeys<T extends Record<string, any>>(
			fn: (key: keyof T) => string | number | symbol,
		): Record<string, any>

		filterKeys<T extends Record<string, any>>(
			keys: (keyof T)[],
		): Partial<T>

		filterValues<T extends Record<string, any>>(
			fn: (value: T[keyof T], key: keyof T) => boolean,
		): Partial<T>
	}
}
