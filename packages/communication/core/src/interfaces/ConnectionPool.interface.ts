/**
 * Connection pool interface for communication layer
 * @packageDocumentation
 */

import type { CommunicationError } from '../errors/CommunicationError.js';
import type { ConnectionPoolConfig } from '../types/config.js';
/**
 * Connection interface that must be implemented by pooled connections
 * Note: isHealthy must be a function to be compatible with @naman_deep_singh/utils
 */
export interface IConnection {
    /** Connection ID */
    readonly id: string;

    /** Is connection healthy? - Must be a function for utils compatibility */
    readonly isHealthy: () => boolean;

    /** Connection creation time */
    readonly createdAt: number;

    /** Last used time */
    readonly lastUsedAt: number;

    /** Usage count */
    readonly usageCount: number;

    /** Connection metadata */
    readonly metadata: Record<string, unknown>;

    /**
     * Close the connection
     */
    close(): Promise<void>;

    /**
     * Health check for connection
     */
    healthCheck(): Promise<boolean>;

    /**
     * Reset connection state
     */
    reset(): Promise<void>;
}

/**
 * Connection acquisition result
 */
export interface ConnectionAcquisition<T extends IConnection = IConnection> {
    /** Acquired connection */
    connection: T;

    /** Acquisition timestamp */
    timestamp: number;

    /** Wait time in milliseconds */
    waitTime: number;

    /** Connection pool statistics */
    poolStats: {
        totalConnections: number;
        activeConnections: number;
        idleConnections: number;
        waitingClients: number;
    };
}

/**
 * Connection pool interface
 */
export interface IConnectionPool<T extends IConnection = IConnection> {
    /** Pool name */
    readonly name: string;

    /** Pool configuration */
    readonly config: ConnectionPoolConfig;

    /** Is pool healthy? */
    readonly isHealthy: boolean;

    /** Total connections in pool */
    readonly totalConnections: number;

    /** Active connections */
    readonly activeConnections: number;

    /** Idle connections */
    readonly idleConnections: number;

    /** Waiting clients */
    readonly waitingClients: number;

    /**
     * Acquire a connection from the pool
     * @param timeout Acquisition timeout in milliseconds
     * @returns Promise resolving to connection acquisition
     * @throws {CommunicationError} If timeout or pool exhausted
     */
    acquire(timeout?: number): Promise<ConnectionAcquisition<T>>;

    /**
     * Release a connection back to the pool
     * @param connection Connection to release
     */
    release(connection: T): Promise<void>;

    /**
     * Destroy a connection (remove from pool)
     * @param connection Connection to destroy
     */
    destroy(connection: T): Promise<void>;

    /**
     * Execute a function with a connection from the pool
     * @param fn Function to execute with connection
     * @param timeout Operation timeout in milliseconds
     * @returns Promise resolving to function result
     */
    withConnection<R>(
        fn: (connection: T) => Promise<R>,
        timeout?: number
    ): Promise<R>;

    /**
     * Create a new connection (factory method)
     * @returns New connection instance
     */
    createConnection(): Promise<T>;

    /**
     * Validate a connection
     * @param connection Connection to validate
     * @returns True if connection is valid
     */
    validateConnection(connection: T): Promise<boolean>;

    /**
     * Drain the pool (gracefully close all connections)
     * @param force Force immediate drain
     */
    drain(force?: boolean): Promise<void>;

    /**
     * Clear the pool (force close all connections)
     */
    clear(): Promise<void>;

    /**
     * Health check for the pool
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }>;

    /**
     * Get pool statistics
     */
    getStats(): {
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
    };

    /**
     * Reset pool statistics
     */
    resetStats(): void;

    /**
     * Update pool configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<ConnectionPoolConfig>): void;
}

/**
 * Connection pool factory interface
 */
export interface IConnectionPoolFactory {
    /**
     * Create a new connection pool instance
     * @param name Pool name
     * @param config Pool configuration
     * @param createConnection Connection factory function
     * @param validateConnection Connection validation function
     * @returns New connection pool instance
     */
    create<T extends IConnection>(
        name: string,
        config: ConnectionPoolConfig,
        createConnection: () => Promise<T>,
        validateConnection?: (connection: T) => Promise<boolean>
    ): IConnectionPool<T>;

    /**
     * Get an existing connection pool instance
     * @param name Pool name
     */
    get<T extends IConnection>(name: string): IConnectionPool<T> | undefined;

    /**
     * Get all connection pool instances
     */
    getAll(): IConnectionPool[];

    /**
     * Drain all connection pools
     */
    drainAll(): Promise<void>;

    /**
     * Clear all connection pools
     */
    clearAll(): Promise<void>;

    /**
     * Get global connection pool statistics
     */
    getGlobalStats(): Record<string, unknown>;
}