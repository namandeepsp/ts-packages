import { ExpressResponder } from '../adapters/express/ExpressResponder'

import type { ResponderConfig } from './config'

export const createResponderFactory = (cfg?: Partial<ResponderConfig>) => {
	return <P = unknown, _M = Record<string, unknown>>(
		res: import('express').Response,
	) => {
		return new ExpressResponder<P>(cfg, res)
	}
}
