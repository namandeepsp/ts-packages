/**
 * Utilities integration with @naman_deep_singh/utils package
 * @packageDocumentation
 */

import {
    Compression,
    GenericPool,
    TimeoutManager,
    type Connection as UtilsConnection
} from '@naman_deep_singh/utils';
import type { IConnection } from './interfaces/ConnectionPool.interface.js';

/**
 * Connection interface compatible with both packages
 * Note: The utils package expects isHealthy as a function, not a property
 */
export interface Connection extends IConnection, UtilsConnection {
    // Override to match utils package requirements
    /** Is connection healthy? - must be a function in utils package */
    isHealthy: () => boolean;

    /** Connection ID */
    id: string;

    /** Connection creation time */
    createdAt: number;

    /** Last used time */
    lastUsedAt: number;

    /** Usage count */
    usageCount: number;

    /** Connection metadata */
    metadata: Record<string, unknown>;

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
 * Base connection implementation that satisfies both interfaces
 */
export abstract class BaseConnection implements Connection {
    abstract readonly id: string;
    abstract readonly createdAt: number;
    abstract readonly lastUsedAt: number;
    abstract readonly usageCount: number;
    abstract readonly metadata: Record<string, unknown>;

    // isHealthy must be a function for utils package compatibility
    abstract isHealthy(): boolean;

    abstract close(): Promise<void>;
    abstract healthCheck(): Promise<boolean>;
    abstract reset(): Promise<void>;
}

/**
 * Timeout utilities wrapper
 */
export class TimeoutUtils {
    /**
     * Execute with timeout
     */
    static async withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        errorMessage?: string
    ): Promise<T> {
        return TimeoutManager.withTimeout(promise, timeoutMs, errorMessage);
    }

    /**
     * Create delay
     */
    static async delay(ms: number): Promise<void> {
        return TimeoutManager.delay(ms);
    }

    /**
     * Retry with timeout
     */
    static async retryWithTimeout<T>(
        fn: () => Promise<T>,
        options?: {
            maxAttempts?: number;
            timeoutPerAttempt?: number;
            backoffMultiplier?: number;
        }
    ): Promise<T> {
        return TimeoutManager.retryWithTimeout(fn, options);
    }

    /**
     * Create a timeout promise
     */
    static createTimeout(timeoutMs: number, message?: string): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(message || `Timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    /**
     * Create an abort signal for timeout
     */
    static createAbortSignal(timeoutMs: number): AbortSignal {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeoutMs);
        return controller.signal;
    }

    /**
     * Race promises with timeout
     */
    static async raceWithTimeout<T>(
        promises: Promise<T>[],
        timeoutMs: number,
        errorMessage?: string
    ): Promise<T> {
        const timeoutPromise = this.createTimeout(timeoutMs, errorMessage);
        return Promise.race([...promises, timeoutPromise]);
    }
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig<T extends Connection> {
    /** Pool name */
    name: string;

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

    /** Connection factory function */
    createConnection: () => Promise<T>;

    /** Connection validation function */
    validateConnection?: (connection: T) => boolean;
}

/**
 * Connection pool wrapper
 */
export class ConnectionPoolUtils {
    /**
     * Create a generic connection pool
     */
    static createPool<T extends Connection>(
        config: ConnectionPoolConfig<T>
    ): GenericPool<T> {
        return new GenericPool<T>({
            name: config.name,
            minConnections: config.minConnections,
            maxConnections: config.maxConnections,
            createConnection: config.createConnection,
            validateConnection: config.validateConnection,
            idleTimeoutMs: config.idleTimeout,
            maxLifetimeMs: config.maxLifetime,
            acquireTimeoutMs: config.acquireTimeout,
        });
    }

    /**
     * Create a simple pool with basic configuration
     */
    static createSimplePool<T extends Connection>(
        name: string,
        createConnection: () => Promise<T>,
        options?: {
            minConnections?: number;
            maxConnections?: number;
            idleTimeout?: number;
        }
    ): GenericPool<T> {
        return new GenericPool<T>({
            name,
            minConnections: options?.minConnections,
            maxConnections: options?.maxConnections,
            createConnection,
            idleTimeoutMs: options?.idleTimeout,
        });
    }

    /**
     * Create an adapter to convert property-based isHealthy to function-based
     */
    static createConnectionAdapter<T extends Record<string, any>>(
        connection: T & { isHealthy?: boolean | (() => boolean) },
        closeFn: () => Promise<void> = async () => { },
        healthCheckFn: () => Promise<boolean> = async () => true,
        resetFn: () => Promise<void> = async () => { }
    ): Connection {
        // Handle isHealthy conversion
        const getIsHealthy = () => {
            if (typeof connection.isHealthy === 'function') {
                return connection.isHealthy();
            }
            return connection.isHealthy ?? true;
        };

        return {
            id: connection.id || `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            // isHealthy must be a function
            isHealthy: getIsHealthy,
            createdAt: connection.createdAt || Date.now(),
            lastUsedAt: connection.lastUsedAt || Date.now(),
            usageCount: connection.usageCount || 0,
            metadata: connection.metadata || {},
            close: closeFn,
            healthCheck: healthCheckFn,
            reset: resetFn,
        };
    }
}

/**
 * Compression utilities wrapper
 */
export class CompressionUtils {
    /**
     * Compression algorithm type
     */
    static readonly Algorithm = {
        GZIP: 'gzip' as const,
        DEFLATE: 'deflate' as const,
        BROTLI: 'brotli' as const,
        NONE: 'none' as const,
    } as const;

    /**
     * Compress data
     */
    static async compress(
        data: Buffer | string | Uint8Array,
        options?: {
            algorithm?: 'gzip' | 'deflate' | 'brotli' | 'none';
            level?: number;
        }
    ): Promise<Buffer> {
        const result = await Compression.compress(Buffer.from(data), {
            algorithm: options?.algorithm as any || 'gzip',
            level: options?.level || 6,
        });
        return Buffer.from(result);
    }

    /**
     * Decompress data
     */
    static async decompress(
        data: Buffer | Uint8Array,
        options?: {
            algorithm?: 'gzip' | 'deflate' | 'brotli';
        }
    ): Promise<Buffer> {
        const result = await Compression.decompress(Buffer.from(data), {
            algorithm: options?.algorithm as any || 'gzip',
        });
        return Buffer.from(result);
    }

    /**
     * Compress data with metrics
     */
    static async compressWithMetrics(
        data: Buffer | string | Uint8Array,
        options?: {
            algorithm?: 'gzip' | 'deflate' | 'brotli';
            level?: number;
        }
    ): Promise<{
        data: Buffer;
        originalSize: number;
        compressedSize: number;
        compressionRatio: number;
        compressionTime: number;
    }> {
        const startTime = Date.now();
        const originalSize = Buffer.from(data).length;

        const compressed = await Compression.compress(Buffer.from(data), {
            algorithm: options?.algorithm as any || 'gzip',
            level: options?.level || 6,
        });

        const compressionTime = Date.now() - startTime;
        const compressedSize = compressed.length;
        const compressionRatio = compressedSize / originalSize;

        return {
            data: Buffer.from(compressed),
            originalSize,
            compressedSize,
            compressionRatio,
            compressionTime,
        };
    }

    /**
     * Get optimal compression level based on data size
     */
    static getOptimalLevel(dataSize: number): number {
        if (dataSize < 1024) return 1; // Small data, fast compression
        if (dataSize < 10240) return 6; // Medium data, balanced
        return 9; // Large data, best compression
    }

    /**
     * Estimate compression ratio for data type
     */
    static estimateCompressionRatio(contentType?: string): number {
        if (!contentType) return 0.7;

        const type = contentType.toLowerCase();
        if (type.includes('json') || type.includes('xml')) return 0.3;
        if (type.includes('text')) return 0.4;
        if (type.includes('image') || type.includes('video')) return 0.95;
        return 0.7;
    }
}