// Number prototype extensions
import { withCache } from '../core/performance'

export function extendNumber() {
	Number.prototype.toPercent = function (decimals = 2): string {
		return `${(this.valueOf() * 100).toFixed(decimals)}%`
	}

	Number.prototype.toCurrency = function (
		currency = 'USD',
		locale = 'en-US',
	): string {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
		}).format(this.valueOf())
	}

	Number.prototype.clamp = function (min: number, max: number): number {
		if (min > max) {
			throw new RangeError(
				`clamp: min (${min}) cannot be greater than max (${max})`,
			)
		}
		return Math.min(Math.max(this.valueOf(), min), max)
	}

	Number.prototype.isEven = function (): boolean {
		return this.valueOf() % 2 === 0
	}

	Number.prototype.isOdd = function (): boolean {
		return this.valueOf() % 2 !== 0
	}

	Number.prototype.isPrime = function (): boolean {
		const num = this.valueOf()
		return withCache(`prime_${num}`, () => {
			if (num < 2) return false
			for (let i = 2; i <= Math.sqrt(num); i++) {
				if (num % i === 0) return false
			}
			return true
		})
	}

	Number.prototype.factorial = function (): number {
		const num = Math.floor(this.valueOf())
		return withCache(`factorial_${num}`, () => {
			if (num < 0) return Number.NaN
			if (num === 0 || num === 1) return 1
			let result = 1
			for (let i = 2; i <= num; i++) {
				result *= i
			}
			return result
		})
	}

	Number.prototype.toOrdinal = function (): string {
		const num = Math.floor(this.valueOf())
		const suffix = ['th', 'st', 'nd', 'rd']
		const v = num % 100
		return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
	}

	Number.prototype.toRoman = function (): string {
		const num = Math.floor(this.valueOf())

		// Better validation for roman numerals
		if (num <= 0) {
			throw new RangeError('toRoman: number must be positive')
		}
		if (num >= 4000) {
			throw new RangeError('toRoman: number must be less than 4000')
		}

		return withCache(`roman_${num}`, () => {
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
			let result = ''
			let n = num
			for (let i = 0; i < values.length; i++) {
				while (n >= values[i]) {
					result += symbols[i]
					n -= values[i]
				}
			}
			return result
		})
	}

	Number.prototype.inRange = function (min: number, max: number): boolean {
		const num = this.valueOf()
		return num >= min && num <= max
	}

	Number.prototype.round = function (decimals = 0): number {
		if (!Number.isInteger(decimals) || decimals < 0) {
			throw new TypeError(
				`round: decimals must be a non-negative integer, got ${decimals}`,
			)
		}
		const factor = Math.pow(10, decimals)
		return Math.round(this.valueOf() * factor) / factor
	}

	Number.prototype.ceil = function (decimals = 0): number {
		if (!Number.isInteger(decimals) || decimals < 0) {
			throw new TypeError(
				`ceil: decimals must be a non-negative integer, got ${decimals}`,
			)
		}
		const factor = Math.pow(10, decimals)
		return Math.ceil(this.valueOf() * factor) / factor
	}

	Number.prototype.floor = function (decimals = 0): number {
		if (!Number.isInteger(decimals) || decimals < 0) {
			throw new TypeError(
				`floor: decimals must be a non-negative integer, got ${decimals}`,
			)
		}
		const factor = Math.pow(10, decimals)
		return Math.floor(this.valueOf() * factor) / factor
	}

	Number.prototype.abs = function (): number {
		return Math.abs(this.valueOf())
	}

	Number.prototype.sign = function (): number {
		return Math.sign(this.valueOf())
	}

	Number.prototype.times = function (callback: (index: number) => void): void {
		if (typeof callback !== 'function') {
			throw new TypeError(
				`times: callback must be a function, got ${typeof callback}`,
			)
		}

		const num = Math.floor(this.valueOf())
		for (let i = 0; i < num; i++) {
			callback(i)
		}
	}
}
