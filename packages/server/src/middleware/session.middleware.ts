import type { NextFunction, Request, RequestHandler, Response } from 'express'

// Session middleware helper (attaches sessionStore and helpers to req)
export function useSession(cookieName?: string): RequestHandler {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const store = req.app.locals.sessionStore as
				| { get?: Function; create?: Function }
				| undefined
			if (!store) return next()

			const name =
				cookieName || (req.app.locals.sessionCookieName as string) || 'sid'
			let sid: string | undefined = (
				req.cookies as Record<string, string> | undefined
			)?.[name]

			if (!sid) {
				const cookieHeader = req.headers.cookie
				if (cookieHeader) {
					const match = cookieHeader
						.split(';')
						.map((s) => s.trim())
						.find((s) => s.startsWith(`${name}=`))
					if (match) sid = match.split('=')[1]
				}
			}

			req.sessionId = sid
			req.sessionStore = store

			req.getSession = async () => {
				if (!sid) return null
				try {
					return await (store.get as Function)(sid)
				} catch (error) {
					console.error(`[Session] Failed to get session "${sid}":`, error)
					throw error
				}
			}

			req.createSession = async (
				id: string,
				data: Record<string, unknown>,
				ttl?: number,
			) => {
				try {
					return await (store.create as Function)(id, data, ttl)
				} catch (error) {
					console.error(`[Session] Failed to create session "${id}":`, error)
					throw error
				}
			}

			next()
		} catch (error) {
			console.error(
				'[Session] Unexpected error in useSession middleware:',
				error,
			)
			next()
		}
	}
}
