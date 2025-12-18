import { AppError } from './AppError'

export class HTTPError extends AppError {
	public status: string

	constructor(message: string, statusCode: number, details?: unknown) {
		super(message, statusCode, details)

		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
	}
}
