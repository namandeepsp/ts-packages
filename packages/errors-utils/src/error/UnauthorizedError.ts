import { HTTPError } from './HTTPError'

export class UnauthorizedError extends HTTPError {
	constructor(message = 'Unauthorized', details?: unknown) {
		super(message, 401, details)
	}
}
