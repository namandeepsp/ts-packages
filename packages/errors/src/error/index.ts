export { AppError } from './AppError.js'
export { HTTPError } from './HTTPError.js'

// =========================
// 4xx Client Errors
// =========================
export { BadRequestError } from './BadRequestError.js'
export { UnauthorizedError } from './UnauthorizedError.js'
export { ForbiddenError } from './ForbiddenError.js'
export { NotFoundError } from './NotFoundError.js'
export { ConflictError } from './ConflictError.js'
export { ValidationError } from './ValidationError.js'
export { TooManyRequestsError } from './TooManyRequestsError.js'

// =========================
// Auth / Token Errors
// =========================
export { TokenExpiredError } from './TokenExpiredError.js'
export { TokenMalformedError } from './TokenMalformedError.js'

// =========================
// 5xx Server Errors
// =========================
export { InternalServerError } from './InternalServerError.js'
export { CryptoIntegrityError } from './CryptoIntegrityError.js'
export { ServiceUnavailableError } from './ServiceUnavailableError.js'
