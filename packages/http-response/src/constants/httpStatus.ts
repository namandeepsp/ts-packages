const SUCCESS = Object.freeze({
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
} as const)

const REDIRECTION = Object.freeze({
	NOT_MODIFIED: 304,
} as const)

const CLIENT_ERROR = Object.freeze({
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
} as const)

const SERVER_ERROR = Object.freeze({
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const)

export const HTTP_STATUS = Object.freeze({
	SUCCESS,
	REDIRECTION,
	CLIENT_ERROR,
	SERVER_ERROR,
} as const)

// flattened union type if needed:
export type HttpStatusCode =
	| (typeof SUCCESS)[keyof typeof SUCCESS]
	| (typeof REDIRECTION)[keyof typeof REDIRECTION]
	| (typeof CLIENT_ERROR)[keyof typeof CLIENT_ERROR]
	| (typeof SERVER_ERROR)[keyof typeof SERVER_ERROR]
