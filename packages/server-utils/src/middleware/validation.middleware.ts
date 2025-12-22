import { ValidationError } from '@naman_deep_singh/errors-utils'
import type {
	NextFunction,
	Request,
	RequestHandler,
	Response,
} from 'node_modules/@types/express'

// Validation middleware
export interface ValidationRule {
	field: string
	required?: boolean
	type?: 'string' | 'number' | 'email' | 'boolean'
	minLength?: number
	maxLength?: number
	pattern?: RegExp
	custom?: (value: unknown) => boolean | string
}

export function createValidationMiddleware(
	rules: ValidationRule[],
): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction) => {
		const errors: string[] = []

		for (const rule of rules) {
			const value = req.body[rule.field]

			if (
				rule.required &&
				(value === undefined || value === null || value === '')
			) {
				errors.push(`${rule.field} is required`)
				continue
			}

			if (value === undefined || value === null) continue

			if (rule.type) {
				switch (rule.type) {
					case 'email':
						const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
						if (!emailRegex.test(value)) {
							errors.push(`${rule.field} must be a valid email`)
						}
						break
					case 'string':
						if (typeof value !== 'string') {
							errors.push(`${rule.field} must be a string`)
						}
						break
					case 'number':
						if (typeof value !== 'number' && isNaN(Number(value))) {
							errors.push(`${rule.field} must be a number`)
						}
						break
					case 'boolean':
						if (typeof value !== 'boolean') {
							errors.push(`${rule.field} must be a boolean`)
						}
						break
				}
			}

			if (rule.minLength && value.length < rule.minLength) {
				errors.push(
					`${rule.field} must be at least ${rule.minLength} characters`,
				)
			}
			if (rule.maxLength && value.length > rule.maxLength) {
				errors.push(
					`${rule.field} must be no more than ${rule.maxLength} characters`,
				)
			}

			if (rule.pattern && !rule.pattern.test(value)) {
				errors.push(`${rule.field} format is invalid`)
			}

			if (rule.custom) {
				const result = rule.custom(value)
				if (result !== true) {
					errors.push(
						typeof result === 'string' ? result : `${rule.field} is invalid`,
					)
				}
			}
		}

		if (errors.length > 0) {
			// Use ValidationError from errors-utils and let error middleware handle response
			const validationError = new ValidationError({
				fieldErrors: errors,
			})
			return next(validationError)
		}

		next()
	}
}
