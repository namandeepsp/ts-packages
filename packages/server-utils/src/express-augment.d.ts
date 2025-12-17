// Express augmentation to type runtime properties we attach in middleware
declare global {
    namespace Express {
        interface Request {
            // cache instance attached at runtime (may be provided by server setup)
            cache?: unknown;
            // session store attached at runtime
            sessionStore?: unknown;
            // session id extracted from cookie/header
            sessionId?: string | undefined;
            // user
            user?: unknown;
            // request id
            requestId?: string;
            // helper helpers
            getSession?: () => Promise<unknown>;
            createSession?: (id: string, data: Record<string, unknown>, ttl?: number) => Promise<unknown>;
        }

        interface Application {
            locals: Record<string, unknown> & {
                cache?: unknown;
                cacheDefaultTTL?: number;
                sessionStore?: unknown;
                sessionCookieName?: string;
            };
        }
    }
}

export { };
