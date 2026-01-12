import { errorMessageRegistry } from "@naman_deep_singh/errors";
import { COMMUNICATION_ERROR_CODES } from "./communicationErrorCodes.js";

// Register communication error messages with the global registry
errorMessageRegistry.register(COMMUNICATION_ERROR_CODES);

// Export error classes
export { CircuitBreakerError, type CircuitBreakerErrorType } from "./CircuitBreakerError.js";
export { CommunicationError, type CommunicationErrorType } from "./CommunicationError.js";
export { ConnectionError, type ConnectionErrorType } from "./ConnectionError.js";
export { DiscoveryError, type DiscoveryErrorType } from "./DiscoveryError.js";
export { LoadBalancerError, type LoadBalancerErrorType } from "./LoadBalancerError.js";
export { ProtocolError, type ProtocolErrorType } from "./ProtocolError.js";
export { RetryError, type RetryErrorType } from "./RetryError.js";
export { SerializationError, type SerializationErrorType } from "./SerializationError.js";
export { ServiceUnavailableError, type ServiceUnavailableErrorType } from "./ServiceUnavailableError.js";
export { TimeoutError, type TimeoutErrorType } from "./TimeoutError.js";

// Also export error codes for convenience
export { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";
