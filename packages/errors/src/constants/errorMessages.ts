
/**
 * Canonical error messages mapped to ERROR_CODES
 * - Human-readable
 * - Safe for API responses
 * - Useful for logs
 * - Can be overridden by services if needed
 */

import { ERROR_CODES, type ErrorCode } from "./errorCodes.js";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	/* ------------------------------------------------------------------ */
	/* 🧱 Common / Generic                                                  */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.BAD_REQUEST]: 'The request is invalid or malformed.',
	[ERROR_CODES.VALIDATION_FAILED]: 'Request validation failed.',
	[ERROR_CODES.UNAUTHORIZED]: 'Authentication is required.',
	[ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
	[ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
	[ERROR_CODES.CONFLICT]:
		'The request could not be completed due to a conflict.',
	[ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',

	[ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An unexpected internal error occurred.',
	[ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is currently unavailable.',
	[ERROR_CODES.DEPENDENCY_FAILURE]: 'A dependent service failed to respond.',

	/* ------------------------------------------------------------------ */
	/* 🌐 HTTP / Network                                                    */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.HTTP_ERROR]:
		'An HTTP error occurred while processing the request.',
	[ERROR_CODES.HTTP_TIMEOUT]: 'The request timed out.',
	[ERROR_CODES.UPSTREAM_SERVICE_ERROR]:
		'An upstream service returned an error.',

	/* ------------------------------------------------------------------ */
	/* 🔐 Authentication / Authorization                                   */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.AUTH_FAILED]: 'Authentication failed.',
	[ERROR_CODES.TOKEN_MISSING]: 'Authentication token is missing.',
	[ERROR_CODES.TOKEN_INVALID]: 'Authentication token is invalid.',
	[ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token has expired.',

	/* ------------------------------------------------------------------ */
	/* 🔑 Cryptography / Security                                          */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.CRYPTO_ERROR]: 'A cryptographic operation failed.',
	[ERROR_CODES.CRYPTO_INTEGRITY_ERROR]: 'Data integrity verification failed.',

	/* ------------------------------------------------------------------ */
	/* 💾 Cache                                                             */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.CACHE_ERROR]: 'A cache operation failed.',
	[ERROR_CODES.CACHE_CONNECTION_FAILED]:
		'Failed to connect to the cache store.',

	/* ------------------------------------------------------------------ */
	/* 🗄️ Database                                                          */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.DATABASE_ERROR]: 'A database error occurred.',
	[ERROR_CODES.DATABASE_CONNECTION_FAILED]:
		'Failed to connect to the database.',
	[ERROR_CODES.DATABASE_CONSTRAINT_VIOLATION]:
		'The operation violates a database constraint.',

	/* ------------------------------------------------------------------ */
	/* 📩 Messaging / Queues                                                */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.MESSAGE_BROKER_ERROR]: 'A message broker error occurred.',
	[ERROR_CODES.MESSAGE_PUBLISH_FAILED]:
		'Failed to publish message to the message broker.',

	/* ------------------------------------------------------------------ */
	/* 📁 File / Storage                                                    */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.FILE_ERROR]: 'A file operation failed.',
	[ERROR_CODES.FILE_NOT_FOUND]: 'The requested file was not found.',
	[ERROR_CODES.FILE_UPLOAD_FAILED]: 'File upload failed.',
	[ERROR_CODES.FILE_TOO_LARGE]: 'The uploaded file exceeds the allowed size.',

	/* ------------------------------------------------------------------ */
	/* ⚙️ Configuration / Environment                                      */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.CONFIG_ERROR]: 'Configuration error detected.',
	[ERROR_CODES.CONFIG_MISSING]: 'Required configuration is missing.',

	/* ------------------------------------------------------------------ */
	/* ⏱️ Timeouts / Resources                                              */
	/* ------------------------------------------------------------------ */
	[ERROR_CODES.TIMEOUT_ERROR]: 'The operation timed out.',
	[ERROR_CODES.RESOURCE_EXHAUSTED]:
		'The system has exhausted required resources.',
}
