import { defineExtension } from "src/utils"


let objectExtended = false

export function extendObject() {
	if (objectExtended) return
	objectExtended = true

	defineExtension(Object.prototype, 'isEmpty', function (this: object): boolean {
		return Object.keys(this).length === 0
	})

	defineExtension(Object.prototype, 'pick', function <T extends Record<string, any>, K extends keyof T>(this: T, keys: K[]): Pick<T, K> {
		if (!Array.isArray(keys)) throw new TypeError('pick: keys must be an array')
		if (!keys.length) throw new TypeError('pick: keys array cannot be empty')
		const result = {} as Pick<T, K>
		keys.forEach((key) => {
			if (key in this) result[key] = this[key]
		})
		return result
	})

	defineExtension(Object.prototype, 'omit', function <T extends Record<string, any>, K extends keyof T>(this: T, keys: K[]): Omit<T, K> {
		if (!Array.isArray(keys)) throw new TypeError('omit: keys must be an array')
		if (!keys.length) throw new TypeError('omit: keys array cannot be empty')
		const result = { ...this }
		keys.forEach((key) => delete result[key])
		return result
	})

	defineExtension(Object.prototype, 'deepClone', function <T>(this: T): T {
		const visited = new WeakSet()
		function deepCloneSafe(obj: any): any {
			if (obj === null || typeof obj !== 'object') return obj
			if (visited.has(obj)) throw new Error('Circular reference detected in deepClone')
			visited.add(obj)
			if (obj instanceof Date) return new Date(obj.getTime())
			if (Array.isArray(obj)) return obj.map((item) => deepCloneSafe(item))
			const cloned: Record<string, unknown> = {}
			Object.keys(obj).forEach((key) => {
				cloned[key] = deepCloneSafe(obj[key])
			})
			return cloned
		}
		return deepCloneSafe(this)
	})

	defineExtension(Object.prototype, 'merge', function <T extends object>(this: T, other: Partial<T>): T {
		return { ...this, ...other }
	})

	defineExtension(Object.prototype, 'deepFreeze', function <T>(this: T): T {
		Object.getOwnPropertyNames(this).forEach((name) => {
			const value = (this as any)[name]
			if (value && typeof value === 'object') value.deepFreeze?.()
		})
		return Object.freeze(this)
	})

	defineExtension(Object.prototype, 'hasPath', function (this: object, path: string): boolean {
		if (!path.trim()) throw new TypeError('hasPath: path cannot be empty')
		return path.split('.').every((key) => {
			if (this == null || !(key in this)) return false
			// @ts-ignore
			this = this[key]
			return true
		})
	})

	defineExtension(Object.prototype, 'getPath', function (this: object, path: string, defaultValue?: any): any {
		if (!path.trim()) throw new TypeError('getPath: path cannot be empty')
		return path.split('.').reduce((acc: any, key) => (acc && key in acc ? acc[key] : defaultValue), this as any)
	})

	defineExtension(Object.prototype, 'setPath', function (this: object, path: string, value: any): any {
		if (!path.trim()) throw new TypeError('setPath: path cannot be empty')
		const keys = path.split('.')
		let current: any = this
		for (let i = 0; i < keys.length - 1; i++) {
			if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') current[keys[i]] = {}
			current = current[keys[i]]
		}
		current[keys[keys.length - 1]] = value
		return this
	})

	defineExtension(Object.prototype, 'mapValues', function <T extends Record<string, any>>(this: T, fn: (value: T[keyof T], key: keyof T) => any): Record<string, any> {
		if (typeof fn !== 'function') {
			throw new TypeError(`mapValues: fn must be a function, got ${typeof fn}`);
		}
		const result: Record<string, any> = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				result[key] = fn((this as any)[key], key);
			}
		}
		return result;
	});

	defineExtension(Object.prototype, 'mapKeys', function <T extends Record<string, any>>(this: T, fn: (key: keyof T) => string | number | symbol): Record<string, any> {
		if (typeof fn !== 'function') {
			throw new TypeError(`mapKeys: fn must be a function, got ${typeof fn}`);
		}
		const result: Record<string, any> = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				const newKey = fn(key);
				result[newKey as string] = (this as any)[key];
			}
		}
		return result;
	});

	defineExtension(Object.prototype, 'filterKeys', function <T extends Record<string, any>>(this: T, keys: (keyof T)[]): Partial<T> {
		if (!Array.isArray(keys)) {
			throw new TypeError(`filterKeys: keys must be an array, got ${typeof keys}`);
		}
		const result: Partial<T> = {};
		for (const key of keys) {
			if (key in this) {
				result[key] = (this as any)[key];
			}
		}
		return result;
	});

	defineExtension(Object.prototype, 'filterValues', function <T extends Record<string, any>>(this: T, fn: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
		if (typeof fn !== 'function') {
			throw new TypeError(`filterValues: fn must be a function, got ${typeof fn}`);
		}
		const result: Partial<T> = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				const val = (this as any)[key];
				if (fn(val, key)) {
					result[key] = val;
				}
			}
		}
		return result;
	});
}
