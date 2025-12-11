export interface TokenSources {
    header?: string | undefined | null;
    cookies?: Record<string, string> | undefined;
    query?: Record<string, string | undefined> | undefined;
    body?: Record<string, any> | undefined;
    wsMessage?: string | Record<string, any> | undefined; // NEW
}

/**
 * Universal token extractor
 */
export function extractToken(sources: TokenSources): string | null {
    const { header, cookies, query, body, wsMessage } = sources;

    // 1. Authorization: Bearer <token>
    if (header) {
        const parts = header.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
    }

    // 2. Cookies: token / accessToken
    if (cookies) {
        if (cookies["token"]) return cookies["token"];
        if (cookies["accessToken"]) return cookies["accessToken"];
    }

    // 3. Query params: ?token=xxx
    if (query?.token) return query.token;

    // 4. Body: { token: "" }
    if (body?.token) return body.token;

    // 5. WebSocket message extraction (NEW)
    if (wsMessage) {
        try {
            let msg: any = wsMessage;

            // If it's a JSON string → parse safely
            if (typeof wsMessage === "string") {
                msg = JSON.parse(wsMessage);
            }

            // Direct token
            if (typeof msg.token === "string") return msg.token;

            // Nested token: { auth: { token: "" } }
            if (msg.auth && typeof msg.auth.token === "string") {
                return msg.auth.token;
            }
        } catch {
            // Ignore parse errors gracefully
        }
    }

    return null;
}
