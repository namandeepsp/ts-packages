import type { RequestHandler } from 'express';
import { createResponderFactory } from '../../core/factory';
import { ResponderConfig } from '../../core/config';


export const responderMiddleware = (cfg?: Partial<ResponderConfig>): RequestHandler => {
    const factory = createResponderFactory(cfg);

    return (req, res, next) => {
        (res as any).responder = <P>() => factory<P>(res);
        next();
    };
};
