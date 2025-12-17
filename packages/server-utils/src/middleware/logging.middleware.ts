import { NextFunction, Request, RequestHandler, Response } from "node_modules/@types/express";

// Logging middleware
export function createLoggingMiddleware(format: 'simple' | 'detailed' = 'simple'): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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