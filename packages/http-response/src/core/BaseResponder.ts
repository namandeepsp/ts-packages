import { HTTP_STATUS } from '../constants/httpStatus.js'
import { type ResponderConfig, defaultConfig } from './config.js'
import type { PaginationMeta, ResponseEnvelope, Sender } from './types.js'

export class BaseResponder<P = unknown, M = PaginationMeta> {
	protected readonly cfg: ResponderConfig
	protected sender?: Sender

	constructor(cfg?: Partial<ResponderConfig>, sender?: Sender) {
		this.cfg = { ...defaultConfig, ...(cfg ?? {}) }
		this.sender = sender
	}

	attachSender(sender: Sender) {
		this.sender = sender
	}

	protected normalizeError(err: unknown): {
		message: string
		code?: string
		details?: unknown
	} {
		// errors AppError compatibility
		if (typeof err === 'object' && err !== null) {
			const e = err as Record<string, unknown>

			if (typeof e.message === 'string') {
				return {
					message: e.message,
					code: typeof e.code === 'string' ? e.code : undefined,
					details: e.details,
				}
			}
		}

		if (err instanceof Error) {
			return { message: err.message }
		}

		if (typeof err === 'string') {
			return { message: err }
		}

		return {
			message: 'Internal server error',
			details: err,
		}
	}

	protected buildEnvelope(
		data?: P,
		message?: string,
		error?: unknown,
		meta?: M,
	) {
		const env: ResponseEnvelope<P, M> = {
			success: !error,
			message: message ?? (error ? 'Error' : undefined),
			data: error ? undefined : data,
			error: error ? this.normalizeError(error) : null,
			meta: meta ?? null,
		}

		if (this.cfg.timestamp) {
			env.meta = {
				...(env.meta ?? {}),
				timestamp: new Date().toISOString(),
			} as M
		}

		if (this.cfg.extra) {
			Object.assign(env as Record<string, unknown>, this.cfg.extra)
		}

		return env
	}

	protected send(status: number, envelope: ResponseEnvelope<P, M>) {
		if (!this.sender) return { status, body: envelope }
		return this.sender(status, envelope)
	}

	/** -----------------------------
	 *  Standard REST Response Helpers
	 * ----------------------------- */
	ok(data?: P, message = 'Success') {
		return this.send(HTTP_STATUS.SUCCESS.OK, this.buildEnvelope(data, message))
	}

	created(data?: P, message = 'Created successfully') {
		return this.send(
			HTTP_STATUS.SUCCESS.CREATED,
			this.buildEnvelope(data, message),
		)
	}

	noContent(message = 'No Content') {
		return this.send(
			HTTP_STATUS.SUCCESS.NO_CONTENT,
			this.buildEnvelope(undefined, message),
		)
	}

	badRequest(message = 'Bad request', error?: unknown) {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.BAD_REQUEST,
			this.buildEnvelope(undefined, message, error),
		)
	}

	unauthorized(message = 'Unauthorized') {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED,
			this.buildEnvelope(undefined, message),
		)
	}

	forbidden(message = 'Forbidden') {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.FORBIDDEN,
			this.buildEnvelope(undefined, message),
		)
	}

	notFound(message = 'Not found') {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.NOT_FOUND,
			this.buildEnvelope(undefined, message),
		)
	}

	conflict(message = 'Conflict') {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.CONFLICT,
			this.buildEnvelope(undefined, message),
		)
	}

	unprocessableEntity(message = 'Unprocessable Entity', error?: unknown) {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.UNPROCESSABLE_ENTITY,
			this.buildEnvelope(undefined, message, error),
		)
	}

	tooManyRequests(message = 'Too Many Requests') {
		return this.send(
			HTTP_STATUS.CLIENT_ERROR.TOO_MANY_REQUESTS,
			this.buildEnvelope(undefined, message),
		)
	}

	serverError(message = 'Internal server error', error?: unknown) {
		return this.send(
			HTTP_STATUS.SERVER_ERROR.INTERNAL_SERVER_ERROR,
			this.buildEnvelope(undefined, message, error),
		)
	}

	paginate(
		data: P[],
		page: number,
		limit: number,
		total: number,
		message = 'Success',
	) {
		const totalPages = Math.max(1, Math.ceil(total / limit))
		const offset = (page - 1) * limit

		const pagination: PaginationMeta = {
			page,
			limit,
			total,
			totalPages,
			offset,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		}

		return this.send(
			HTTP_STATUS.SUCCESS.OK,
			this.buildEnvelope(data as any, message, undefined, pagination as any),
		)
	}

	paginateOffset(
		data: P[],
		offset: number,
		limit: number,
		total: number,
		message = 'Success',
	) {
		const page = Math.floor(offset / limit) + 1
		return this.paginate(data, page, limit, total, message)
	}
}
