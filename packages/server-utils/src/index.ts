// Core server utilities
export { createServer, withPlugin, createServerWithPlugins } from './server';

// Health check utilities
export { createHealthCheck, withHealthCheck, addHealthCheck } from './health';

// Graceful shutdown utilities
export { createGracefulShutdown, withGracefulShutdown, startServerWithShutdown } from './shutdown';

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
  type ValidationRule,
  type RateLimitConfig,
  type AuthConfig
} from './middleware';

// Utility functions
export {
  getEnv,
  getEnvNumber,
  getEnvBoolean
} from './utils';

// Types
export type { 
  ServerConfig, 
  HealthCheckConfig, 
  HealthCheck, 
  GracefulShutdownConfig, 
  ServerPlugin 
} from './types';