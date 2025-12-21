import type { NextFunction, Request, Response } from 'express'
import type { ICache } from '../../core/interfaces'
import type { SessionStore } from '../../session/SessionStore'

/**
 * Express middleware for session management using cache
 */
export function cacheSessionMiddleware(
	sessionStore: SessionStore,
	options?: {
		sessionIdHeader?: string
		sessionDataKey?: string
	},
) {
	const sessionIdHeader = options?.sessionIdHeader ?? 'x-session-id'
	const sessionDataKey = options?.sessionDataKey ?? 'session'

	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			// Get session ID from header or cookie
			const sessionId =
				req.get(sessionIdHeader) || req.cookies?.[sessionIdHeader]

			if (sessionId) {
				// Fetch session data and extend expiry
				const sessionData = await sessionStore.getAndExtend(sessionId)

				if (sessionData) {
					;(req as any)[sessionDataKey] = sessionData
				}
			}

			next()
		} catch (err) {
			console.error('Session middleware error:', err)
			next()
		}
	}
}

/**
 * Express middleware for cache health check
 */
export function cacheHealthCheckMiddleware(
	cache: ICache,
	endpoint = '/.health/cache',
) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.path === endpoint && req.method === 'GET') {
			cache
				.isAlive()
				.then((health) => {
					res.status(health.isAlive ? 200 : 503).json(health)
				})
				.catch((err) => {
					res.status(503).json({
						isAlive: false,
						adapter: 'unknown',
						timestamp: new Date(),
						error: (err as Error).message,
					})
				})
			return
		}

		next()
	}
}

/**
 * Express middleware for cache request/response caching
 */
export function cacheResponseMiddleware(
	cache: ICache<string>,
	options?: {
		ttl?: number
		keyPrefix?: string
		excludeStatusCodes?: number[]
	},
) {
	const ttl = options?.ttl ?? 300 // 5 minutes default
	const keyPrefix = options?.keyPrefix ?? 'response:'
	const excludeStatusCodes = options?.excludeStatusCodes ?? [
		300, 301, 302, 303, 304, 307, 308, 404, 500, 501, 502, 503,
	]

	return (req: Request, res: Response, next: NextFunction) => {
		// Only cache GET requests
		if (req.method !== 'GET') {
			next()
			return
		}

		const cacheKey = `${keyPrefix}${req.originalUrl || req.url}`

		// Try to get cached response
		cache
			.get(cacheKey)
			.then((cached) => {
				if (cached) {
					res.set('X-Cache', 'HIT')
					return res.send(cached)
				}

				// Store original send method
				const originalSend = res.send

				// Override send method to cache response
				res.send = function (data: unknown) {
					// Check if response should be cached
					if (
						res.statusCode >= 200 &&
						res.statusCode < 300 &&
						!excludeStatusCodes.includes(res.statusCode)
					) {
						let responseData: string | null = null
						if (typeof data === 'string') {
							responseData = data
						} else {
							try {
								responseData = JSON.stringify(data)
							} catch (_e) {
								responseData = null
							}
						}

						if (responseData !== null) {
							cache.set(cacheKey, responseData, ttl).catch((err) => {
								console.error('Failed to cache response:', err)
							})
						}
					}

					res.set('X-Cache', 'MISS')
					return originalSend.call(this, data as any)
				}

				next()
			})
			.catch((err) => {
				console.error('Cache middleware error:', err)
				next()
			})
	}
}
