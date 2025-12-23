export const ERROR_CODES = {
	/* ------------------------------------------------------------------ */
	/* 🧱 Common / Generic                                                  */
	/* ------------------------------------------------------------------ */
	BAD_REQUEST: 'BAD_REQUEST',
	VALIDATION_FAILED: 'VALIDATION_FAILED',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	CONFLICT: 'CONFLICT',
	TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
	DEPENDENCY_FAILURE: 'DEPENDENCY_FAILURE',

	/* ------------------------------------------------------------------ */
	/* 🌐 HTTP / Network                                                    */
	/* ------------------------------------------------------------------ */
	HTTP_ERROR: 'HTTP_ERROR',
	HTTP_TIMEOUT: 'HTTP_TIMEOUT',
	UPSTREAM_SERVICE_ERROR: 'UPSTREAM_SERVICE_ERROR',

	/* ------------------------------------------------------------------ */
	/* 🔐 Authentication / Authorization                                   */
	/* ------------------------------------------------------------------ */
	AUTH_FAILED: 'AUTH_FAILED',
	TOKEN_MISSING: 'TOKEN_MISSING',
	TOKEN_INVALID: 'TOKEN_INVALID',
	TOKEN_EXPIRED: 'TOKEN_EXPIRED',

	/* ------------------------------------------------------------------ */
	/* 🔑 Cryptography / Security                                          */
	/* ------------------------------------------------------------------ */
	CRYPTO_ERROR: 'CRYPTO_ERROR',
	CRYPTO_INTEGRITY_ERROR: 'CRYPTO_INTEGRITY_ERROR',

	/* ------------------------------------------------------------------ */
	/* 💾 Cache                                                             */
	/* ------------------------------------------------------------------ */
	CACHE_ERROR: 'CACHE_ERROR',
	CACHE_CONNECTION_FAILED: 'CACHE_CONNECTION_FAILED',

	/* ------------------------------------------------------------------ */
	/* 🗄️ Database                                                          */
	/* ------------------------------------------------------------------ */
	DATABASE_ERROR: 'DATABASE_ERROR',
	DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
	DATABASE_CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION',

	/* ------------------------------------------------------------------ */
	/* 📩 Messaging / Queues                                                */
	/* ------------------------------------------------------------------ */
	MESSAGE_BROKER_ERROR: 'MESSAGE_BROKER_ERROR',
	MESSAGE_PUBLISH_FAILED: 'MESSAGE_PUBLISH_FAILED',

	/* ------------------------------------------------------------------ */
	/* 📁 File / Storage                                                    */
	/* ------------------------------------------------------------------ */
	FILE_ERROR: 'FILE_ERROR',
	FILE_NOT_FOUND: 'FILE_NOT_FOUND',
	FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
	FILE_TOO_LARGE: 'FILE_TOO_LARGE',

	/* ------------------------------------------------------------------ */
	/* ⚙️ Configuration / Environment                                      */
	/* ------------------------------------------------------------------ */
	CONFIG_ERROR: 'CONFIG_ERROR',
	CONFIG_MISSING: 'CONFIG_MISSING',

	/* ------------------------------------------------------------------ */
	/* ⏱️ Timeouts / Resources                                              */
	/* ------------------------------------------------------------------ */
	TIMEOUT_ERROR: 'TIMEOUT_ERROR',
	RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
