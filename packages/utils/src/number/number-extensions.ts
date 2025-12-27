import { defineExtension } from 'src/utils'
import { makeInternalCacheKey, withCache } from '../core/performance'

let numberExtended = false

export function extendNumber() {
	if (numberExtended) return
	numberExtended = true

	defineExtension(
		Number.prototype,
		'toPercent',
		function (this: number, decimals = 2): string {
			return `${(this * 100).toFixed(decimals)}%`
		},
	)

	defineExtension(
		Number.prototype,
		'toCurrency',
		function (this: number, currency = 'USD', locale = 'en-US'): string {
			return new Intl.NumberFormat(locale, {
				style: 'currency',
				currency,
			}).format(this)
		},
	)

	defineExtension(
		Number.prototype,
		'clamp',
		function (this: number, min: number, max: number): number {
			if (min > max)
				throw new RangeError(
					`clamp: min (${min}) cannot be greater than max (${max})`,
				)
			return Math.min(Math.max(this, min), max)
		},
	)

	defineExtension(Number.prototype, 'isEven', function (this: number): boolean {
		return this % 2 === 0
	})

	defineExtension(Number.prototype, 'isOdd', function (this: number): boolean {
		return this % 2 !== 0
	})

	defineExtension(
		Number.prototype,
		'isPrime',
		function (this: number): boolean {
			const num = this
			return withCache(makeInternalCacheKey('prime', num), () => {
				if (num < 2) return false
				for (let i = 2; i <= Math.sqrt(num); i++)
					if (num % i === 0) return false
				return true
			})
		},
	)

	defineExtension(
		Number.prototype,
		'factorial',
		function (this: number): number {
			const num = Math.floor(this)
			return withCache(makeInternalCacheKey('factorial', num), () => {
				if (num < 0) return NaN
				if (num <= 1) return 1
				let result = 1
				for (let i = 2; i <= num; i++) result *= i
				return result
			})
		},
	)

	defineExtension(
		Number.prototype,
		'toOrdinal',
		function (this: number): string {
			const num = Math.floor(this)
			const suffix = ['th', 'st', 'nd', 'rd']
			const v = num % 100
			return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
		},
	)

	defineExtension(Number.prototype, 'toRoman', function (this: number): string {
		const num = Math.floor(this)
		if (num <= 0) throw new RangeError('toRoman: number must be positive')
		if (num >= 4000)
			throw new RangeError('toRoman: number must be less than 4000')

		return withCache(makeInternalCacheKey('roman', num), () => {
			const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
			const symbols = [
				'M',
				'CM',
				'D',
				'CD',
				'C',
				'XC',
				'L',
				'XL',
				'X',
				'IX',
				'V',
				'IV',
				'I',
			]
			let n = num
			let result = ''
			for (let i = 0; i < values.length; i++) {
				while (n >= values[i]) {
					result += symbols[i]
					n -= values[i]
				}
			}
			return result
		})
	})

	defineExtension(
		Number.prototype,
		'inRange',
		function (this: number, min: number, max: number): boolean {
			return this >= min && this <= max
		},
	)

	defineExtension(
		Number.prototype,
		'round',
		function (this: number, decimals = 0): number {
			if (!Number.isInteger(decimals) || decimals < 0)
				throw new TypeError('round: decimals must be non-negative integer')
			const factor = Math.pow(10, decimals)
			return Math.round(this * factor) / factor
		},
	)

	defineExtension(
		Number.prototype,
		'ceil',
		function (this: number, decimals = 0): number {
			if (!Number.isInteger(decimals) || decimals < 0)
				throw new TypeError('ceil: decimals must be non-negative integer')
			const factor = Math.pow(10, decimals)
			return Math.ceil(this * factor) / factor
		},
	)

	defineExtension(
		Number.prototype,
		'floor',
		function (this: number, decimals = 0): number {
			if (!Number.isInteger(decimals) || decimals < 0)
				throw new TypeError('floor: decimals must be non-negative integer')
			const factor = Math.pow(10, decimals)
			return Math.floor(this * factor) / factor
		},
	)

	defineExtension(Number.prototype, 'abs', function (this: number): number {
		return Math.abs(this)
	})

	defineExtension(Number.prototype, 'sign', function (this: number): number {
		return Math.sign(this)
	})

	defineExtension(
		Number.prototype,
		'times',
		function (this: number, callback: (index: number) => void): void {
			if (typeof callback !== 'function')
				throw new TypeError('times: callback must be a function')
			for (let i = 0; i < Math.floor(this); i++) callback(i)
		},
	)

	defineExtension(
		Number.prototype,
		'toFixedNumber',
		function (this: number, decimals = 0): number {
			if (!Number.isInteger(decimals) || decimals < 0) {
				throw new TypeError(
					`toFixedNumber: decimals must be a non-negative integer, got ${decimals}`,
				)
			}
			const factor = Math.pow(10, decimals)
			return Math.round(this.valueOf() * factor) / factor
		},
	)

	defineExtension(
		Number.prototype,
		'randomUpTo',
		function (this: number): number {
			const max = this.valueOf()
			if (!Number.isFinite(max)) {
				throw new TypeError(`randomUpTo: number must be finite, got ${max}`)
			}
			return Math.random() * max
		},
	)
}
