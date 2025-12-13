import { Request, Response, NextFunction } from "express";
import { AppError } from "../../error/AppError";

export function errorConverter(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return next(err);
    }

    // Safely extract properties from unknown error
    let message = 'Internal Error';
    let statusCode = 500;
    let details: unknown = undefined;

    if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>;
        if (typeof e.message === 'string') message = e.message;
        if (typeof e.statusCode === 'number') statusCode = e.statusCode;
        if ('details' in e) details = e.details;
    } else if (typeof err === 'string') {
        message = err;
    }

    const convertedError = new AppError(message, statusCode, details);
    next(convertedError);
}
