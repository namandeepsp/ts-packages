import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/AppError";
import { ExpressResponder } from "@naman_deep_singh/response-utils";
import { mapAppErrorToResponder } from "src/utils";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const responder = new ExpressResponder({}, res);

    // AppError → known operational error
    if (err instanceof AppError) {
        return mapAppErrorToResponder(responder, err);
    }

    // Unexpected / programming / unknown error
    console.error("UNEXPECTED ERROR:", err);

    return responder.serverError("Internal server error", { details: err });
}
