import type {
	NextFunction,
	Request,
	RequestHandler,
	Response,
} from 'node_modules/@types/express'

// Rate limiting middleware
export interface RateLimitConfig {
	windowMs?: number
	maxRequests?: number
	message?: string
	keyGenerator?: (req: Request) => string
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimitMiddleware(
	config: RateLimitConfig = {},
): RequestHandler {
	const {
		windowMs = 15 * 60 * 1000,
		maxRequests = 100,
		message = 'Too many requests, please try again later',
		keyGenerator = (req) => req.ip || 'unknown',
	} = config

	return (req: Request, res: Response, next: NextFunction) => {
		const key = keyGenerator(req)
		const now = Date.now()
		const record = rateLimitStore.get(key)

		if (!record || now > record.resetTime) {
			rateLimitStore.set(key, {
				count: 1,
				resetTime: now + windowMs,
			})
			return next()
		}

		if (record.count >= maxRequests) {
			return res.status(429).json({
				success: false,
				message,
				data: undefined,
				error: {
					message,
					details: {
						retryAfter: Math.ceil((record.resetTime - now) / 1000),
					},
				},
				meta: null,
			})
		}

		record.count++
		next()
	}
}
