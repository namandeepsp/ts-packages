import { NextFunction, Request, RequestHandler, Response } from "node_modules/@types/express";

// Request ID middleware
export function createRequestIdMiddleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const requestId = Math.random().toString(36).substring(2, 15);
        req.requestId = requestId;
        res.setHeader('X-Request-ID', requestId);
        next();
    };
}