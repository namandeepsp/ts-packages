/**
 * Service discovery and instance types
 * @packageDocumentation
 */

/**
 * Service instance representation
 */
export interface ServiceInstance {
    /** Unique instance identifier */
    id: string;

    /** Service name */
    serviceName: string;

    /** Host address */
    host: string;

    /** Port number */
    port: number;

    /** Protocol (http, https, grpc, etc.) */
    protocol?: string;

    /** Health status */
    status: 'healthy' | 'unhealthy' | 'unknown';

    /** Last health check timestamp */
    lastHealthCheck?: number;

    /** Instance metadata */
    metadata?: Record<string, unknown>;

    /** Tags for categorization */
    tags?: string[];

    /** Weight for load balancing */
    weight?: number;

    /** Zone/region for locality-aware routing */
    zone?: string;

    /** Current load/connections */
    load?: number;

    /** Instance version */
    version?: string;

    /** Instance uptime in milliseconds */
    uptime?: number;

    /** Custom health check data */
    healthData?: Record<string, unknown>;
}

/**
 * Service registration information
 */
export interface ServiceRegistration {
    /** Service name */
    name: string;

    /** Service ID */
    id: string;

    /** Service address */
    address: string;

    /** Service port */
    port: number;

    /** Health check configuration */
    healthCheck?: {
        /** HTTP endpoint for health checks */
        http?: string;

        /** gRPC health check service */
        grpc?: string;

        /** TCP health check port */
        tcp?: number;

        /** Health check interval in seconds */
        interval?: number;

        /** Health check timeout in seconds */
        timeout?: number;

        /** Deregister after failed health checks */
        deregisterAfter?: string;

        /** Health check headers */
        headers?: Record<string, string>;

        /** Health check expected status */
        expectedStatus?: number;
    };

    /** Service tags */
    tags?: string[];

    /** Service metadata */
    meta?: Record<string, unknown>;

    /** Service version */
    version?: string;

    /** Enable/disable service */
    enabled?: boolean;

    /** Custom registration data */
    custom?: Record<string, unknown>;
}

/**
 * Service discovery watch callback
 */
export type WatchCallback = (instances: ServiceInstance[]) => void;

/**
 * Service discovery unwatch function
 */
export type UnwatchFunction = () => void;

/**
 * Health check result
 */
export interface HealthCheckResult {
    /** Is the instance healthy? */
    healthy: boolean;

    /** Health check timestamp */
    timestamp: number;

    /** Response time in milliseconds */
    responseTime?: number;

    /** Error if health check failed */
    error?: string;

    /** HTTP status code if applicable */
    statusCode?: number;

    /** Additional health details */
    details?: Record<string, unknown>;

    /** Service instance ID */
    instanceId?: string;
}

/**
 * Service endpoint configuration
 */
export interface ServiceEndpoint {
    /** Service name */
    service: string;

    /** Endpoint path */
    endpoint: string;

    /** HTTP method */
    method?: string;

    /** Request timeout in milliseconds */
    timeout?: number;

    /** Retry configuration */
    retry?: {
        /** Maximum retry attempts */
        attempts?: number;

        /** Backoff delay in milliseconds */
        backoff?: number;

        /** Retry on specific status codes */
        retryOnStatus?: number[];
    };

    /** Circuit breaker configuration */
    circuitBreaker?: {
        /** Enable circuit breaker */
        enabled?: boolean;

        /** Failure threshold */
        failureThreshold?: number;

        /** Reset timeout */
        resetTimeout?: number;
    };

    /** Headers to include */
    headers?: Record<string, string>;

    /** Query parameters */
    query?: Record<string, string | number | boolean>;
}

/**
 * Service dependency configuration
 */
export interface ServiceDependency {
    /** Dependent service name */
    service: string;

    /** Dependency type */
    type: 'hard' | 'soft' | 'optional';

    /** Required version (semver) */
    version?: string;

    /** Health check endpoint */
    healthEndpoint?: string;

    /** Timeout for dependency calls in milliseconds */
    timeout?: number;

    /** Circuit breaker configuration */
    circuitBreaker?: {
        enabled?: boolean;
        failureThreshold?: number;
    };

    /** Fallback configuration */
    fallback?: {
        enabled?: boolean;
        value?: unknown;
        function?: () => Promise<unknown>;
    };
}

/**
 * Service metrics
 */
export interface ServiceMetrics {
    /** Total request count */
    requests: number;

    /** Success request count */
    successes: number;

    /** Error count */
    errors: number;

    /** Success rate (0-1) */
    successRate: number;

    /** Average response time in milliseconds */
    avgResponseTime: number;

    /** P50 response time in milliseconds */
    p50ResponseTime?: number;

    /** P95 response time in milliseconds */
    p95ResponseTime: number;

    /** P99 response time in milliseconds */
    p99ResponseTime: number;

    /** Current active connections */
    activeConnections: number;

    /** Total connections handled */
    totalConnections: number;

    /** Error rate (0-1) */
    errorRate: number;

    /** Throughput (requests per second) */
    throughput?: number;

    /** Timestamp of last metrics collection */
    lastUpdated: number;
}

/**
 * Service registry configuration
 */
export interface ServiceRegistryConfig {
    /** Registry type */
    type: 'kubernetes' | 'consul' | 'eureka' | 'static' | 'custom';

    /** Registry endpoint */
    endpoint?: string;

    /** Authentication configuration */
    auth?: {
        /** Authentication type */
        type: 'token' | 'basic' | 'tls' | 'none';

        /** Token for token auth */
        token?: string;

        /** Username for basic auth */
        username?: string;

        /** Password for basic auth */
        password?: string;

        /** TLS certificate */
        tlsCert?: string | Buffer;

        /** TLS key */
        tlsKey?: string | Buffer;

        /** CA certificate */
        caCert?: string | Buffer;
    };

    /** Cache configuration */
    cache?: {
        /** Enable caching */
        enabled: boolean;

        /** Cache TTL in milliseconds */
        ttl: number;

        /** Maximum cache size */
        maxSize?: number;
    };

    /** Watch for changes */
    watch?: boolean;

    /** Watch interval in milliseconds */
    watchInterval?: number;

    /** Custom configuration */
    options?: Record<string, unknown>;
}

/**
 * Service instance filter options
 */
export interface ServiceInstanceFilter {
    /** Filter by status */
    status?: 'healthy' | 'unhealthy' | 'unknown';

    /** Filter by tags */
    tags?: string[];

    /** Filter by zone/region */
    zone?: string;

    /** Filter by version */
    version?: string;

    /** Maximum instances to return */
    limit?: number;

    /** Custom filter function */
    filter?: (instance: ServiceInstance) => boolean;
}

/**
 * Service discovery result
 */
export interface ServiceDiscoveryResult {
    /** Service name */
    serviceName: string;

    /** Discovered instances */
    instances: ServiceInstance[];

    /** Total instances count */
    total: number;

    /** Healthy instances count */
    healthy: number;

    /** Timestamp of discovery */
    timestamp: number;

    /** Discovery source */
    source: string;

    /** Next refresh time */
    nextRefresh?: number;
}