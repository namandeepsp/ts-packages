/**
 * Configuration types for communication layer
 * @packageDocumentation
 */

/**
 * HTTP methods
 */
export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS';

/**
 * Protocol types supported
 */
export type ProtocolType = 'http' | 'grpc' | 'websocket' | string;

/**
 * Service discovery types
 */
export type ServiceDiscoveryType =
    | 'kubernetes'
    | 'consul'
    | 'eureka'
    | 'static'
    | 'custom';

/**
 * Load balancing strategies
 */
export type LoadBalanceStrategy =
    | 'round-robin'
    | 'random'
    | 'weighted'
    | 'least-connections'
    | 'ip-hash'
    | 'custom';

/**
 * Circuit breaker states
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Backoff strategies for retry
 */
export type BackoffStrategy =
    | 'fixed'
    | 'exponential'
    | 'linear'
    | 'jitter'
    | 'fibonacci'
    | 'custom';

/**
 * Serialization formats
 */
export type SerializationFormat =
    | 'json'
    | 'protobuf'
    | 'xml'
    | 'yaml'
    | 'msgpack'
    | 'custom';

/**
 * Log levels for communication layer
 */
export type LogLevel =
    | 'error'
    | 'warn'
    | 'info'
    | 'debug'
    | 'trace';

/**
 * Interceptor phase
 */
export type InterceptorPhase = 'request' | 'response' | 'error';

/**
 * Interceptor execution order
 */
export interface InterceptorOrder {
    /** Phase order within request phase */
    request?: number;

    /** Phase order within response phase */
    response?: number;

    /** Phase order within error phase */
    error?: number;
}

/**
 * Load balancer selection result
 */
export interface LoadBalancerSelection {
    /** Selected service instance */
    selectedInstance: ServiceInstance;

    /** All available instances */
    availableInstances: ServiceInstance[];

    /** Selection timestamp */
    timestamp: number;

    /** Selection duration in milliseconds */
    selectionDuration: number;

    /** Selection metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Retry decision result
 */
export interface RetryDecision {
    /** Whether to retry */
    shouldRetry: boolean;

    /** Delay before next retry in milliseconds */
    delay?: number;

    /** Reason for decision */
    reason?: string;
}

/**
 * Retry context for each attempt
 */
export interface RetryContext {
    /** Current attempt number (starting from 1) */
    attempt: number;

    /** Maximum allowed attempts */
    maxAttempts: number;

    /** Last error that occurred */
    lastError?: unknown;

    /** Start time of first attempt */
    startTime: number;

    /** Total elapsed time in milliseconds */
    elapsedTime: number;

    /** Is this a retry attempt? */
    isRetry: boolean;

    /** Custom context data */
    data?: Map<string, unknown>;
}

/**
 * Serialization context
 */
export interface SerializationContext {
    /** Target format */
    format: SerializationFormat;

    /** Content type */
    contentType?: string;

    /** Character encoding */
    encoding?: string;

    /** Custom serialization options */
    options?: Record<string, unknown>;

    /** Request/response metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Deserialization context
 */
export interface DeserializationContext {
    /** Source format */
    format: SerializationFormat;

    /** Content type */
    contentType?: string;

    /** Character encoding */
    encoding?: string;

    /** Target type (for type-safe deserialization) */
    targetType?: unknown;

    /** Custom deserialization options */
    options?: Record<string, unknown>;

    /** Request/response metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Base configuration for all protocols
 */
export interface BaseProtocolConfig {
    /** Protocol name */
    name: string;

    /** Connection timeout in milliseconds */
    timeout?: number;

    /** Maximum connections */
    maxConnections?: number;

    /** Enable/disable keep-alive */
    keepAlive?: boolean;

    /** Keep-alive timeout in milliseconds */
    keepAliveTimeout?: number;

    /** Enable/disable compression */
    compression?: boolean;

    /** Custom protocol options */
    options?: Record<string, unknown>;
}

/**
 * HTTP protocol configuration
 */
export interface HttpProtocolConfig extends BaseProtocolConfig {
    /** Base URL */
    baseUrl?: string;

    /** Default headers */
    defaultHeaders?: Record<string, string>;

    /** Enable/disable automatic retry */
    retry?: boolean;

    /** Enable/disable automatic redirect */
    redirect?: boolean;

    /** With credentials for CORS */
    withCredentials?: boolean;

    /** Response type */
    responseType?: 'json' | 'text' | 'arraybuffer' | 'blob' | 'stream';

    /** Validate status function */
    validateStatus?: (status: number) => boolean;
}

/**
 * gRPC protocol configuration
 */
export interface GrpcProtocolConfig extends BaseProtocolConfig {
    /** gRPC endpoint */
    endpoint: string;

    /** Use SSL/TLS */
    ssl?: boolean;

    /** SSL/TLS certificate */
    sslCert?: Buffer | string;

    /** Keep-alive parameters */
    keepAliveParams?: {
        /** Keep-alive time in seconds */
        keepaliveTime?: number;

        /** Keep-alive timeout in seconds */
        keepaliveTimeout?: number;

        /** Keep-alive permit without calls */
        keepalivePermitWithoutCalls?: boolean;
    };

    /** Maximum message size in bytes */
    maxMessageSize?: number;

    /** Maximum metadata size in bytes */
    maxMetadataSize?: number;
}

/**
 * WebSocket protocol configuration
 */
export interface WebSocketProtocolConfig extends BaseProtocolConfig {
    /** WebSocket URL */
    url: string;

    /** Protocols */
    protocols?: string[];

    /** Reconnection attempts */
    reconnectAttempts?: number;

    /** Reconnection delay in milliseconds */
    reconnectDelay?: number;

    /** Heartbeat interval in milliseconds */
    heartbeatInterval?: number;

    /** Heartbeat timeout in milliseconds */
    heartbeatTimeout?: number;

    /** Queue size for messages */
    queueSize?: number;
}

/**
 * Client configuration
 */
export interface ClientConfig {
    /** Service name */
    serviceName: string;

    /** Protocol configuration */
    protocol?: BaseProtocolConfig;

    /** Service discovery configuration */
    discovery?: ServiceDiscoveryConfig;

    /** Load balancing configuration */
    loadBalancing?: LoadBalancingConfig;

    /** Resilience configuration */
    resilience?: ResilienceConfig;

    /** Connection pool configuration */
    connectionPool?: ConnectionPoolConfig;

    /** Compression configuration */
    compression?: CompressionConfig;

    /** Rate limiting configuration */
    rateLimit?: RateLimitConfig;

    /** Interceptors */
    interceptors?: InterceptorConfig[];

    /** Serialization configuration */
    serialization?: SerializationConfig;

    /** Logging configuration */
    logging?: LoggingConfig;

    /** Metrics configuration */
    metrics?: MetricsConfig;

    /** Cache configuration */
    cache?: CacheConfig;

    /** Custom configuration */
    custom?: Record<string, unknown>;
}

/**
 * Service discovery configuration
 */
export interface ServiceDiscoveryConfig {
    /** Discovery type */
    type: ServiceDiscoveryType;

    /** Service discovery endpoint */
    endpoint?: string;

    /** Cache TTL in milliseconds */
    cacheTTL?: number;

    /** Health check interval in milliseconds */
    healthCheckInterval?: number;

    /** Health check timeout in milliseconds */
    healthCheckTimeout?: number;

    /** Custom discovery options */
    options?: Record<string, unknown>;
}

/**
 * Load balancing configuration
 */
export interface LoadBalancingConfig {
    /** Load balancing strategy */
    strategy: LoadBalanceStrategy;

    /** Instance weights (for weighted strategies) */
    weights?: Record<string, number>;

    /** Sticky sessions configuration */
    sticky?: {
        /** Enable sticky sessions */
        enabled: boolean;

        /** Session key */
        key?: string;

        /** Session TTL in milliseconds */
        ttl?: number;
    };

    /** Custom load balancing options */
    options?: Record<string, unknown>;
}

/**
 * Resilience configuration
 */
export interface ResilienceConfig {
    /** Circuit breaker configuration */
    circuitBreaker?: CircuitBreakerConfig;

    /** Retry configuration */
    retry?: RetryPolicyConfig;

    /** Timeout configuration */
    timeout?: TimeoutConfig;

    /** Bulkhead configuration */
    bulkhead?: BulkheadConfig;

    /** Fallback configuration */
    fallback?: FallbackConfig;

    /** Rate limiting configuration */
    rateLimit?: RateLimitConfig; // Moved from ClientConfig for better organization
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
    /** Enable circuit breaker */
    enabled?: boolean;

    /** Failure threshold before opening */
    failureThreshold?: number;

    /** Success threshold before closing */
    successThreshold?: number;

    /** Reset timeout in milliseconds */
    resetTimeout?: number;

    /** Half-open max attempts */
    halfOpenMaxAttempts?: number;

    /** Excluded endpoints */
    exclude?: string[];

    /** Custom circuit breaker options */
    options?: Record<string, unknown>;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicyConfig {
    /** Enable retry */
    enabled?: boolean;

    /** Maximum retry attempts */
    maxAttempts?: number;

    /** Backoff strategy */
    backoffStrategy?: BackoffStrategy;

    /** Backoff configuration */
    backoff?: {
        /** Initial delay in milliseconds */
        initialDelay?: number;

        /** Maximum delay in milliseconds */
        maxDelay?: number;

        /** Multiplier for exponential backoff */
        multiplier?: number;

        /** Jitter factor (0-1) */
        jitter?: number;

        /** Custom backoff function */
        custom?: (attempt: number) => number;
    };

    /** Retry on specific status codes */
    retryOnStatus?: number[];

    /** Retry on specific error types */
    retryOnErrors?: string[];

    /** Custom retry options */
    options?: Record<string, unknown>;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
    /** Global timeout in milliseconds */
    global?: number;

    /** Connection timeout in milliseconds */
    connection?: number;

    /** Read timeout in milliseconds */
    read?: number;

    /** Write timeout in milliseconds */
    write?: number;

    /** Request timeout in milliseconds */
    request?: number;
}

/**
 * Bulkhead configuration
 */
export interface BulkheadConfig {
    /** Enable bulkhead */
    enabled?: boolean;

    /** Maximum concurrent executions */
    maxConcurrent?: number;

    /** Maximum queue size */
    maxQueue?: number;

    /** Queue timeout in milliseconds */
    queueTimeout?: number;
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
    /** Enable fallback */
    enabled?: boolean;

    /** Fallback function or value */
    fallback?: unknown;

    /** Fallback condition */
    condition?: (error: Error) => boolean;
}

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
    /** Interceptor type or function */
    interceptor: string | Function;

    /** Interceptor options */
    options?: Record<string, unknown>;

    /** Execution order */
    order?: number;
}

/**
 * Serialization configuration
 */
export interface SerializationConfig {
    /** Default serialization format */
    format?: SerializationFormat;

    /** Date parsing strategy */
    dateParsing?: 'string' | 'date' | 'timestamp';

    /** BigInt parsing strategy */
    bigIntParsing?: 'string' | 'number' | 'bigint';

    /** Custom serializers */
    customSerializers?: Record<string, Function>;

    /** Custom deserializers */
    customDeserializers?: Record<string, Function>;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
    /** Enable logging */
    enabled?: boolean;

    /** Log level */
    level?: LogLevel;

    /** Log format */
    format?: 'json' | 'text' | 'custom';

    /** Custom logger */
    logger?: Function;

    /** Log fields to include */
    fields?: string[];

    /** Redact sensitive fields */
    redact?: string[];
}

/**
 * Metrics configuration
 */
export interface MetricsConfig {
    /** Enable metrics */
    enabled?: boolean;

    /** Metrics collector */
    collector?: Function;

    /** Metrics prefix */
    prefix?: string;

    /** Custom labels */
    labels?: Record<string, string>;

    /** Histogram buckets */
    buckets?: number[];

    /** Metrics aggregation interval in milliseconds */
    interval?: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
    /** Enable caching */
    enabled?: boolean;

    /** Cache TTL in milliseconds */
    ttl?: number;

    /** Cache key generator */
    keyGenerator?: (request: unknown) => string;

    /** Cache storage */
    storage?: 'memory' | 'redis' | 'custom';

    /** Cache storage options */
    storageOptions?: Record<string, unknown>;

    /** Cache invalidation strategy */
    invalidation?: {
        /** Invalidate on write operations */
        onWrite?: boolean;

        /** Invalidate after time */
        afterTime?: number;

        /** Custom invalidation function */
        custom?: Function;
    };
}

// Service Instance interface (needed for LoadBalancerSelection)
interface ServiceInstance {
    id: string;
    serviceName: string;
    host: string;
    port: number;
    status: 'healthy' | 'unhealthy' | 'unknown';
    [key: string]: unknown;
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
    /** Enable connection pooling */
    enabled?: boolean;

    /** Minimum connections in pool */
    minConnections?: number;

    /** Maximum connections in pool */
    maxConnections?: number;

    /** Connection idle timeout in milliseconds */
    idleTimeout?: number;

    /** Connection lifetime in milliseconds */
    maxLifetime?: number;

    /** Connection acquisition timeout in milliseconds */
    acquireTimeout?: number;

    /** Connection validation interval in milliseconds */
    validationInterval?: number;

    /** Enable connection warmup */
    warmup?: boolean;

    /** Custom pool options */
    options?: Record<string, unknown>;
}

/**
 * Compression configuration
 */
export interface CompressionConfig {
    /** Enable compression */
    enabled?: boolean;

    /** Compression algorithm */
    algorithm?: 'gzip' | 'deflate' | 'brotli' | 'none';

    /** Compression level (1-11) */
    level?: number;

    /** Minimum size to compress in bytes */
    minSize?: number;

    /** Maximum size to compress in bytes */
    maxSize?: number;

    /** Content types to compress */
    contentTypes?: string[];

    /** Custom compression options */
    options?: Record<string, unknown>;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
    /** Enable rate limiting */
    enabled?: boolean;

    /** Maximum requests per window */
    maxRequests?: number;

    /** Time window in milliseconds */
    windowMs?: number;

    /** Rate limit key generator */
    keyGenerator?: (request: unknown) => string;

    /** Skip successful requests */
    skipSuccessfulRequests?: boolean;

    /** Enable request queue */
    queue?: boolean;

    /** Maximum queue size */
    maxQueueSize?: number;

    /** Custom rate limit options */
    options?: Record<string, unknown>;
}