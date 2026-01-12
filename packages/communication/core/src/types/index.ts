/**
 * Type definitions for communication layer
 * @packageDocumentation
 */

export type {
    HTTPMethod,
    ProtocolType,
    ServiceDiscoveryType,
    LoadBalanceStrategy,
    CircuitBreakerState,
    BackoffStrategy,
    SerializationFormat,
    LogLevel,
    ClientConfig,
    ServiceDiscoveryConfig,
    LoadBalancingConfig,
    ResilienceConfig,
    CircuitBreakerConfig,
    RetryPolicyConfig,
    TimeoutConfig,
    BulkheadConfig,
    FallbackConfig,
    ConnectionPoolConfig,
    CompressionConfig,
    RateLimitConfig,
    BaseProtocolConfig,
    HTTPProtocolConfig,
    GRPCProtocolConfig,
    WebSocketProtocolConfig,
    InterceptorConfig,
    SerializationConfig,
    LoggingConfig,
    MetricsConfig,
    CacheConfig,
} from './config.js';

export type {
    BaseRequest,
    HTTPRequest,
    GRPCRequest,
    WebSocketRequest,
    RetryConfig,
    CircuitBreakerRequestConfig,
    Request,
    RequestOptions,
    RequestContext,
} from './request.js';

export type {
    BaseResponse,
    HTTPResponse,
    GRPCResponse,
    WebSocketResponse,
    ErrorResponse,
    PaginatedResponse,
    StreamResponse,
    Response,
} from './response.js';

export type {
    ServiceInstance,
    ServiceRegistration,
    WatchCallback,
    UnwatchFunction,
    HealthCheckResult,
    ServiceEndpoint,
    ServiceDependency,
    ServiceMetrics,
    ServiceRegistryConfig,
    ServiceInstanceFilter,
    ServiceDiscoveryResult,
} from './service.js';

export type {
    BaseEvent,
    CircuitBreakerEvent,
    RetryEvent,
    ServiceDiscoveryEvent,
    LoadBalancingEvent,
    ProtocolEvent,
    ConnectionEvent,
    MetricsEvent,
    CacheEvent,
    InterceptorEvent,
    CommunicationEvent,
    EventListener,
    EventEmitter,
} from './events.js';