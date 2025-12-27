import type { RequestHandler } from 'express'
import type { ResponderConfig } from '../../core/config'
import { createResponderFactory } from '../../core/factory'

export const responderMiddleware = (
	cfg?: Partial<ResponderConfig>,
): RequestHandler => {
	const factory = createResponderFactory(cfg)

	return (_req, res, next) => {
		;(res as any).responder = <P = unknown>() => factory<P>(res)
		next()
	}
}
