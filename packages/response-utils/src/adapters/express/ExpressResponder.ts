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
}