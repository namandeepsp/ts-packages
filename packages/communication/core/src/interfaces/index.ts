/**
 * Interface definitions for communication layer
 * @packageDocumentation
 */

export type {
    IProtocol,
    IProtocolFactory,
} from './Protocol.interface.js';

export type {
    IClient,
    IClientFactory,
} from './Client.interface.js';

export type {
    ICircuitBreaker,
    ICircuitBreakerFactory,
} from './CircuitBreaker.interface.js';

export type {
    IRetryStrategy,
    IRetryStrategyFactory,
    RetryDecision,
    RetryContext,
} from './RetryStrategy.interface.js';

export type {
    IServiceDiscoverer,
    IServiceDiscoveryFactory,
} from './ServiceDiscovery.interface.js';

export type {
    ILoadBalanceStrategy,
    ILoadBalancerFactory,
    LoadBalancerSelection,
} from './LoadBalancer.interface.js';

export type {
    ISerializer,
    ISerializerFactory,
    SerializationContext,
    DeserializationContext,
} from './Serializer.interface.js';

export type {
    IInterceptor,
    IInterceptorChain,
    IInterceptorFactory,
    InterceptorOrder,
} from './Interceptor.interface.js';