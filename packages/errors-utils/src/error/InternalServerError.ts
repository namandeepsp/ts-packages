import { HTTPError } from './HTTPError'

export class InternalServerError extends HTTPError {
	constructor(message = 'Internal Server Error', details?: unknown) {
		super(message, 500, details)
	}
}
