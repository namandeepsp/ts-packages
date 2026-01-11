# @naman_deep_singh/communication-core

**Version** - 1.2.1

> Core interfaces and abstract classes for building a comprehensive service-to-service communication layer in TypeScript

## Overview

This package provides the foundational interfaces, abstract base classes, types, and utilities needed to build a complete microservices communication ecosystem. It serves as the architectural foundation for 5 specialized subpackages that handle different aspects of service communication.

## Features

- 🔌 **Protocol Abstraction**: Unified interface for HTTP, gRPC, WebSocket protocols
- 🛡️ **Resilience Patterns**: Circuit breaker and retry strategy interfaces
- 🔍 **Service Discovery**: Dynamic service location and health monitoring
- ⚖️ **Load Balancing**: Traffic distribution strategies
- 🎯 **Unified Client**: Composable client that orchestrates all components
- 🔧 **Connection Pooling**: Built-in connection management with health checks
- 📊 **Observability**: Metrics, events, and health monitoring
- 🚦 **Interceptors**: Request/response middleware system
- ⚡ **TypeScript First**: Full type safety with strict import/export patterns

## Installation

```bash
npm install @naman_deep_singh/communication-core
```

## Core Interfaces

### Communication Protocols
- **`IProtocol`**: Base interface for all communication protocols
- **`IConnectionPool`**: Connection pooling and lifecycle management
- **`IInterceptor`**: Request/response middleware

### Resilience & Reliability
- **`ICircuitBreaker`**: Circuit breaker pattern for fault tolerance
- **`IRetryStrategy`**: Configurable retry mechanisms with backoff

### Service Discovery & Load Balancing
- **`IServiceDiscoverer`**: Dynamic service instance discovery
- **`ILoadBalanceStrategy`**: Traffic distribution algorithms

### Client Orchestration
- **`IClient`**: Main client interface that composes all components
- **`IClientFactory`**: Factory for creating and managing client instances

## Abstract Base Classes

These classes provide common functionality and enforce consistent patterns:

### Protocol Layer
- **`BaseProtocol`**: Common protocol functionality (connection pooling, metrics, error handling)
- **`BaseConnectionPool`**: Connection lifecycle, health checks, and resource management

### Service Discovery
- **`BaseServiceDiscoverer`**: Caching, health monitoring, and event-driven updates

## Type System

### Core Types
- **`Request/Response`**: Standardized request/response objects
- **`ServiceInstance`**: Service endpoint representation
- **`ClientConfig`**: Comprehensive client configuration
- **`ConnectionPoolConfig`**: Connection pool settings

### Configuration Types
- **`ProtocolConfig`**: Protocol-specific settings
- **`CircuitBreakerConfig`**: Circuit breaker thresholds and timeouts
- **`RetryConfig`**: Retry policies and backoff strategies
- **`LoadBalancerConfig`**: Load balancing algorithms and weights

### Error Handling
- **`CommunicationError`**: Base error class with error codes and context
- **`ConnectionError`**: Connection-specific errors
- **`TimeoutError`**: Request timeout errors
- **`ServiceUnavailableError`**: Service discovery errors

## Subpackage Architecture

This core package enables building 5 specialized subpackages:

### 1. **@naman_deep_singh/communication-protocols**

**Purpose**: Protocol-specific implementations (HTTP, gRPC, WebSocket)

```
communication-protocols/
├── src/
│   ├── http/
│   │   ├── HTTPProtocol.ts          # extends BaseProtocol
│   │   ├── HTTPConnectionPool.ts    # extends BaseConnectionPool
│   │   └── HTTPInterceptor.ts       # implements BaseInterceptor
|   |   └── index.ts
│   ├── grpc/
│   │   ├── GRPCProtocol.ts          # extends BaseProtocol
│   │   ├── GRPCConnectionPool.ts    # extends BaseConnectionPool
│   │   └── GRPCInterceptor.ts       # implements IInterceptor
|   |   └── index.ts
│   ├── websocket/
│   │   ├── WebSocketProtocol.ts     # extends BaseProtocol
│   │   ├── WebSocketConnectionPool.ts
│   │   └── WebSocketInterceptor.ts
|   |   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

**Key Dependencies**: `axios`, `@grpc/grpc-js`, `ws`

**Usage**:
```typescript
import { HTTPProtocol } from '@naman_deep_singh/communication-protocols/http';
import { GRPCProtocol } from '@naman_deep_singh/communication-protocols/grpc';
```

### 2. **@naman_deep_singh/communication-resilience**

**Purpose**: Fault tolerance patterns (Circuit Breaker, Retry Strategies)

```
communication-resilience/
├── src/
│   ├── circuit-breaker/
│   │   ├── CircuitBreakerImpl.ts    # implements ICircuitBreaker
│   │   ├── CircuitBreakerState.ts   # State management
│   │   └── CircuitBreakerMetrics.ts # Failure tracking
|   |   └── index.ts
│   ├── retry/
│   │   ├── ExponentialBackoffRetry.ts   # implements IRetryStrategy
│   │   ├── LinearBackoffRetry.ts        # implements IRetryStrategy
│   │   ├── FixedDelayRetry.ts           # implements IRetryStrategy
│   │   └── JitterRetry.ts               # implements IRetryStrategy
|   |   └── index.ts
│   ├── policies/
│   │   ├── RetryPolicy.ts
│   │   └── CircuitBreakerPolicy.ts
|   |   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

**Usage**:
```typescript
import { CircuitBreakerImpl } from '@naman_deep_singh/communication-resilience/circuit-breaker';
import { ExponentialBackoffRetry } from '@naman_deep_singh/communication-resilience/retry';
```

### 3. **@naman_deep_singh/communication-discovery**

**Purpose**: Service discovery implementations (Consul, etcd, Kubernetes)

```
communication-discovery/
├── src/
│   ├── consul/
│   │   ├── ConsulServiceDiscoverer.ts   # extends BaseServiceDiscoverer
│   │   ├── ConsulHealthChecker.ts
│   │   └── ConsulWatcher.ts
|   |   └── index.ts
│   ├── etcd/
│   │   ├── EtcdServiceDiscoverer.ts     # extends BaseServiceDiscoverer
│   │   ├── EtcdHealthChecker.ts
│   │   └── EtcdWatcher.ts
|   |   └── index.ts
│   ├── kubernetes/
│   │   ├── K8sServiceDiscoverer.ts      # extends BaseServiceDiscoverer
│   │   ├── K8sHealthChecker.ts
│   │   └── K8sWatcher.ts
|   |   └── index.ts
│   ├── static/
│   │   └── StaticServiceDiscoverer.ts   # For testing/development
|   |   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

**Key Dependencies**: `consul`, `etcd3`, `@kubernetes/client-node`

**Usage**:
```typescript
import { ConsulServiceDiscoverer } from '@naman_deep_singh/communication-discovery/consul';
import { K8sServiceDiscoverer } from '@naman_deep_singh/communication-discovery/kubernetes';
```

### 4. **@naman_deep_singh/communication-load-balancing**

**Purpose**: Load balancing strategies for traffic distribution

```
communication-load-balancing/
├── src/
│   ├── strategies/
│   │   ├── RoundRobinStrategy.ts        # implements ILoadBalanceStrategy
│   │   ├── WeightedRoundRobinStrategy.ts # implements ILoadBalanceStrategy
│   │   ├── LeastConnectionsStrategy.ts   # implements ILoadBalanceStrategy
│   │   ├── RandomStrategy.ts            # implements ILoadBalanceStrategy
│   │   └── ConsistentHashStrategy.ts    # implements ILoadBalanceStrategy
|   |   └── index.ts
│   ├── health/
│   │   ├── HealthAwareLoadBalancer.ts
│   │   └── HealthScorer.ts
|   |   └── index.ts
│   ├── metrics/
│   │   ├── LoadBalancerMetrics.ts
│   │   └── ConnectionTracker.ts
|   |   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

**Usage**:
```typescript
import { RoundRobinStrategy } from '@naman_deep_singh/communication-load-balancing/strategies';
import { WeightedRoundRobinStrategy } from '@naman_deep_singh/communication-load-balancing/strategies';
```

### 5. **@naman_deep_singh/communication-client**

**Purpose**: Unified client that orchestrates all components

```
communication-client/
├── src/
│   ├── client/
│   │   ├── CommunicationClient.ts       # implements IClient
│   │   ├── ClientFactory.ts             # implements IClientFactory
│   │   └── ClientBuilder.ts             # Fluent builder pattern
|   |   └── index.ts
│   ├── pipeline/
│   │   ├── RequestPipeline.ts
│   │   ├── ResponsePipeline.ts
│   │   └── InterceptorChain.ts
|   |   └── index.ts
│   ├── middleware/
│   │   ├── LoggingInterceptor.ts
│   │   ├── MetricsInterceptor.ts
│   │   ├── TracingInterceptor.ts
│   │   └── AuthInterceptor.ts
|   |   └── index.ts
│   ├── events/
│   │   ├── ClientEventEmitter.ts
│   │   └── ClientEvents.ts
|   |   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

**Usage**:
```typescript
import { CommunicationClient, ClientBuilder } from '@naman_deep_singh/communication-client';

// Fluent builder pattern
const client = new ClientBuilder()
  .withProtocol(new HTTPProtocol())
  .withServiceDiscovery(new ConsulServiceDiscoverer(consulConfig))
  .withLoadBalancer(new RoundRobinStrategy())
  .withCircuitBreaker(new CircuitBreakerImpl(cbConfig))
  .withRetryStrategy(new ExponentialBackoffRetry(retryConfig))
  .build('user-service');
```

## Development Roadmap

### Phase 1: Protocols Foundation (Week 1-2)
- Implement `HTTPProtocol` with connection pooling
- Add basic interceptor support
- Create comprehensive tests

### Phase 2: Resilience Layer (Week 3)
- Implement `CircuitBreakerImpl` with state management
- Add `ExponentialBackoffRetry` strategy
- Integration testing with HTTP protocol

### Phase 3: Service Discovery (Week 4)
- Implement `ConsulServiceDiscoverer`
- Add health checking and caching
- Event-driven service updates

### Phase 4: Load Balancing (Week 5)
- Implement `RoundRobinStrategy`
- Add health-aware load balancing
- Performance benchmarking

### Phase 5: Client Orchestration (Week 6)
- Create unified `CommunicationClient`
- Implement request pipeline
- End-to-end integration testing

## Usage Example

```typescript
import { 
  IClient, 
  IProtocol, 
  IServiceDiscoverer, 
  ILoadBalanceStrategy,
  ICircuitBreaker,
  IRetryStrategy 
} from '@naman_deep_singh/communication-core';

// This core package provides the contracts
// Implementations come from subpackages:

// From communication-protocols
const protocol: IProtocol = new HTTPProtocol({
  timeout: 5000,
  maxConnections: 100
});

// From communication-discovery  
const discovery: IServiceDiscoverer = new ConsulServiceDiscoverer({
  host: 'localhost',
  port: 8500
});

// From communication-load-balancing
const loadBalancer: ILoadBalanceStrategy = new RoundRobinStrategy();

// From communication-resilience
const circuitBreaker: ICircuitBreaker = new CircuitBreakerImpl({
  failureThreshold: 5,
  timeout: 60000
});

// From communication-client
const client: IClient = new CommunicationClient({
  serviceName: 'user-service',
  protocol,
  serviceDiscoverer: discovery,
  loadBalancer,
  circuitBreaker
});

// Make requests
const response = await client.call('/users/123');
```

## Key Benefits

- **🔧 Modular Architecture**: Use only the components you need
- **🔄 Consistent Patterns**: All implementations follow the same interfaces
- **🧪 Easy Testing**: Mock interfaces for comprehensive unit testing
- **📈 Extensible**: Add new protocols/strategies without breaking changes
- **⚡ Performance**: Built-in connection pooling and caching
- **🛡️ Reliable**: Circuit breakers and retry mechanisms
- **📊 Observable**: Built-in metrics and event system

## Contributing

This package follows strict TypeScript patterns:
- No wildcard exports (except root index)
- Type keyword for all type imports
- .js extensions in imports
- Barrel exports in all directories

## License

MIT
