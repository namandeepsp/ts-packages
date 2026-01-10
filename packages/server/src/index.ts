// Core server utilities
export * from './core/index.js'

// Express re-exports (to avoid direct Express dependency in services)
export { Request, Response, NextFunction, Router, Application } from 'express'
export type { RequestHandler, ErrorRequestHandler } from 'express'

// Middleware utilities
export * from './middleware/index.js'

// Utility functions
export * from './utils/index.js'

// Types
export * from './types.js'

import {
	addHealthCheck,
	createHealthCheck,
	withHealthCheck,
} from './core/health.js'
import { PeriodicHealthMonitor } from './core/periodic-health.js'
import { ExpressServer, createServer } from './core/server.js'
import {
	createGracefulShutdown,
	startServerWithShutdown,
	withGracefulShutdown,
} from './core/shutdown.js'
import { createAuthMiddleware } from './middleware/auth.middleware.js'
import { cacheResponse } from './middleware/cache.middleware.js'
import { createErrorHandler } from './middleware/errorHandler.middleware.js'
import { createLoggingMiddleware } from './middleware/logging.middleware.js'
import {
	rateLimit,
	requireAuth,
	validateFields,
	withAuth,
	withErrorHandler,
	withLogging,
	withRateLimit,
	withRequestId,
	withValidation,
} from './middleware/plugins.middleware.js'
import { createRateLimitMiddleware } from './middleware/rateLimiter.middleware.js'
import { createRequestIdMiddleware } from './middleware/requestId.middleware.js'
import { useSession } from './middleware/session.middleware.js'
import { createValidationMiddleware } from './middleware/validation.middleware.js'
import { getEnv, getEnvBoolean, getEnvNumber } from './utils/utils.js'

// Default export for namespace usage
const ServerUtils = {
	// Server creation
	createServer,
	ExpressServer,

	// Health checks
	createHealthCheck,
	withHealthCheck,
	addHealthCheck,
	PeriodicHealthMonitor,

	// Graceful shutdown
	createGracefulShutdown,
	withGracefulShutdown,
	startServerWithShutdown,

	// Middleware creators
	createLoggingMiddleware,
	createErrorHandler,
	createRequestIdMiddleware,
	createValidationMiddleware,
	createRateLimitMiddleware,
	createAuthMiddleware,

	// Plugin middleware (application-level)
	withLogging,
	withErrorHandler,
	withRequestId,
	withValidation,
	withRateLimit,
	withAuth,

	// Route-level middleware
	validateFields,
	rateLimit,
	requireAuth,
	cacheResponse,
	useSession,

	// Environment utilities
	getEnv,
	getEnvNumber,
	getEnvBoolean,
}

export default ServerUtils
