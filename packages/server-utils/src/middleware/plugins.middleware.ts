import express, { Application, NextFunction, Request, RequestHandler, Response } from 'express';

import { ServerPlugin } from '../types';
import { createLoggingMiddleware } from './logging.middleware';
import { createErrorHandler } from './errorHandler.middleware';
import { createRequestIdMiddleware } from './requestId.middleware';
import { createValidationMiddleware, ValidationRule } from './validation.middleware';
import { createRateLimitMiddleware, RateLimitConfig } from './rateLimiter.middleware';

import { AuthConfig, createAuthMiddleware } from './auth.middleware';

// Plugin versions
export function withLogging(format: 'simple' | 'detailed' = 'simple'): ServerPlugin {
    return (app: Application) => {
        app.use(createLoggingMiddleware(format));
    };
}

export function withErrorHandler(): ServerPlugin {
    return (app: Application) => {
        app.use(createErrorHandler());
    };
}

export function withRequestId(): ServerPlugin {
    return (app: Application) => {
        app.use(createRequestIdMiddleware());
    };
}

export function withValidation(rules: ValidationRule[]): ServerPlugin {
    return (app: Application) => {
        app.use(createValidationMiddleware(rules));
    };
}

export function withRateLimit(config: RateLimitConfig = {}): ServerPlugin {
    return (app: Application) => {
        app.use(createRateLimitMiddleware(config));
    };
}

export function withAuth(config: AuthConfig): ServerPlugin {
    return (app: Application) => {
        app.use(createAuthMiddleware(config));
    };
}

// Convenience functions for route-specific middleware
export function validateFields(rules: ValidationRule[]): RequestHandler {
    return createValidationMiddleware(rules);
}

export function rateLimit(config: RateLimitConfig = {}): RequestHandler {
    return createRateLimitMiddleware(config);
}

export function requireAuth(config: AuthConfig): RequestHandler {
    return createAuthMiddleware(config);
}