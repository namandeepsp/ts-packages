// Core responder
export { BaseResponder } from './BaseResponder.js'

// Factory (advanced usage)
export { createResponderFactory } from './factory.js'

// Configuration
export type { ResponderConfig, EnvelopeKeys } from './config.js'
export { defaultConfig } from './config.js'

// Core types (explicit)
export type {
    ResponseEnvelope,
    ErrorShape,
    PaginationMeta,
    PlainObject,
    Sender,
    TransportResult,
} from './types.js'
