import { ErrorRequestHandler, NextFunction, Request, Response } from "node_modules/@types/express";

// Error handling middleware
export function createErrorHandler(): ErrorRequestHandler {
    return (err: unknown, req: Request, res: Response, next: NextFunction) => {
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