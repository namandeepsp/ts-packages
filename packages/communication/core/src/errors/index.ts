import { errorMessageRegistry } from "@naman_deep_singh/errors";
import { COMMUNICATION_ERROR_CODES } from "./communicationErrorCodes.js";

// Register communication error messages with the global registry
errorMessageRegistry.register(COMMUNICATION_ERROR_CODES);

// Export error classes
export { CircuitBreakerError, CircuitBreakerErrorType } from "./CircuitBreakerError.js";
export { CommunicationError, CommunicationErrorType } from "./CommunicationError.js";
export { ConnectionError, ConnectionErrorType } from "./ConnectionError.js";
export { DiscoveryError, DiscoveryErrorType } from "./DiscoveryError.js";
export { LoadBalancerError, LoadBalancerErrorType } from "./LoadBalancerError.js";
export { ProtocolError, ProtocolErrorType } from "./ProtocolError.js";
export { RetryError, RetryErrorType } from "./RetryError.js";
export { SerializationError, SerializationErrorType } from "./SerializationError.js";
export { ServiceUnavailableError, ServiceUnavailableErrorType } from "./ServiceUnavailableError.js";
export { TimeoutError, TimeoutErrorType } from "./TimeoutError.js";

// Also export error codes for convenience
export { COMMUNICATION_ERROR_CODES, type CommunicationErrorCode } from "./communicationErrorCodes.js";