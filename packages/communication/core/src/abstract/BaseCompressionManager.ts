/**
 * Abstract base compression manager implementation
 * @packageDocumentation
 */

import { CommunicationError } from '../errors/CommunicationError.js';
import { COMMUNICATION_ERROR_CODES } from '../errors/communicationErrorCodes.js';
import { SerializationError } from '../errors/SerializationError.js';
import type {
    ICompressionManager,
    CompressionAlgorithm,
    CompressionOptions,
    CompressionResult,
    DecompressionResult,
} from '../interfaces/Compression.interface.js';
import type { CompressionConfig } from '../types/config.js';

/**
 * Abstract base compression manager implementation
 * Provides common functionality for compression management
 */
export abstract class BaseCompressionManager implements ICompressionManager {

    /** Compression manager name */
    public readonly name: string;

    /** Compression configuration */
    public config: CompressionConfig;

    /** Supported algorithms */
    public readonly supportedAlgorithms: CompressionAlgorithm[] = ['none'];

    /** Compression statistics */
    protected stats: {
        totalCompressions: number;
        totalDecompressions: number;
        compressionErrors: number;
        decompressionErrors: number;
        totalCompressionTime: number;
        totalDecompressionTime: number;
        totalOriginalSize: number;
        totalCompressedSize: number;
        totalDecompressedSize: number;
        averageCompressionTime: number;
        averageDecompressionTime: number;
        averageCompressionRatio: number;
        algorithmUsage: Record<string, number>;
    } = {
            totalCompressions: 0,
            totalDecompressions: 0,
            compressionErrors: 0,
            decompressionErrors: 0,
            totalCompressionTime: 0,
            totalDecompressionTime: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalDecompressedSize: 0,
            averageCompressionTime: 0,
            averageDecompressionTime: 0,
            averageCompressionRatio: 0,
            algorithmUsage: {},
        };

    /**
     * Create a new base compression manager instance
     * @param name Compression manager name
     * @param config Compression configuration
     */
    constructor(name: string, config: CompressionConfig) {
        this.name = name;
        this.config = { ...config };
        this.initialize();
    }

    /**
     * Initialize compression manager
     */
    protected initialize(): void {
        // Detect supported algorithms
        this.supportedAlgorithms.push(...this.detectSupportedAlgorithms());
    }

    /**
     * Detect supported compression algorithms
     * @returns Array of supported algorithms
     */
    protected abstract detectSupportedAlgorithms(): CompressionAlgorithm[];

    /**
     * Compress data using specific algorithm
     * @param data Data to compress
     * @param algorithm Compression algorithm
     * @param level Compression level
     * @returns Compressed data
     */
    protected abstract compressData(
        data: Buffer | Uint8Array,
        algorithm: CompressionAlgorithm,
        level: number
    ): Promise<Buffer | Uint8Array>;

    /**
     * Decompress data using specific algorithm
     * @param data Data to decompress
     * @param algorithm Compression algorithm
     * @returns Decompressed data
     */
    protected abstract decompressData(
        data: Buffer | Uint8Array,
        algorithm: CompressionAlgorithm
    ): Promise<Buffer>;

    /**
     * Compress data
     * @param data Data to compress
     * @param options Compression options
     * @returns Promise resolving to compression result
     * @throws {CommunicationError} If compression fails
     */
    public async compress(
        data: Buffer | string | Uint8Array,
        options?: CompressionOptions
    ): Promise<CompressionResult> {
        const result = await this.compressWithMetrics(data, options);
        return result;
    }

    /**
     * Compress data with detailed metrics
     * @param data Data to compress
     * @param options Compression options
     * @returns Promise resolving to compression result with metrics
     */
    public async compressWithMetrics(
        data: Buffer | string | Uint8Array,
        options?: CompressionOptions
    ): Promise<CompressionResult> {
        const startTime = Date.now();
        const algorithm = options?.algorithm || this.config.algorithm || 'gzip';
        const level = options?.level || this.config.level || 6;

        // Convert string to buffer if needed
        const inputBuffer = typeof data === 'string'
            ? Buffer.from(data, 'utf8')
            : Buffer.from(data);

        const originalSize = inputBuffer.length;

        // Check if we should compress
        if (!this.shouldCompress(originalSize)) {
            return {
                data: inputBuffer,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 1,
                algorithm: 'none',
                level: 0,
                compressionTime: Date.now() - startTime,
            };
        }

        // Check algorithm support
        if (!this.isAlgorithmSupported(algorithm)) {
            throw new SerializationError(
                COMMUNICATION_ERROR_CODES.SERIALIZATION_ERROR,
                {
                    message: `Compression algorithm not supported: ${algorithm}`,
                    algorithm,
                    supportedAlgorithms: this.supportedAlgorithms,
                }
            );
        }

        try {
            const compressedData = await this.compressData(inputBuffer, algorithm, level);
            const compressionTime = Date.now() - startTime;
            const compressedSize = compressedData.length;
            const compressionRatio = compressedSize / originalSize;

            // Update statistics
            this.updateCompressionStats(
                originalSize,
                compressedSize,
                compressionTime,
                algorithm
            );

            return {
                data: compressedData,
                originalSize,
                compressedSize,
                compressionRatio,
                algorithm,
                level,
                compressionTime,
            };
        } catch (error) {
            this.stats.compressionErrors++;
            throw new SerializationError(
                COMMUNICATION_ERROR_CODES.SERIALIZATION_ERROR,
                {
                    message: `Compression failed: ${error instanceof Error ? error.message : String(error)}`,
                    algorithm,
                    level,
                    originalSize,
                },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Decompress data
     * @param data Data to decompress
     * @param options Decompression options
     * @returns Promise resolving to decompression result
     * @throws {CommunicationError} If decompression fails
     */
    public async decompress(
        data: Buffer | Uint8Array,
        options?: CompressionOptions
    ): Promise<DecompressionResult> {
        const startTime = Date.now();
        const algorithm = options?.algorithm || this.detectAlgorithm(data) || 'gzip';

        // Check algorithm support
        if (!this.isAlgorithmSupported(algorithm)) {
            throw new SerializationError(
                COMMUNICATION_ERROR_CODES.DESERIALIZATION_ERROR,
                {
                    message: `Decompression algorithm not supported: ${algorithm}`,
                    algorithm,
                    supportedAlgorithms: this.supportedAlgorithms,
                }
            );
        }

        try {
            const decompressedData = await this.decompressData(Buffer.from(data), algorithm);
            const decompressionTime = Date.now() - startTime;
            const originalSize = data.length;
            const decompressedSize = decompressedData.length;

            // Update statistics
            this.updateDecompressionStats(
                originalSize,
                decompressedSize,
                decompressionTime,
                algorithm
            );

            return {
                data: decompressedData,
                originalSize,
                decompressedSize,
                decompressionTime,
                algorithm,
            };
        } catch (error) {
            this.stats.decompressionErrors++;
            throw new SerializationError(
                COMMUNICATION_ERROR_CODES.DESERIALIZATION_ERROR,
                {
                    message: `Decompression failed: ${error instanceof Error ? error.message : String(error)}`,
                    algorithm,
                    originalSize: data.length,
                },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Detect compression algorithm from data
     * @param data Compressed data
     * @returns Detected algorithm or undefined
     */
    protected detectAlgorithm(data: Buffer | Uint8Array): CompressionAlgorithm | undefined {
        const buffer = Buffer.from(data);

        // Check for gzip magic number: 0x1F 0x8B
        if (buffer.length >= 2 && buffer[0] === 0x1F && buffer[1] === 0x8B) {
            return 'gzip';
        }

        // Check for deflate magic number: 0x78 (zlib header)
        if (buffer.length >= 1 && (buffer[0] === 0x78 || buffer[0] === 0x58)) {
            return 'deflate';
        }

        // Check for brotli magic number: 0xCE 0x2B 0x2F
        if (buffer.length >= 3 && buffer[0] === 0xCE && buffer[1] === 0x2B && buffer[2] === 0x2F) {
            return 'brotli';
        }

        return undefined;
    }

    /**
     * Check if algorithm is supported
     * @param algorithm Algorithm to check
     * @returns True if algorithm is supported
     */
    public isAlgorithmSupported(algorithm: CompressionAlgorithm): boolean {
        return this.supportedAlgorithms.includes(algorithm);
    }

    /**
     * Get content encoding header for algorithm
     * @param algorithm Compression algorithm
     * @returns Content-Encoding header value
     */
    public getContentEncoding(algorithm: CompressionAlgorithm): string {
        switch (algorithm) {
            case 'gzip':
                return 'gzip';
            case 'deflate':
                return 'deflate';
            case 'brotli':
                return 'br';
            case 'none':
                return 'identity';
            default:
                return algorithm;
        }
    }

    /**
     * Get algorithm from content encoding header
     * @param contentEncoding Content-Encoding header value
     * @returns Compression algorithm or undefined
     */
    public getAlgorithmFromEncoding(contentEncoding: string): CompressionAlgorithm | undefined {
        const normalized = contentEncoding.toLowerCase().trim();

        switch (normalized) {
            case 'gzip':
            case 'x-gzip':
                return 'gzip';
            case 'deflate':
                return 'deflate';
            case 'br':
                return 'brotli';
            case 'identity':
            case 'none':
                return 'none';
            default:
                return undefined;
        }
    }

    /**
     * Should compress based on configuration
     * @param dataSize Data size in bytes
     * @param contentType Content type
     * @returns True if should compress
     */
    public shouldCompress(dataSize: number, contentType?: string): boolean {
        if (!this.config.enabled) {
            return false;
        }

        // Check minimum size
        if (this.config.minSize && dataSize < this.config.minSize) {
            return false;
        }

        // Check maximum size
        if (this.config.maxSize && dataSize > this.config.maxSize) {
            return false;
        }

        // Check content types
        if (this.config.contentTypes && contentType) {
            const normalizedContentType = contentType.toLowerCase().split(';')[0].trim();
            const shouldCompress = this.config.contentTypes.some(
                ct => normalizedContentType.includes(ct.toLowerCase())
            );
            if (!shouldCompress) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create compression stream
     * @param algorithm Compression algorithm
     * @param options Compression options
     * @returns Transform stream for compression
     */
    public createCompressionStream(
        algorithm: CompressionAlgorithm,
        options?: CompressionOptions
    ): TransformStream {
        throw new Error('createCompressionStream not implemented');
    }

    /**
     * Create decompression stream
     * @param algorithm Compression algorithm
     * @returns Transform stream for decompression
     */
    public createDecompressionStream(
        algorithm: CompressionAlgorithm
    ): TransformStream {
        throw new Error('createDecompressionStream not implemented');
    }

    /**
     * Update compression statistics
     * @param originalSize Original size in bytes
     * @param compressedSize Compressed size in bytes
     * @param compressionTime Compression time in milliseconds
     * @param algorithm Compression algorithm used
     */
    protected updateCompressionStats(
        originalSize: number,
        compressedSize: number,
        compressionTime: number,
        algorithm: CompressionAlgorithm
    ): void {
        this.stats.totalCompressions++;
        this.stats.totalCompressionTime += compressionTime;
        this.stats.totalOriginalSize += originalSize;
        this.stats.totalCompressedSize += compressedSize;

        // Update algorithm usage
        this.stats.algorithmUsage[algorithm] = (this.stats.algorithmUsage[algorithm] || 0) + 1;

        // Update averages
        this.stats.averageCompressionTime = this.stats.totalCompressionTime / this.stats.totalCompressions;
        this.stats.averageCompressionRatio = this.stats.totalCompressedSize / this.stats.totalOriginalSize;
    }

    /**
     * Update decompression statistics
     * @param originalSize Original compressed size in bytes
     * @param decompressedSize Decompressed size in bytes
     * @param decompressionTime Decompression time in milliseconds
     * @param algorithm Decompression algorithm used
     */
    protected updateDecompressionStats(
        originalSize: number,
        decompressedSize: number,
        decompressionTime: number,
        algorithm: CompressionAlgorithm
    ): void {
        this.stats.totalDecompressions++;
        this.stats.totalDecompressionTime += decompressionTime;
        this.stats.totalDecompressedSize += decompressedSize;

        // Update algorithm usage
        this.stats.algorithmUsage[algorithm] = (this.stats.algorithmUsage[algorithm] || 0) + 1;

        // Update averages
        this.stats.averageDecompressionTime = this.stats.totalDecompressionTime / this.stats.totalDecompressions;
    }

    /**
     * Update compression configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<CompressionConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get compression statistics
     */
    public getStats(): {
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
    } {
        const bytesSaved = this.stats.totalOriginalSize - this.stats.totalCompressedSize;

        return {
            totalCompressions: this.stats.totalCompressions,
            totalDecompressions: this.stats.totalDecompressions,
            compressionErrors: this.stats.compressionErrors,
            decompressionErrors: this.stats.decompressionErrors,
            averageCompressionTime: this.stats.averageCompressionTime,
            averageDecompressionTime: this.stats.averageDecompressionTime,
            averageCompressionRatio: this.stats.averageCompressionRatio,
            algorithmUsage: { ...this.stats.algorithmUsage },
            totalBytesCompressed: this.stats.totalOriginalSize,
            totalBytesDecompressed: this.stats.totalDecompressedSize,
            bytesSaved: Math.max(0, bytesSaved),
        };
    }

    /**
     * Reset compression statistics
     */
    public resetStats(): void {
        this.stats = {
            totalCompressions: 0,
            totalDecompressions: 0,
            compressionErrors: 0,
            decompressionErrors: 0,
            totalCompressionTime: 0,
            totalDecompressionTime: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalDecompressedSize: 0,
            averageCompressionTime: 0,
            averageDecompressionTime: 0,
            averageCompressionRatio: 0,
            algorithmUsage: {},
        };
    }

    /**
     * Health check for compression manager
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = this.supportedAlgorithms.length > 0;

        return {
            healthy,
            message: healthy ? 'Compression manager is operational' : 'No compression algorithms supported',
            details: {
                name: this.name,
                supportedAlgorithms: this.supportedAlgorithms,
                config: this.config,
                statistics: this.getStats(),
            },
        };
    }
}