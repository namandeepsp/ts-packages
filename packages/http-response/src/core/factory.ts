import { ExpressResponder } from '../adapters/index.js'
import type { ResponderConfig } from './config.js'

export const createResponderFactory = (cfg?: Partial<ResponderConfig>) => {
	return <P = unknown, _M = Record<string, unknown>>(
		res: import('express').Response,
	) => {
		return new ExpressResponder<P>(cfg, res)
	}
}
