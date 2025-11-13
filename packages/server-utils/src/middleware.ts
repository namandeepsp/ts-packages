import express from 'express';
import { ServerPlugin } from './types';

// Logging middleware
export function createLoggingMiddleware(format: 'simple' | 'detailed' = 'simple'): express.RequestHandler {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (format === 'detailed') {
        console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
      } else {
        console.log(`${req.method} ${req.url} - ${res.statusCode}`);
      }
    });
    
    next();
  };
}

// Error handling middleware
export function createErrorHandler(): express.ErrorRequestHandler {
  return (err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    
    if (res.headersSent) {
      return next(err);
    }
    
    // Type guard for error objects
    const errorObj = err as { status?: number; statusCode?: number; message?: string; stack?: string };
    
    const status = errorObj.status || errorObj.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : errorObj.message || 'Unknown error';
    
    res.status(status).json({
      status: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: errorObj.stack })
    });
  };
}

// Request ID middleware
export function createRequestIdMiddleware(): express.RequestHandler {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = Math.random().toString(36).substring(2, 15);
    (req as express.Request & { requestId: string }).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}

// Validation middleware
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'boolean';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export function createValidationMiddleware(rules: ValidationRule[]): express.RequestHandler {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const value = req.body[rule.field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }
      
      if (value === undefined || value === null) continue;
      
      if (rule.type) {
        switch (rule.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${rule.field} must be a valid email`);
            }
            break;
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`${rule.field} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${rule.field} must be a boolean`);
            }
            break;
        }
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${rule.field} format is invalid`);
      }
      
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${rule.field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
}

// Rate limiting middleware
export interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  keyGenerator?: (req: express.Request) => string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function createRateLimitMiddleware(config: RateLimitConfig = {}): express.RequestHandler {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || 'unknown'
  } = config;
  
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        status: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

// Authentication middleware helper
export interface AuthConfig {
  tokenExtractor?: (req: express.Request) => string | null;
  tokenValidator?: (token: string) => Promise<unknown> | unknown;
  unauthorizedMessage?: string;
}

export function createAuthMiddleware(config: AuthConfig): express.RequestHandler {
  const {
    tokenExtractor = (req) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      return req.cookies?.token || null;
    },
    tokenValidator = () => { throw new Error('Token validator not implemented'); },
    unauthorizedMessage = 'Unauthorized access'
  } = config;
  
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const token = tokenExtractor(req);
      
      if (!token) {
        return res.status(401).json({
          status: false,
          message: unauthorizedMessage
        });
      }
      
      const user = await tokenValidator(token);
      (req as express.Request & { user: unknown }).user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: unauthorizedMessage
      });
    }
  };
}

// Plugin versions
export function withLogging(format: 'simple' | 'detailed' = 'simple'): ServerPlugin {
  return (app: express.Application) => {
    app.use(createLoggingMiddleware(format));
  };
}

export function withErrorHandler(): ServerPlugin {
  return (app: express.Application) => {
    app.use(createErrorHandler());
  };
}

export function withRequestId(): ServerPlugin {
  return (app: express.Application) => {
    app.use(createRequestIdMiddleware());
  };
}

export function withValidation(rules: ValidationRule[]): ServerPlugin {
  return (app: express.Application) => {
    app.use(createValidationMiddleware(rules));
  };
}

export function withRateLimit(config: RateLimitConfig = {}): ServerPlugin {
  return (app: express.Application) => {
    app.use(createRateLimitMiddleware(config));
  };
}

export function withAuth(config: AuthConfig): ServerPlugin {
  return (app: express.Application) => {
    app.use(createAuthMiddleware(config));
  };
}

// Convenience functions for route-specific middleware
export function validateFields(rules: ValidationRule[]): express.RequestHandler {
  return createValidationMiddleware(rules);
}

export function rateLimit(config: RateLimitConfig = {}): express.RequestHandler {
  return createRateLimitMiddleware(config);
}

export function requireAuth(config: AuthConfig): express.RequestHandler {
  return createAuthMiddleware(config);
}