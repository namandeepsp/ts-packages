/**
 * Abstract base connection pool implementation
 * @packageDocumentation
 */

import { CommunicationError } from '../errors/CommunicationError.js';
import { COMMUNICATION_ERROR_CODES } from '../errors/communicationErrorCodes.js';
import type { IConnection, IConnectionPool, ConnectionAcquisition } from '../interfaces/ConnectionPool.interface.js';
import type { ConnectionPoolConfig } from '../types/config.js';

/**
 * Abstract base connection pool implementation
 * Provides common functionality for connection pooling
 */
export abstract class BaseConnectionPool<T extends IConnection = IConnection>
    implements IConnectionPool<T> {

    /** Pool name */
    public readonly name: string;

    /** Pool configuration */
    public config: ConnectionPoolConfig;

    /** Is pool healthy? */
    public isHealthy: boolean = true;

    /** Total connections in pool */
    public totalConnections: number = 0;

    /** Active connections */
    public activeConnections: number = 0;

    /** Idle connections */
    public idleConnections: number = 0;

    /** Waiting clients */
    public waitingClients: number = 0;

    /** Connection factory function */
    protected createConnectionFn: () => Promise<T>;

    /** Connection validation function */
    protected validateConnectionFn: (connection: T) => Promise<boolean>;

    /** Connection pool */
    protected pool: Set<T> = new Set();

    /** Active connections set */
    protected activeConnectionsSet: Set<T> = new Set();

    /** Idle connections queue */
    protected idleConnectionsQueue: T[] = [];

    /** Waiting clients queue */
    protected waitingQueue: Array<{
        resolve: (acquisition: ConnectionAcquisition<T>) => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
        startTime: number;
    }> = [];

    /** Pool statistics */
    protected stats: {
        totalAcquisitions: number;
        totalReleases: number;
        totalDestructions: number;
        totalErrors: number;
        totalAcquisitionTime: number;
        maxAcquisitionTime: number;
        connectionStats: Map<string, {
            createdAt: number;
            lastUsedAt: number;
            usageCount: number;
            totalUsageTime: number;
            isHealthy: boolean;
        }>;
    } = {
            totalAcquisitions: 0,
            totalReleases: 0,
            totalDestructions: 0,
            totalErrors: 0,
            totalAcquisitionTime: 0,
            maxAcquisitionTime: 0,
            connectionStats: new Map(),
        };

    /** Cleanup interval */
    protected cleanupInterval?: NodeJS.Timeout;

    /** Health check interval */
    protected healthCheckInterval?: NodeJS.Timeout;

    /**
     * Create a new base connection pool instance
     * @param name Pool name
     * @param config Pool configuration
     * @param createConnection Connection factory function
     * @param validateConnection Connection validation function
     */
    constructor(
        name: string,
        config: ConnectionPoolConfig,
        createConnection: () => Promise<T>,
        validateConnection?: (connection: T) => Promise<boolean>
    ) {
        this.name = name;
        this.config = { ...config };
        this.createConnectionFn = createConnection;
        this.validateConnectionFn = validateConnection || (async (conn) => conn.isHealthy());

        this.initialize();
    }

    /**
     * Initialize connection pool
     */
    protected async initialize(): Promise<void> {
        // Set up cleanup interval
        if (this.config.validationInterval) {
            this.cleanupInterval = setInterval(
                () => this.cleanupIdleConnections(),
                this.config.validationInterval
            );
        }

        // Set up health check interval
        if (this.config.validationInterval) {
            this.healthCheckInterval = setInterval(
                () => this.checkPoolHealth(),
                this.config.validationInterval
            );
        }

        // Warm up pool if configured
        if (this.config.warmup && this.config.minConnections) {
            await this.warmupPool();
        }
    }

    /**
     * Warm up the pool with minimum connections
     */
    protected async warmupPool(): Promise<void> {
        const minConnections = this.config.minConnections || 0;
        const connectionsToCreate = Math.max(0, minConnections - this.totalConnections);

        for (let i = 0; i < connectionsToCreate; i++) {
            try {
                const connection = await this.createConnection();
                this.idleConnectionsQueue.push(connection);
                this.pool.add(connection);
                this.totalConnections++;
                this.idleConnections++;
            } catch (error) {
                // Log error but continue
                this.stats.totalErrors++;
            }
        }
    }

    /**
     * Acquire a connection from the pool
     * @param timeout Acquisition timeout in milliseconds
     * @returns Promise resolving to connection acquisition
     * @throws {CommunicationError} If timeout or pool exhausted
     */
    public async acquire(timeout?: number): Promise<ConnectionAcquisition<T>> {
        const startTime = Date.now();
        const acquireTimeout = timeout || this.config.acquireTimeout || 10000;

        // Check if we can create a new connection
        if (this.activeConnections < (this.config.maxConnections || 10)) {
            const connection = await this.getOrCreateConnection();
            if (connection) {
                const waitTime = Date.now() - startTime;
                this.recordAcquisition(startTime, connection);
                return this.createAcquisitionResult(connection, waitTime);
            }
        }

        // If we can't create a new connection, wait for one to become available
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.removeWaitingClient(reject, startTime);
                reject(new CommunicationError(
                    COMMUNICATION_ERROR_CODES.CONNECTION_TIMEOUT,
                    503,
                    {
                        message: `Connection acquisition timeout after ${acquireTimeout}ms`,
                        pool: this.name,
                        waitingClients: this.waitingClients,
                        activeConnections: this.activeConnections,
                    }
                ));
            }, acquireTimeout);

            this.waitingQueue.push({
                resolve: (acquisition) => {
                    clearTimeout(timer);
                    resolve(acquisition);
                },
                reject: (error) => {
                    clearTimeout(timer);
                    reject(error);
                },
                timeout: timer,
                startTime,
            });
            this.waitingClients++;
        });
    }

    /**
     * Get or create a connection
     * @returns Connection or null if cannot create
     */
    protected async getOrCreateConnection(): Promise<T | null> {
        // Try to get from idle queue
        while (this.idleConnectionsQueue.length > 0) {
            const connection = this.idleConnectionsQueue.shift()!;
            if (await this.validateConnection(connection)) {
                return connection;
            } else {
                await this.destroyConnection(connection);
            }
        }

        // Create new connection if under limit
        if (this.totalConnections < (this.config.maxConnections || 10)) {
            try {
                const connection = await this.createConnection();
                this.pool.add(connection);
                this.totalConnections++;
                return connection;
            } catch (error) {
                this.stats.totalErrors++;
                return null;
            }
        }

        return null;
    }

    /**
     * Create a new connection (factory method)
     * @returns New connection instance
     */
    public abstract createConnection(): Promise<T>;

    /**
     * Validate a connection
     * @param connection Connection to validate
     * @returns True if connection is valid
     */
    public async validateConnection(connection: T): Promise<boolean> {
        try {
            const isValid = await this.validateConnectionFn(connection);
            if (!isValid) {
                await this.destroyConnection(connection);
                return false;
            }
            return isValid;
        } catch (error) {
            await this.destroyConnection(connection);
            return false;
        }
    }

    /**
     * Release a connection back to the pool
     * @param connection Connection to release
     */
    public async release(connection: T): Promise<void> {
        // Remove from active connections
        this.activeConnectionsSet.delete(connection);
        this.activeConnections--;

        // Validate connection before returning to pool
        if (await this.validateConnection(connection)) {
            // Reset connection state
            await connection.reset();

            // Add to idle queue
            this.idleConnectionsQueue.push(connection);
            this.idleConnections++;

            // Update connection stats
            this.updateConnectionStats(connection, true);

            // Notify waiting clients
            this.notifyWaitingClients();
        } else {
            // Destroy invalid connection
            await this.destroyConnection(connection);
        }

        this.stats.totalReleases++;
    }

    /**
     * Destroy a connection (remove from pool)
     * @param connection Connection to destroy
     */
    public async destroy(connection: T): Promise<void> {
        await this.destroyConnection(connection);
    }

    /**
     * Destroy a connection (internal)
     * @param connection Connection to destroy
     */
    protected async destroyConnection(connection: T): Promise<void> {
        try {
            await connection.close();
        } catch (error) {
            // Ignore close errors
        }

        // Remove from all collections
        this.pool.delete(connection);
        this.activeConnectionsSet.delete(connection);
        const idleIndex = this.idleConnectionsQueue.indexOf(connection);
        if (idleIndex !== -1) {
            this.idleConnectionsQueue.splice(idleIndex, 1);
            this.idleConnections--;
        }

        this.totalConnections--;
        this.stats.totalDestructions++;

        // Remove from stats
        this.stats.connectionStats.delete(connection.id);
    }

    /**
     * Execute a function with a connection from the pool
     * @param fn Function to execute with connection
     * @param timeout Operation timeout in milliseconds
     * @returns Promise resolving to function result
     */
    public async withConnection<R>(
        fn: (connection: T) => Promise<R>,
        timeout?: number
    ): Promise<R> {
        const acquisition = await this.acquire(timeout);
        try {
            const result = await fn(acquisition.connection);
            return result;
        } finally {
            await this.release(acquisition.connection);
        }
    }

    /**
     * Record connection acquisition
     * @param startTime Acquisition start time
     * @param connection Acquired connection
     */
    protected recordAcquisition(startTime: number, connection: T): void {
        const waitTime = Date.now() - startTime;

        // Update connection stats
        const connStats = this.stats.connectionStats.get(connection.id) || {
            createdAt: connection.createdAt,
            lastUsedAt: Date.now(),
            usageCount: 0,
            totalUsageTime: 0,
            isHealthy: connection.isHealthy(),
        };
        connStats.usageCount++;
        connStats.lastUsedAt = Date.now();
        this.stats.connectionStats.set(connection.id, connStats);

        // Update pool stats
        this.stats.totalAcquisitions++;
        this.stats.totalAcquisitionTime += waitTime;
        this.stats.maxAcquisitionTime = Math.max(this.stats.maxAcquisitionTime, waitTime);

        // Update pool state
        const idleIndex = this.idleConnectionsQueue.indexOf(connection);
        if (idleIndex !== -1) {
            this.idleConnectionsQueue.splice(idleIndex, 1);
            this.idleConnections--;
        }
        this.activeConnectionsSet.add(connection);
        this.activeConnections++;
    }

    /**
     * Create acquisition result
     * @param connection Acquired connection
     * @param waitTime Wait time in milliseconds
     * @returns Connection acquisition result
     */
    protected createAcquisitionResult(
        connection: T,
        waitTime: number
    ): ConnectionAcquisition<T> {
        return {
            connection,
            timestamp: Date.now(),
            waitTime,
            poolStats: {
                totalConnections: this.totalConnections,
                activeConnections: this.activeConnections,
                idleConnections: this.idleConnections,
                waitingClients: this.waitingClients,
            },
        };
    }

    /**
     * Update connection statistics
     * @param connection Connection
     * @param released Whether connection was released
     */
    protected updateConnectionStats(connection: T, released: boolean): void {
        const connStats = this.stats.connectionStats.get(connection.id);
        if (connStats && released) {
            const usageTime = Date.now() - connStats.lastUsedAt;
            connStats.totalUsageTime += usageTime;
            connStats.isHealthy = connection.isHealthy();
            this.stats.connectionStats.set(connection.id, connStats);
        }
    }

    /**
     * Remove waiting client from queue
     * @param reject Reject function
     * @param startTime Start time
     */
    protected removeWaitingClient(reject: (error: Error) => void, startTime: number): void {
        const index = this.waitingQueue.findIndex(client => client.reject === reject);
        if (index !== -1) {
            this.waitingQueue.splice(index, 1);
            this.waitingClients--;
        }
    }

    /**
     * Notify waiting clients
     */
    protected async notifyWaitingClients(): Promise<void> {
        while (this.waitingQueue.length > 0 && this.idleConnectionsQueue.length > 0) {
            const connection = this.idleConnectionsQueue.shift();
            if (!connection) break;

            if (await this.validateConnection(connection)) {
                const client = this.waitingQueue.shift();
                if (!client) {
                    this.idleConnectionsQueue.unshift(connection);
                    break;
                }

                this.waitingClients--;
                clearTimeout(client.timeout);

                const waitTime = Date.now() - client.startTime;
                this.recordAcquisition(client.startTime, connection);
                client.resolve(this.createAcquisitionResult(connection, waitTime));
            } else {
                await this.destroyConnection(connection);
            }
        }
    }

    /**
     * Clean up idle connections
     */
    protected async cleanupIdleConnections(): Promise<void> {
        const now = Date.now();
        const maxIdleTime = this.config.idleTimeout || 60000;

        for (let i = this.idleConnectionsQueue.length - 1; i >= 0; i--) {
            const connection = this.idleConnectionsQueue[i];
            const idleTime = now - connection.lastUsedAt;

            // Check idle timeout
            if (idleTime > maxIdleTime) {
                this.idleConnectionsQueue.splice(i, 1);
                this.idleConnections--;
                await this.destroyConnection(connection);
                continue;
            }

            // Check max lifetime
            if (this.config.maxLifetime) {
                const age = now - connection.createdAt;
                if (age > this.config.maxLifetime) {
                    this.idleConnectionsQueue.splice(i, 1);
                    this.idleConnections--;
                    await this.destroyConnection(connection);
                }
            }
        }
    }

    /**
     * Check pool health
     */
    protected async checkPoolHealth(): Promise<void> {
        try {
            // Validate all idle connections
            for (const connection of this.idleConnectionsQueue) {
                if (!(await this.validateConnection(connection))) {
                    const index = this.idleConnectionsQueue.indexOf(connection);
                    if (index !== -1) {
                        this.idleConnectionsQueue.splice(index, 1);
                        this.idleConnections--;
                    }
                }
            }

            // Check if pool meets minimum connections
            if (this.config.minConnections && this.totalConnections < this.config.minConnections) {
                await this.warmupPool();
            }

            this.isHealthy = true;
        } catch (error) {
            this.isHealthy = false;
            this.stats.totalErrors++;
        }
    }

    /**
     * Drain the pool (gracefully close all connections)
     * @param force Force immediate drain
     */
    public async drain(force?: boolean): Promise<void> {
        // Stop accepting new requests
        this.isHealthy = false;

        // Clear intervals
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }

        // Wait for active connections to finish (if not forced)
        if (!force) {
            const maxWaitTime = 30000; // 30 seconds max wait
            const startTime = Date.now();

            while (this.activeConnections > 0 && (Date.now() - startTime) < maxWaitTime) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Close all connections
        const closePromises = Array.from(this.pool).map(conn => conn.close());
        await Promise.allSettled(closePromises);

        // Clear all collections
        this.pool.clear();
        this.activeConnectionsSet.clear();
        this.idleConnectionsQueue.length = 0;
        this.totalConnections = 0;
        this.activeConnections = 0;
        this.idleConnections = 0;

        // Clear waiting queue
        for (const client of this.waitingQueue) {
            clearTimeout(client.timeout);
            client.reject(new CommunicationError(
                COMMUNICATION_ERROR_CODES.CONNECTION_ERROR,
                503,
                { message: 'Pool is draining' }
            ));
        }
        this.waitingQueue.length = 0;
        this.waitingClients = 0;
    }

    /**
     * Clear the pool (force close all connections)
     */
    public async clear(): Promise<void> {
        await this.drain(true);
    }

    /**
     * Health check for the pool
     */
    public async healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }> {
        const healthy = this.isHealthy && this.totalConnections > 0;

        return {
            healthy,
            message: healthy ? 'Connection pool is healthy' : 'Connection pool is not healthy',
            details: {
                name: this.name,
                totalConnections: this.totalConnections,
                activeConnections: this.activeConnections,
                idleConnections: this.idleConnections,
                waitingClients: this.waitingClients,
                config: this.config,
                statistics: this.getStats(),
            },
        };
    }

    /**
     * Get pool statistics
     */
    public getStats(): {
        totalConnections: number;
        activeConnections: number;
        idleConnections: number;
        waitingClients: number;
        totalAcquisitions: number;
        totalReleases: number;
        totalDestructions: number;
        totalErrors: number;
        acquisitionTimeAverage: number;
        acquisitionTimeMax: number;
        poolUtilization: number;
        connectionStats: Array<{
            id: string;
            createdAt: number;
            lastUsedAt: number;
            usageCount: number;
            isHealthy: boolean;
        }>;
    } {
        const connectionStats = Array.from(this.stats.connectionStats.entries()).map(
            ([id, stats]) => ({
                id,
                createdAt: stats.createdAt,
                lastUsedAt: stats.lastUsedAt,
                usageCount: stats.usageCount,
                isHealthy: stats.isHealthy,
            })
        );

        const acquisitionTimeAverage = this.stats.totalAcquisitions > 0
            ? this.stats.totalAcquisitionTime / this.stats.totalAcquisitions
            : 0;

        const poolUtilization = this.config.maxConnections
            ? this.activeConnections / this.config.maxConnections
            : 0;

        return {
            totalConnections: this.totalConnections,
            activeConnections: this.activeConnections,
            idleConnections: this.idleConnections,
            waitingClients: this.waitingClients,
            totalAcquisitions: this.stats.totalAcquisitions,
            totalReleases: this.stats.totalReleases,
            totalDestructions: this.stats.totalDestructions,
            totalErrors: this.stats.totalErrors,
            acquisitionTimeAverage,
            acquisitionTimeMax: this.stats.maxAcquisitionTime,
            poolUtilization,
            connectionStats,
        };
    }

    /**
     * Reset pool statistics
     */
    public resetStats(): void {
        this.stats = {
            totalAcquisitions: 0,
            totalReleases: 0,
            totalDestructions: 0,
            totalErrors: 0,
            totalAcquisitionTime: 0,
            maxAcquisitionTime: 0,
            connectionStats: new Map(),
        };
    }

    /**
     * Update pool configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<ConnectionPoolConfig>): void {
        this.config = { ...this.config, ...config };

        // Restart intervals if needed
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.initialize();
    }
}