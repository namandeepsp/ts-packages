/**
 * Communication-specific error codes
 * Extends the existing ERROR_CODES
 */
export const COMMUNICATION_ERROR_CODES = {
    // Protocol errors
    PROTOCOL_ERROR: 'Protocol communication failed',
    HTTP_PROTOCOL_ERROR: 'HTTP protocol error occurred',
    GRPC_PROTOCOL_ERROR: 'gRPC protocol error occurred',
    WEBSOCKET_PROTOCOL_ERROR: 'WebSocket protocol error occurred',

    // Discovery errors
    DISCOVERY_ERROR: 'Service discovery failed',
    SERVICE_NOT_FOUND: 'Service not found in registry',
    NO_AVAILABLE_INSTANCES: 'No available service instances',
    DISCOVERY_TIMEOUT: 'Service discovery timed out',

    // Resilience errors
    CIRCUIT_BREAKER_OPEN: 'Circuit breaker is open, request blocked',
    CIRCUIT_BREAKER_ERROR: 'Circuit breaker encountered an error',
    RETRY_EXHAUSTED: 'Retry attempts exhausted',
    BULKHEAD_FULL: 'Bulkhead is full, request rejected',
    TIMEOUT_EXHAUSTED: 'Operation timeout exceeded',

    // Load balancing errors
    LOAD_BALANCER_ERROR: 'Load balancing failed',
    NO_HEALTHY_INSTANCES: 'No healthy instances available',

    // Serialization errors
    SERIALIZATION_ERROR: 'Serialization failed',
    DESERIALIZATION_ERROR: 'Deserialization failed',

    // Connection errors
    CONNECTION_ERROR: 'Connection failed',
    CONNECTION_TIMEOUT: 'Connection timeout',
    CONNECTION_REFUSED: 'Connection refused',
} as const;

export type CommunicationErrorCode =
    typeof COMMUNICATION_ERROR_CODES[keyof typeof COMMUNICATION_ERROR_CODES];