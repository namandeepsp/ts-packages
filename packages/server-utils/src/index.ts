
// Core server utilities
export { ExpressServer, createServer } from './core/server';
export type { ServerInstance, ServerInfo, GrpcService, RpcMethod, WebhookConfig } from './core/server';

// Express re-exports (to avoid direct Express dependency in services)
export { Request, Response, NextFunction, Router, Application } from 'express';
export type { RequestHandler, ErrorRequestHandler } from 'express';


// Health check utilities
export { createHealthCheck, withHealthCheck, addHealthCheck } from './core/health';

// Graceful shutdown utilities
export { createGracefulShutdown, withGracefulShutdown, startServerWithShutdown } from './core/shutdown';


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
  type AuthConfig
} from './middleware';

// Utility functions
export {
  getEnv,
  getEnvNumber,
  getEnvBoolean
} from './utils/utils';

// Periodic health monitoring
export { PeriodicHealthMonitor } from './core/periodic-health';

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
  HealthCheckService
} from './types';


// Import all exports for default export
import { ExpressServer, createServer } from './core/server';
import { createHealthCheck, withHealthCheck, addHealthCheck } from './core/health';
import { createGracefulShutdown, withGracefulShutdown, startServerWithShutdown } from './core/shutdown';
import {
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
  requireAuth
} from './middleware';
import { getEnv, getEnvNumber, getEnvBoolean } from './utils/utils';
import { PeriodicHealthMonitor } from './core/periodic-health';

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
};

export default ServerUtils;