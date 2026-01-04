/**
 * Generic connection pooling utilities
 * @packageDocumentation
 */

import { ConnectionError } from '../errors/ConnectionError.js'
import { PoolError } from '../errors/PoolError.js'

/**
 * Connection resource interface
 */
export interface Connection {
	/** Unique connection ID */
	id: string
	/** Connection metadata */
	metadata?: Record<string, unknown>
	/** Check if connection is healthy */
	isHealthy(): boolean
	/** Close/cleanup the connection */
	close(): Promise<void>
}

/**
 * Pool configuration options
 */
export interface PoolConfig<T extends Connection> {
	/** Pool name for identification */
	name?: string
	/** Minimum number of connections in pool */
	minConnections?: number
	/** Maximum number of connections in pool */
	maxConnections?: number
	/** Timeout for acquiring connection (ms) */
	acquireTimeoutMs?: number
	/** Timeout for releasing connection (ms) */
	releaseTimeoutMs?: number
	/** Maximum connection idle time before cleanup (ms) */
	idleTimeoutMs?: number
	/** Maximum connection lifetime (ms) */
	maxLifetimeMs?: number
	/** Health check interval (ms) */
	healthCheckIntervalMs?: number
	/** Function to create new connection */
	createConnection: () => Promise<T>
	/** Function to validate connection health */
	validateConnection?: (connection: T) => boolean
	/** Function to destroy connection */
	destroyConnection?: (connection: T) => Promise<void>
}

/**
 * Pool connection wrapper with metadata
 */
class PooledConnection<T extends Connection> {
	public readonly id: string
	public readonly createdAt: Date
	public lastUsedAt: Date
	public isAcquired: boolean
	public useCount: number
	public isMarkedForDestruction: boolean

	constructor(
		public readonly connection: T,
		public readonly poolName: string,
	) {
		this.id = `${poolName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
		this.createdAt = new Date()
		this.lastUsedAt = new Date()
		this.isAcquired = false
		this.useCount = 0
		this.isMarkedForDestruction = false
	}

	/** Mark connection as used */
	markUsed(): void {
		this.lastUsedAt = new Date()
		this.useCount++
	}

	/** Check if connection is idle beyond timeout */
	isIdle(idleTimeoutMs: number): boolean {
		const idleTime = Date.now() - this.lastUsedAt.getTime()
		return idleTime > idleTimeoutMs
	}

	/** Check if connection has exceeded max lifetime */
	hasExceededLifetime(maxLifetimeMs: number): boolean {
		const lifetime = Date.now() - this.createdAt.getTime()
		return lifetime > maxLifetimeMs
	}
}

/**
 * Generic connection pool manager
 */
export class GenericPool<T extends Connection> {
	private readonly config: Required<PoolConfig<T>>
	private readonly connections: Map<string, PooledConnection<T>> = new Map()
	private readonly pendingAcquires: Array<{
		resolve: (connection: T) => void
		reject: (error: Error) => void
		timestamp: number
	}> = []
	private isShuttingDown = false
	private healthCheckInterval?: NodeJS.Timeout
	private stats = {
		totalConnectionsCreated: 0,
		totalConnectionsDestroyed: 0,
		totalAcquireRequests: 0,
		totalAcquireTimeouts: 0,
		totalAcquireErrors: 0,
		totalReleaseRequests: 0,
	}

	constructor(config: PoolConfig<T>) {
		this.config = {
			name: config.name || 'default',
			minConnections: config.minConnections ?? 1,
			maxConnections: config.maxConnections ?? 10,
			acquireTimeoutMs: config.acquireTimeoutMs ?? 30000,
			releaseTimeoutMs: config.releaseTimeoutMs ?? 5000,
			idleTimeoutMs: config.idleTimeoutMs ?? 60000,
			maxLifetimeMs: config.maxLifetimeMs ?? 3600000,
			healthCheckIntervalMs: config.healthCheckIntervalMs ?? 30000,
			createConnection: config.createConnection,
			validateConnection:
				config.validateConnection ?? ((conn) => conn.isHealthy()),
			destroyConnection: config.destroyConnection ?? ((conn) => conn.close()),
		}

		this.validateConfig()
		this.startHealthChecks()
	}

	/**
	 * Validate pool configuration
	 */
	private validateConfig(): void {
		if (this.config.minConnections < 0) {
			throw new RangeError('minConnections must be non-negative')
		}
		if (this.config.maxConnections <= 0) {
			throw new RangeError('maxConnections must be positive')
		}
		if (this.config.minConnections > this.config.maxConnections) {
			throw new RangeError('minConnections cannot exceed maxConnections')
		}
		if (this.config.acquireTimeoutMs <= 0) {
			throw new RangeError('acquireTimeoutMs must be positive')
		}
		if (this.config.idleTimeoutMs < 0) {
			throw new RangeError('idleTimeoutMs must be non-negative')
		}
		if (this.config.maxLifetimeMs < 0) {
			throw new RangeError('maxLifetimeMs must be non-negative')
		}
	}

	/**
	 * Start periodic health checks
	 */
	private startHealthChecks(): void {
		if (this.config.healthCheckIntervalMs > 0) {
			this.healthCheckInterval = setInterval(() => {
				this.cleanupIdleConnections()
				this.cleanupExpiredConnections()
				this.maintainMinConnections()
			}, this.config.healthCheckIntervalMs)
		}
	}

	/**
	 * Stop health checks
	 */
	private stopHealthChecks(): void {
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval)
		}
	}

	/**
	 * Acquire a connection from the pool
	 * @returns Promise resolving to connection
	 */
	async acquire(): Promise<T> {
		if (this.isShuttingDown) {
			throw new PoolError(
				'Cannot acquire connection: pool is shutting down',
				this.config.name,
			)
		}

		this.stats.totalAcquireRequests++

		// Try to get available connection
		for (const pooledConn of this.connections.values()) {
			if (
				!pooledConn.isAcquired &&
				this.config.validateConnection(pooledConn.connection)
			) {
				pooledConn.isAcquired = true
				pooledConn.markUsed()
				return pooledConn.connection
			}
		}

		// Create new connection if under max
		if (this.connections.size < this.config.maxConnections) {
			try {
				const connection = await this.createAndRegisterConnection()
				connection.isAcquired = true
				connection.markUsed()
				return connection.connection
			} catch (error) {
				this.stats.totalAcquireErrors++
				throw new ConnectionError(
					'Failed to create connection',
					undefined,
					{ poolName: this.config.name },
					error instanceof Error ? error : undefined,
				)
			}
		}

		// Wait for connection to be released
		return new Promise<T>((resolve, reject) => {
			const request = {
				resolve,
				reject,
				timestamp: Date.now(),
			}

			this.pendingAcquires.push(request)

			// Set timeout for acquire request
			setTimeout(() => {
				const index = this.pendingAcquires.indexOf(request)
				if (index !== -1) {
					this.pendingAcquires.splice(index, 1)
					this.stats.totalAcquireTimeouts++
					reject(
						new PoolError(
							`Acquire timeout after ${this.config.acquireTimeoutMs}ms`,
							this.config.name,
							{ pendingRequests: this.pendingAcquires.length },
						),
					)
				}
			}, this.config.acquireTimeoutMs)
		})
	}

	/**
	 * Release a connection back to the pool
	 * @param connection Connection to release
	 */
	async release(connection: T): Promise<void> {
		this.stats.totalReleaseRequests++

		const pooledConn = Array.from(this.connections.values()).find(
			(pc) => pc.connection === connection,
		)

		if (!pooledConn) {
			throw new PoolError('Connection not found in pool', this.config.name, {
				connectionId: connection.id,
			})
		}

		if (!pooledConn.isAcquired) {
			throw new PoolError('Connection is not acquired', this.config.name, {
				connectionId: connection.id,
			})
		}

		// Validate connection before returning to pool
		if (!this.config.validateConnection(connection)) {
			await this.destroyConnection(pooledConn)
			this.tryFulfillPendingAcquires()
			return
		}

		pooledConn.isAcquired = false
		pooledConn.markUsed()

		// Fulfill pending acquire requests
		this.tryFulfillPendingAcquires()
	}

	/**
	 * Try to fulfill pending acquire requests
	 */
	private tryFulfillPendingAcquires(): void {
		while (this.pendingAcquires.length > 0) {
			const availableConn = Array.from(this.connections.values()).find(
				(pc) => !pc.isAcquired && this.config.validateConnection(pc.connection),
			)

			if (!availableConn) {
				break
			}

			const request = this.pendingAcquires.shift()
			if (request) {
				availableConn.isAcquired = true
				availableConn.markUsed()
				request.resolve(availableConn.connection)
			}
		}
	}

	/**
	 * Create and register a new connection
	 */
	private async createAndRegisterConnection(): Promise<PooledConnection<T>> {
		const connection = await this.config.createConnection()
		const pooledConn = new PooledConnection(connection, this.config.name)

		this.connections.set(pooledConn.id, pooledConn)
		this.stats.totalConnectionsCreated++

		return pooledConn
	}

	/**
	 * Destroy a connection
	 */
	private async destroyConnection(
		pooledConn: PooledConnection<T>,
	): Promise<void> {
		try {
			await this.config.destroyConnection(pooledConn.connection)
			this.connections.delete(pooledConn.id)
			this.stats.totalConnectionsDestroyed++
		} catch (error) {
			console.error(`Failed to destroy connection ${pooledConn.id}:`, error)
		}
	}

	/**
	 * Clean up idle connections
	 */
	private cleanupIdleConnections(): void {
		if (this.config.idleTimeoutMs <= 0) return

		for (const pooledConn of this.connections.values()) {
			if (
				!pooledConn.isAcquired &&
				!pooledConn.isMarkedForDestruction &&
				pooledConn.isIdle(this.config.idleTimeoutMs) &&
				this.connections.size > this.config.minConnections
			) {
				pooledConn.isMarkedForDestruction = true
				this.destroyConnection(pooledConn)
			}
		}
	}

	/**
	 * Clean up expired connections
	 */
	private cleanupExpiredConnections(): void {
		if (this.config.maxLifetimeMs <= 0) return

		for (const pooledConn of this.connections.values()) {
			if (
				!pooledConn.isMarkedForDestruction &&
				pooledConn.hasExceededLifetime(this.config.maxLifetimeMs)
			) {
				pooledConn.isMarkedForDestruction = true
				this.destroyConnection(pooledConn)
			}
		}
	}

	/**
	 * Maintain minimum connections
	 */
	private async maintainMinConnections(): Promise<void> {
		const needed = this.config.minConnections - this.getAvailableCount()

		for (
			let i = 0;
			i < needed && this.connections.size < this.config.maxConnections;
			i++
		) {
			try {
				await this.createAndRegisterConnection()
			} catch (error) {
				console.error('Failed to maintain min connections:', error)
				break
			}
		}
	}

	/**
	 * Get pool statistics
	 */
	getStats() {
		return {
			...this.stats,
			totalConnections: this.connections.size,
			acquiredConnections: Array.from(this.connections.values()).filter(
				(c) => c.isAcquired,
			).length,
			availableConnections: this.getAvailableCount(),
			pendingAcquires: this.pendingAcquires.length,
			isShuttingDown: this.isShuttingDown,
			config: {
				name: this.config.name,
				minConnections: this.config.minConnections,
				maxConnections: this.config.maxConnections,
			},
		}
	}

	/**
	 * Get number of available connections
	 */
	getAvailableCount(): number {
		return Array.from(this.connections.values()).filter(
			(pc) => !pc.isAcquired && this.config.validateConnection(pc.connection),
		).length
	}

	/**
	 * Drain the pool (graceful shutdown)
	 */
	async drain(): Promise<void> {
		this.isShuttingDown = true
		this.stopHealthChecks()

		// Reject all pending acquire requests
		for (const request of this.pendingAcquires) {
			request.reject(new PoolError('Pool is draining', this.config.name))
		}
		this.pendingAcquires.length = 0

		// Close all connections
		const destroyPromises = Array.from(this.connections.values()).map(
			(pooledConn) => this.destroyConnection(pooledConn),
		)

		await Promise.allSettled(destroyPromises)
	}

	/**
	 * Execute a function with a connection from the pool
	 */
	async withConnection<R>(fn: (connection: T) => Promise<R>): Promise<R> {
		const connection = await this.acquire()

		try {
			return await fn(connection)
		} finally {
			await this.release(connection)
		}
	}
}

/**
 * Pool manager for multiple pools
 */
export class PoolManager {
	private pools: Map<string, GenericPool<any>> = new Map()

	/**
	 * Create or get a pool
	 */
	createPool<T extends Connection>(config: PoolConfig<T>): GenericPool<T> {
		const name = config.name || 'default'

		if (this.pools.has(name)) {
			throw new PoolError(`Pool with name '${name}' already exists`, name)
		}

		const pool = new GenericPool(config)
		this.pools.set(name, pool)
		return pool
	}

	/**
	 * Get a pool by name
	 */
	getPool<T extends Connection>(name: string): GenericPool<T> | undefined {
		return this.pools.get(name)
	}

	/**
	 * Drain all pools
	 */
	async drainAll(): Promise<void> {
		const drainPromises = Array.from(this.pools.values()).map((pool) =>
			pool.drain(),
		)
		await Promise.all(drainPromises)
		this.pools.clear()
	}

	/**
	 * Get statistics for all pools
	 */
	getAllStats(): Record<string, ReturnType<GenericPool<any>['getStats']>> {
		const stats: Record<string, any> = {}

		for (const [name, pool] of this.pools.entries()) {
			stats[name] = pool.getStats()
		}

		return stats
	}
}
