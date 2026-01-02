// Authentication Middleware
export { type AuthConfig, createAuthMiddleware } from './auth.middleware.js'

// Cache Middleware
export { cacheResponse } from './cache.middleware.js'

// Error Handler Middleware
export { createErrorHandler } from './errorHandler.middleware.js'

// Logging Middleware
export { createLoggingMiddleware } from './logging.middleware.js'

// Rate Limiter Middleware
export {
	type RateLimitConfig,
	createRateLimitMiddleware,
} from './rateLimiter.middleware.js'

// Request ID Middleware
export { createRequestIdMiddleware } from './requestId.middleware.js'

// Session Middleware
export { useSession } from './session.middleware.js'

// Validation Middleware
export {
	type ValidationRule,
	createValidationMiddleware,
} from './validation.middleware.js'

// Plugin middleware functions (for application-level middleware)
export {
	withLogging,
	withErrorHandler,
	withRequestId,
	withValidation,
	withRateLimit,
	withAuth,
} from './plugins.middleware.js'

// Convenience middleware functions (for route-level middleware)
export {
	validateFields,
	rateLimit,
	requireAuth,
} from './plugins.middleware.js'
