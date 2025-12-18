export interface TokenSources {
	header?: string | undefined | null
	cookies?: Record<string, string> | undefined
	query?: Record<string, string | undefined> | undefined
	body?: Record<string, unknown> | undefined
	wsMessage?: string | Record<string, unknown> | undefined // NEW
}

/**
 * Universal token extractor
 */
export function extractToken(sources: TokenSources): string | null {
	const { header, cookies, query, body, wsMessage } = sources

	// 1. Authorization: Bearer <token>
	if (header) {
		const parts = header.split(' ')
		if (parts.length === 2 && parts[0] === 'Bearer') return parts[1]
	}

	// 2. Cookies: token / accessToken
	if (cookies) {
		if (cookies['token']) return cookies['token']
		if (cookies['accessToken']) return cookies['accessToken']
	}

	// 3. Query params: ?token=xxx
	if (query?.token) return query.token

	// 4. Body: { token: "" }
	if (body?.token && typeof body.token === 'string') return body.token

	// 5. WebSocket message extraction (NEW)
	if (wsMessage) {
		try {
			let msg: unknown = wsMessage

			// If it's a JSON string → parse safely
			if (typeof wsMessage === 'string') {
				msg = JSON.parse(wsMessage) as unknown
			}

			// Ensure msg is an object before property access
			if (typeof msg === 'object' && msg !== null) {
				const m = msg as Record<string, unknown>
				if (typeof m['token'] === 'string') return m['token'] as string
				const auth = m['auth']
				if (typeof auth === 'object' && auth !== null) {
					const a = auth as Record<string, unknown>
					if (typeof a['token'] === 'string') return a['token'] as string
				}
			}
		} catch {
			// Ignore parse errors gracefully
		}
	}

	return null
}
