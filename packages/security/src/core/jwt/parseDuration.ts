import { ValidationError } from '@naman_deep_singh/errors'

const TIME_UNITS: Record<string, number> = {
	s: 1,
	m: 60,
	h: 3600,
	d: 86400,
	w: 604800,
}

export function parseDuration(input: string | number): number {
	if (typeof input === 'number') return input

	const regex = /(\d+)\s*(s|m|h|d|w)/gi
	let totalSeconds = 0
	let match

	while ((match = regex.exec(input)) !== null) {
		const value = Number.parseInt(match[1], 10)
		const unit = match[2].toLowerCase()

		if (!TIME_UNITS[unit]) {
			throw new ValidationError({ reason: `Invalid time unit: ${unit}` })
		}

		totalSeconds += value * TIME_UNITS[unit]
	}

	if (totalSeconds === 0) {
		throw new ValidationError({ reason: `Invalid expiry format: "${input}"` })
	}

	return totalSeconds
}
