import { Request, Response, NextFunction } from "express";
import { AppError } from "../../error/AppError";

export function errorConverter(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return next(err);
    }

    const convertedError = new AppError(
        err.message || "Internal Error",
        err.statusCode || 500,
        err.details || undefined
    );

    next(convertedError);
}
