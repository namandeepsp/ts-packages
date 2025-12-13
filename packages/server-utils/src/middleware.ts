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
      success: false,
      message,
      data: undefined,
      error: {
        message,
        ...(process.env.NODE_ENV !== 'production' && { details: { stack: errorObj.stack } })
      },
      meta: null
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
        success: false,
        message: 'Validation failed',
        data: undefined,
        error: {
          message: 'Validation failed',
          details: errors
        },
        meta: null
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
        success: false,
        message,
        data: undefined,
        error: {
          message,
          details: {
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          }
        },
        meta: null
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
          success: false,
          message: unauthorizedMessage,
          data: undefined,
          error: {
            message: unauthorizedMessage
          },
          meta: null
        });
      }

      const user = await tokenValidator(token);
      (req as express.Request & { user: unknown }).user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: unauthorizedMessage,
        data: undefined,
        error: {
          message: unauthorizedMessage
        },
        meta: null
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

// Cache response middleware (per-route opt-in)
export function cacheResponse(ttl?: number): express.RequestHandler {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (req.method !== 'GET') return next();

      const cache = (req.cache ?? req.app.locals.cache) as { get?: Function; set?: Function } | undefined;
      const defaultTTL = req.app.locals.cacheDefaultTTL as number | undefined;
      if (!cache || typeof cache.get !== 'function') return next();

      const key = `${req.originalUrl}`;
      try {
        const cached = await (cache.get as Function)(key);
        if (cached !== null && cached !== undefined) {
          res.setHeader('X-Cache', 'HIT');
          return res.json(cached);
        }
      } catch (cacheErr) {
        console.error(`[Cache] Failed to retrieve key "${key}":`, cacheErr);
        // Continue without cache hit
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        try {
          const expiry = ttl ?? defaultTTL;
          if (expiry && cache && typeof cache.set === 'function') {
            (cache.set as Function)(key, body, expiry).catch((err: unknown) => {
              console.error(`[Cache] Failed to set key "${key}" with TTL ${expiry}:`, err);
            });
          } else if (cache) {
            if (typeof cache.set === 'function') {
              (cache.set as Function)(key, body).catch((err: unknown) => {
                console.error(`[Cache] Failed to set key "${key}":`, err);
              });
            }
          }
        } catch (e) {
          console.error(`[Cache] Error during cache.set operation:`, e);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[Cache] Unexpected error in cacheResponse middleware:', err);
      next();
    }
  };
}

// Session middleware helper (attaches sessionStore and helpers to req)
export function useSession(cookieName?: string): express.RequestHandler {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const store = req.app.locals.sessionStore as { get?: Function; create?: Function } | undefined;
      if (!store) return next();

      const name = cookieName || (req.app.locals.sessionCookieName as string) || 'sid';
      let sid: string | undefined = (req.cookies as Record<string, string> | undefined)?.[name];

      if (!sid) {
        const cookieHeader = req.headers.cookie;
        if (cookieHeader) {
          const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
          if (match) sid = match.split('=')[1];
        }
      }

      req.sessionId = sid;
      req.sessionStore = store;

      req.getSession = async () => {
        if (!sid) return null;
        try {
          return await (store.get as Function)(sid);
        } catch (err) {
          console.error(`[Session] Failed to get session "${sid}":`, err);
          throw err;
        }
      };

      req.createSession = async (id: string, data: Record<string, unknown>, ttl?: number) => {
        try {
          return await (store.create as Function)(id, data, ttl);
        } catch (err) {
          console.error(`[Session] Failed to create session "${id}":`, err);
          throw err;
        }
      };

      next();
    } catch (err) {
      console.error('[Session] Unexpected error in useSession middleware:', err);
      next();
    }
  };
}