import { BaseResponder } from '../../core/BaseResponder';
import type { ResponderConfig } from '../../core/config';
import type { Response } from 'express';


export class ExpressResponder<P = unknown> extends BaseResponder<P> {
    constructor(cfg: Partial<ResponderConfig> | undefined, private readonly res: Response) {
        // attach sender which calls res.status().json()
        super(cfg, (status, body) => res.status(status).json(body));
    }


    // convenience methods that return void for middleware/controller ergonomics
    okAndSend(data?: P, message?: string) {
        void this.ok(data, message);
    }

    createdAndSend(data?: P, message?: string) {
        void this.created(data, message);
    }

    badRequestAndSend(message?: string, error?: unknown) {
        void this.badRequest(message, error);
    }

    unauthorizedAndSend(message?: string) {
        void this.unauthorized(message);
    }

    forbiddenAndSend(message?: string) {
        void this.forbidden(message);
    }

    notFoundAndSend(message?: string) {
        void this.notFound(message);
    }

    conflictAndSend(message?: string) {
        void this.conflict(message);
    }

    unprocessableEntityAndSend(message?: string, error?: unknown) {
        void this.unprocessableEntity(message, error);
    }

    tooManyRequestsAndSend(message?: string) {
        void this.tooManyRequests(message);
    }

    serverErrorAndSend(message?: string, error?: unknown) {
        void this.serverError(message, error);
    }

    paginateAndSend(
        data: P[],
        page: number,
        limit: number,
        total: number,
        message?: string
    ) {
        void this.paginate(data, page, limit, total, message);
    }
}