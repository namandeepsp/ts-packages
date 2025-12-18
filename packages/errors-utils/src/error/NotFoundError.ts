import { HTTPError } from './HTTPError'

export class NotFoundError extends HTTPError {
	constructor(message = 'Not Found', details?: unknown) {
		super(message, 404, details)
	}
}
