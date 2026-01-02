// Core server utilities
export { ExpressServer, createServer } from './core/server.js'
export type {
	ServerInstance,
	ServerInfo,
	GrpcService,
	RpcMethod,
	WebhookConfig,
} from './core/server.js'

// Express re-exports (to avoid direct Express dependency in services)
export { Request, Response, NextFunction, Router, Application } from 'express'
export type { RequestHandler, ErrorRequestHandler } from 'express'

// Health check utilities
export {
	createHealthCheck,
	withHealthCheck,
	addHealthCheck,
} from './core/health.js'

// Graceful shutdown utilities
export {
	createGracefulShutdown,
	withGracefulShutdown,
	startServerWithShutdown,
} from './core/shutdown.js'

// Middleware utilities
export {
	createLoggingMiddleware,
	createErrorHandler,
	createRequestIdMiddleware,
	createValidationMiddleware,
	createRateLimitMiddleware,
	createAuthMiddleware,
	withLogging,
	withErrorHandler,
	withRequestId,
	withValidation,
	withRateLimit,
	withAuth,
	validateFields,
	rateLimit,
	requireAuth,
	cacheResponse,
	useSession,
	type ValidationRule,
	type RateLimitConfig,
	type AuthConfig,
} from './middleware/index.js'

// Utility functions
export {
	getEnv,
	getEnvNumber,
	getEnvBoolean,
} from './utils/utils.js'

// Periodic health monitoring
export { PeriodicHealthMonitor } from './core/periodic-health.js'

// Types
export type {
	ServerConfig,
	HealthCheckConfig,
	HealthCheck,
	GracefulShutdownConfig,
	ServerPlugin,
	SocketIOConfig,
	SocketInstance,
	PeriodicHealthCheckConfig,
	HealthCheckService,
} from './types.js'

import {
	addHealthCheck,
	createHealthCheck,
	withHealthCheck,
} from './core/health.js'
import { PeriodicHealthMonitor } from './core/periodic-health.js'
// Import all exports for default export
import { ExpressServer, createServer } from './core/server.js'
import {
	createGracefulShutdown,
	startServerWithShutdown,
	withGracefulShutdown,
} from './core/shutdown.js'
import {
	createAuthMiddleware,
	createErrorHandler,
	createLoggingMiddleware,
	createRateLimitMiddleware,
	createRequestIdMiddleware,
	createValidationMiddleware,
	rateLimit,
	requireAuth,
	validateFields,
	withAuth,
	withErrorHandler,
	withLogging,
	withRateLimit,
	withRequestId,
	withValidation,
} from './middleware/index.js'
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

	// Graceful shutdown
	createGracefulShutdown,
	withGracefulShutdown,
	startServerWithShutdown,

	// Middleware
	createLoggingMiddleware,
	createErrorHandler,
	createRequestIdMiddleware,
	createValidationMiddleware,
	createRateLimitMiddleware,
	createAuthMiddleware,
	withLogging,
	withErrorHandler,
	withRequestId,
	withValidation,
	withRateLimit,
	withAuth,
	validateFields,
	rateLimit,
	requireAuth,

	// Utils
	getEnv,
	getEnvNumber,
	getEnvBoolean,

	// Periodic Health Monitoring
	PeriodicHealthMonitor,
}

export default ServerUtils
