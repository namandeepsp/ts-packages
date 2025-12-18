// Authentication Middleware
export { AuthConfig, createAuthMiddleware } from './auth.middleware'

// Cache Middleware
export { cacheResponse } from './cache.middleware'

// Error Handler Middleware
export { createErrorHandler } from './errorHandler.middleware'

// Logging Middleware
export { createLoggingMiddleware } from './logging.middleware'

// Rate Limiter Middleware
export {
	RateLimitConfig,
	createRateLimitMiddleware,
} from './rateLimiter.middleware'

// Request ID Middleware
export { createRequestIdMiddleware } from './requestId.middleware'

// Session Middleware
export { useSession } from './session.middleware'

// Validation Middleware
export {
	ValidationRule,
	createValidationMiddleware,
} from './validation.middleware'

// Plugin middleware functions (for application-level middleware)
export {
	withLogging,
	withErrorHandler,
	withRequestId,
	withValidation,
	withRateLimit,
	withAuth,
} from './plugins.middleware'

// Convenience middleware functions (for route-level middleware)
export {
	validateFields,
	rateLimit,
	requireAuth,
} from './plugins.middleware'
