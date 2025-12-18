// Object prototype extensions

export function extendObject() {
	Object.prototype.isEmpty = function (): boolean {
		return Object.keys(this).length === 0
	}

	Object.prototype.pick = function <
		T extends Record<string, any>,
		K extends keyof T,
	>(keys: K[]): Pick<T, K> {
		if (this === null || this === undefined) {
			throw new TypeError('pick: cannot be called on null or undefined')
		}
		if (!Array.isArray(keys)) {
			throw new TypeError(`pick: keys must be an array, got ${typeof keys}`)
		}
		if (keys.length === 0) {
			throw new TypeError('pick: keys array cannot be empty')
		}

		const result = {} as Pick<T, K>
		const obj = this as T
		keys.forEach((key) => {
			if (key in obj) {
				result[key] = obj[key]
			}
		})
		return result
	}

	Object.prototype.omit = function <
		T extends Record<string, any>,
		K extends keyof T,
	>(keys: K[]): Omit<T, K> {
		if (this === null || this === undefined) {
			throw new TypeError('omit: cannot be called on null or undefined')
		}
		if (!Array.isArray(keys)) {
			throw new TypeError(`omit: keys must be an array, got ${typeof keys}`)
		}
		if (keys.length === 0) {
			throw new TypeError('omit: keys array cannot be empty')
		}

		const result = { ...this } as T
		keys.forEach((key) => {
			delete result[key]
		})
		return result as Omit<T, K>
	}

	Object.prototype.deepClone = function <T>(): T {
		// Create a more robust cache key using WeakMap for cycle detection
		const cloneId = Symbol('clone')

		// Simple cycle detection without caching key generation
		if (this === null || typeof this !== 'object') return this

		// Handle Date objects
		if (this instanceof Date) return new Date(this.getTime()) as unknown as T

		// Handle Array objects
		if (Array.isArray(this)) {
			return this.map((item) => {
				if (
					item &&
					typeof item === 'object' &&
					typeof (item as any).deepClone === 'function'
				) {
					return (item as any).deepClone()
				}
				return item
			}) as unknown as T
		}

		// Handle regular objects with better cycle detection
		const visited = new WeakSet()

		function deepCloneSafe(obj: any): any {
			if (obj === null || typeof obj !== 'object') return obj

			if (visited.has(obj)) {
				throw new Error('Circular reference detected in deepClone')
			}

			visited.add(obj)

			if (obj instanceof Date) return new Date(obj.getTime())
			if (Array.isArray(obj)) return obj.map((item) => deepCloneSafe(item))

			const cloned = {} as Record<string, unknown>
			Object.keys(obj).forEach((key) => {
				cloned[key] = deepCloneSafe(obj[key])
			})

			return cloned
		}

		return deepCloneSafe(this) as T
	}

	Object.prototype.merge = function <T extends Record<string, unknown>>(
		other: Partial<T>,
	): T {
		return { ...this, ...other } as T
	}

	Object.prototype.deepFreeze = function <T>(): T {
		const propNames = Object.getOwnPropertyNames(this)
		for (const name of propNames) {
			const value = (this as any)[name]
			if (value && typeof value === 'object') {
				value.deepFreeze()
			}
		}
		return Object.freeze(this) as T
	}

	Object.prototype.hasPath = function (path: string): boolean {
		if (typeof path !== 'string') {
			throw new TypeError(`hasPath: path must be a string, got ${typeof path}`)
		}
		if (path.trim() === '') {
			throw new TypeError('hasPath: path cannot be empty or whitespace')
		}

		const keys = path.split('.')
		let current: any = this
		for (const key of keys) {
			if (current == null || !(key in current)) return false
			current = current[key]
		}
		return true
	}

	Object.prototype.getPath = function (path: string, defaultValue?: any): any {
		if (typeof path !== 'string') {
			throw new TypeError(`getPath: path must be a string, got ${typeof path}`)
		}
		if (path.trim() === '') {
			throw new TypeError('getPath: path cannot be empty or whitespace')
		}

		const keys = path.split('.')
		let current: any = this
		for (const key of keys) {
			if (current == null || !(key in current)) return defaultValue
			current = current[key]
		}
		return current
	}

	Object.prototype.setPath = function (path: string, value: any): any {
		if (typeof path !== 'string') {
			throw new TypeError(`setPath: path must be a string, got ${typeof path}`)
		}
		if (path.trim() === '') {
			throw new TypeError('setPath: path cannot be empty or whitespace')
		}

		const keys = path.split('.')
		let current: any = this
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i]
			if (!(key in current) || typeof current[key] !== 'object') {
				current[key] = {}
			}
			current = current[key]
		}
		current[keys[keys.length - 1]] = value
		return this
	}
}
