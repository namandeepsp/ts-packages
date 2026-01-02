import { defineExtension } from '../utils/defineExtension.js'

let stringExtended = false

export function extendString() {
	if (stringExtended) return
	stringExtended = true

	defineExtension(
		String.prototype,
		'toCapitalize',
		function (this: string): string {
			return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
		},
	)

	defineExtension(
		String.prototype,
		'toCamelCase',
		function (this: string): string {
			return this.replace(/[-_\s]+(.)?/g, (_, char) =>
				char ? char.toUpperCase() : '',
			)
		},
	)

	defineExtension(
		String.prototype,
		'toKebabCase',
		function (this: string): string {
			return this.replace(/([a-z])([A-Z])/g, '$1-$2')
				.replace(/[\s_]+/g, '-')
				.toLowerCase()
		},
	)

	defineExtension(
		String.prototype,
		'toSnakeCase',
		function (this: string): string {
			return this.replace(/([a-z])([A-Z])/g, '$1_$2')
				.replace(/[\s-]+/g, '_')
				.toLowerCase()
		},
	)

	defineExtension(
		String.prototype,
		'truncate',
		function (this: string, length: number, suffix = '...'): string {
			if (!Number.isInteger(length) || length < 0) {
				throw new TypeError(
					`truncate: length must be a non-negative integer, got ${length}`,
				)
			}
			return this.length > length
				? this.substring(0, length) + suffix
				: this.toString()
		},
	)

	defineExtension(
		String.prototype,
		'isEmail',
		function (this: string): boolean {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return emailRegex.test(this.toString())
		},
	)

	defineExtension(String.prototype, 'isUrl', function (this: string): boolean {
		try {
			new URL(this.toString())
			return true
		} catch {
			return false
		}
	})

	defineExtension(
		String.prototype,
		'removeWhitespace',
		function (this: string): string {
			return this.replace(/\s+/g, '')
		},
	)

	defineExtension(String.prototype, 'reverse', function (this: string): string {
		return this.split('').reverse().join('')
	})

	defineExtension(
		String.prototype,
		'isPalindrome',
		function (this: string): boolean {
			const cleaned = this.toLowerCase().replace(/[^a-z0-9]/g, '')
			return cleaned === cleaned.split('').reverse().join('')
		},
	)

	defineExtension(
		String.prototype,
		'toTitleCase',
		function (this: string): string {
			return this.replace(
				/\w\S*/g,
				(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
			)
		},
	)

	defineExtension(
		String.prototype,
		'stripHtml',
		function (this: string): string {
			return this.replace(/<[^>]*>/g, '')
		},
	)

	defineExtension(
		String.prototype,
		'padStart',
		function (this: string, targetLength: number, padString = ' '): string {
			if (!Number.isInteger(targetLength) || targetLength < 0) {
				throw new TypeError(
					`padStart: targetLength must be a non-negative integer, got ${targetLength}`,
				)
			}
			if (typeof padString !== 'string') {
				throw new TypeError(
					`padStart: padString must be a string, got ${typeof padString}`,
				)
			}
			if (padString.length === 0) {
				throw new TypeError('padStart: padString cannot be empty')
			}
			return this.toString().padStart(targetLength, padString)
		},
	)

	defineExtension(
		String.prototype,
		'padEnd',
		function (this: string, targetLength: number, padString = ' '): string {
			if (!Number.isInteger(targetLength) || targetLength < 0) {
				throw new TypeError(
					`padEnd: targetLength must be a non-negative integer, got ${targetLength}`,
				)
			}
			if (typeof padString !== 'string') {
				throw new TypeError(
					`padEnd: padString must be a string, got ${typeof padString}`,
				)
			}
			if (padString.length === 0) {
				throw new TypeError('padEnd: padString cannot be empty')
			}
			return this.toString().padEnd(targetLength, padString)
		},
	)

	defineExtension(
		String.prototype,
		'count',
		function (this: string, substring: string): number {
			if (typeof substring !== 'string') {
				throw new TypeError(
					`count: substring must be a string, got ${typeof substring}`,
				)
			}
			if (substring === '') {
				throw new TypeError('count: substring cannot be empty')
			}
			const escaped = substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			return (this.match(new RegExp(escaped, 'g')) || []).length
		},
	)

	defineExtension(String.prototype, 'words', function (this: string): string[] {
		return this.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0)
	})

	defineExtension(String.prototype, 'lines', function (this: string): string[] {
		return this.split(/\r?\n/)
	})

	defineExtension(
		String.prototype,
		'capitalizeWords',
		function (this: string): string {
			return this.toString().replace(/\b\w/g, (char) => char.toUpperCase())
		},
	)

	defineExtension(
		String.prototype,
		'reverseWords',
		function (this: string): string {
			return this.toString().split(/\s+/).reverse().join(' ')
		},
	)

	defineExtension(
		String.prototype,
		'truncateWords',
		function (this: string, count: number, suffix = '...'): string {
			if (!Number.isInteger(count) || count < 0) {
				throw new TypeError(
					`truncateWords: count must be a non-negative integer, got ${count}`,
				)
			}
			const words = this.toString().split(/\s+/)
			if (words.length <= count) return this.toString()
			return words.slice(0, count).join(' ') + suffix
		},
	)

	defineExtension(String.prototype, 'slugify', function (this: string): string {
		return this.toString()
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.trim()
			.replace(/[\s_-]+/g, '-')
	})
}
