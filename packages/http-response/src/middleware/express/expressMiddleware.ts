import type { RequestHandler } from 'express'
import type { ResponderConfig } from '../../core/config.js'
import { createResponderFactory } from '../../core/factory.js'

export const responderMiddleware = (
	cfg?: Partial<ResponderConfig>,
): RequestHandler => {
	const factory = createResponderFactory(cfg)

	return (_req, res, next) => {
		;(res as any).responder = <P = unknown>() => factory<P>(res)
		next()
	}
}
