/**
 * Compression interface for communication layer
 * @packageDocumentation
 */

import type { CompressionConfig } from '../types/config.js';
import type { CommunicationError } from '../errors/CommunicationError.js';

/**
 * Compression algorithm
 */
export type CompressionAlgorithm = 'gzip' | 'deflate' | 'brotli' | 'none';

/**
 * Compression result
 */
export interface CompressionResult {
    /** Compressed data */
    data: Buffer | Uint8Array;

    /** Original size in bytes */
    originalSize: number;

    /** Compressed size in bytes */
    compressedSize: number;

    /** Compression ratio (0-1) */
    compressionRatio: number;

    /** Compression algorithm used */
    algorithm: CompressionAlgorithm;

    /** Compression level used */
    level: number;

    /** Compression time in milliseconds */
    compressionTime: number;
}

/**
 * Decompression result
 */
export interface DecompressionResult {
    /** Decompressed data */
    data: Buffer | string;

    /** Original compressed size in bytes */
    originalSize: number;

    /** Decompressed size in bytes */
    decompressedSize: number;

    /** Decompression time in milliseconds */
    decompressionTime: number;

    /** Algorithm used for decompression */
    algorithm: CompressionAlgorithm;
}

/**
 * Compression options
 */
export interface CompressionOptions {
    /** Compression algorithm */
    algorithm?: CompressionAlgorithm;

    /** Compression level (1-11) */
    level?: number;

    /** Chunk size for streaming */
    chunkSize?: number;

    /** Custom compression options */
    options?: Record<string, unknown>;
}

/**
 * Compression manager interface
 */
export interface ICompressionManager {
    /** Compression configuration */
    readonly config: CompressionConfig;

    /** Supported algorithms */
    readonly supportedAlgorithms: CompressionAlgorithm[];

    /**
     * Compress data
     * @param data Data to compress
     * @param options Compression options
     * @returns Promise resolving to compression result
     * @throws {CommunicationError} If compression fails
     */
    compress(
        data: Buffer | string | Uint8Array,
        options?: CompressionOptions
    ): Promise<CompressionResult>;

    /**
     * Compress data with detailed metrics
     * @param data Data to compress
     * @param options Compression options
     * @returns Promise resolving to compression result with metrics
     */
    compressWithMetrics(
        data: Buffer | string | Uint8Array,
        options?: CompressionOptions
    ): Promise<CompressionResult>;

    /**
     * Decompress data
     * @param data Data to decompress
     * @param options Decompression options
     * @returns Promise resolving to decompression result
     * @throws {CommunicationError} If decompression fails
     */
    decompress(
        data: Buffer | Uint8Array,
        options?: CompressionOptions
    ): Promise<DecompressionResult>;

    /**
     * Check if algorithm is supported
     * @param algorithm Algorithm to check
     * @returns True if algorithm is supported
     */
    isAlgorithmSupported(algorithm: CompressionAlgorithm): boolean;

    /**
     * Get content encoding header for algorithm
     * @param algorithm Compression algorithm
     * @returns Content-Encoding header value
     */
    getContentEncoding(algorithm: CompressionAlgorithm): string;

    /**
     * Get algorithm from content encoding header
     * @param contentEncoding Content-Encoding header value
     * @returns Compression algorithm or undefined
     */
    getAlgorithmFromEncoding(contentEncoding: string): CompressionAlgorithm | undefined;

    /**
     * Should compress based on configuration
     * @param dataSize Data size in bytes
     * @param contentType Content type
     * @returns True if should compress
     */
    shouldCompress(dataSize: number, contentType?: string): boolean;

    /**
     * Create compression stream
     * @param algorithm Compression algorithm
     * @param options Compression options
     * @returns Transform stream for compression
     */
    createCompressionStream(
        algorithm: CompressionAlgorithm,
        options?: CompressionOptions
    ): TransformStream;

    /**
     * Create decompression stream
     * @param algorithm Compression algorithm
     * @returns Transform stream for decompression
     */
    createDecompressionStream(
        algorithm: CompressionAlgorithm
    ): TransformStream;

    /**
     * Update compression configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<CompressionConfig>): void;

    /**
     * Get compression statistics
     */
    getStats(): {
        totalCompressions: number;
        totalDecompressions: number;
        compressionErrors: number;
        decompressionErrors: number;
        averageCompressionTime: number;
        averageDecompressionTime: number;
        averageCompressionRatio: number;
        algorithmUsage: Record<string, number>;
        totalBytesCompressed: number;
        totalBytesDecompressed: number;
        bytesSaved: number;
    };

    /**
     * Reset compression statistics
     */
    resetStats(): void;

    /**
     * Health check for compression manager
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Compression manager factory interface
 */
export interface ICompressionManagerFactory {
    /**
     * Create a new compression manager instance
     * @param name Compression manager name
     * @param config Compression configuration
     * @returns New compression manager instance
     */
    create(
        name: string,
        config?: Partial<CompressionConfig>
    ): ICompressionManager;

    /**
     * Get an existing compression manager instance
     * @param name Compression manager name
     */
    get(name: string): ICompressionManager | undefined;

    /**
     * Get all compression manager instances
     */
    getAll(): ICompressionManager[];

    /**
     * Register a custom compression manager
     * @param name Compression manager name
     * @param manager Compression manager instance or constructor
     */
    register(
        name: string,
        manager: ICompressionManager | (new (config: CompressionConfig) => ICompressionManager)
    ): void;

    /**
     * Get available compression manager names
     */
    getAvailableManagers(): string[];
}