import type {
	NextFunction,
	Request,
	RequestHandler,
	Response,
} from 'node_modules/@types/express'

// Cache response middleware (per-route opt-in)
export function cacheResponse(ttl?: number): RequestHandler {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (req.method !== 'GET') return next()

			const cache = (req.cache ?? req.app.locals.cache) as
				| { get?: Function; set?: Function }
				| undefined
			const defaultTTL = req.app.locals.cacheDefaultTTL as number | undefined
			if (!cache || typeof cache.get !== 'function') return next()

			const key = `${req.originalUrl}`
			try {
				const cached = await (cache.get as Function)(key)
				if (cached !== null && cached !== undefined) {
					res.setHeader('X-Cache', 'HIT')
					return res.json(cached)
				}
			} catch (cacheErr) {
				console.error(`[Cache] Failed to retrieve key "${key}":`, cacheErr)
				// Continue without cache hit
			}

			const originalJson = res.json.bind(res)
			res.json = (body: unknown) => {
				try {
					const expiry = ttl ?? defaultTTL
					if (expiry && cache && typeof cache.set === 'function') {
						;(cache.set as Function)(key, body, expiry).catch(
							(err: unknown) => {
								console.error(
									`[Cache] Failed to set key "${key}" with TTL ${expiry}:`,
									err,
								)
							},
						)
					} else if (cache) {
						if (typeof cache.set === 'function') {
							;(cache.set as Function)(key, body).catch((err: unknown) => {
								console.error(`[Cache] Failed to set key "${key}":`, err)
							})
						}
					}
				} catch (e) {
					console.error(`[Cache] Error during cache.set operation:`, e)
				}
				res.setHeader('X-Cache', 'MISS')
				return originalJson(body)
			}

			next()
		} catch (error) {
			console.error(
				'[Cache] Unexpected error in cacheResponse middleware:',
				error,
			)
			next()
		}
	}
}
