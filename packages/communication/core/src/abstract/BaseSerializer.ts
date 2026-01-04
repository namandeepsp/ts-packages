/**
 * Abstract base serializer implementation
 * @packageDocumentation
 */

import { CommunicationError } from '../errors/CommunicationError.js';
import { COMMUNICATION_ERROR_CODES } from '../errors/communicationErrorCodes.js';
import type {
    DeserializationContext,
    ISerializer,
    SerializationContext,
} from '../interfaces/Serializer.interface.js';
import type { SerializationConfig, SerializationFormat } from '../types/config.js';

/**
 * Abstract base serializer implementation
 * Provides common functionality for all serializer implementations
 */
export abstract class BaseSerializer implements ISerializer {

    /** Serializer name */
    public readonly name: string;

    /** Supported formats */
    public readonly supportedFormats: SerializationFormat[];

    /** Default format */
    public readonly defaultFormat: SerializationFormat;

    /** Serializer configuration */
    public config: SerializationConfig;

    /** Format handlers registry */
    protected formatHandlers: Map<
        SerializationFormat,
        {
            serialize: (data: unknown, context?: SerializationContext) => string | Buffer | Uint8Array;
            deserialize: (data: string | Buffer | Uint8Array, context?: DeserializationContext) => unknown;
            contentType?: string;
        }
    > = new Map();

    /** Serializer statistics */
    protected stats: {
        totalSerializations: number;
        totalDeserializations: number;
        serializationErrors: number;
        deserializationErrors: number;
        averageSerializationTime: number;
        averageDeserializationTime: number;
        formatUsage: Record<string, number>;
    } = {
            totalSerializations: 0,
            totalDeserializations: 0,
            serializationErrors: 0,
            deserializationErrors: 0,
            averageSerializationTime: 0,
            averageDeserializationTime: 0,
            formatUsage: {},
        };

    /**
     * Create a new base serializer instance
     * @param name Serializer name
     * @param config Serializer configuration
     */
    constructor(
        name: string,
        config: SerializationConfig
    ) {
        this.name = name;
        this.config = { ...config };
        this.supportedFormats = this.initializeSupportedFormats();
        this.defaultFormat = this.supportedFormats[0] || 'json';
        this.initialize();
    }

    /**
     * Initialize supported formats
     * @returns Array of supported formats
     */
    protected abstract initializeSupportedFormats(): SerializationFormat[];

    /**
     * Initialize serializer
     */
    protected initialize(): void {
        // Register default format handlers
        this.registerDefaultHandlers();
    }

    /**
     * Register default format handlers
     */
    protected abstract registerDefaultHandlers(): void;

    /**
     * Serialize data to a specific format
     * @param data Data to serialize
     * @param context Serialization context
     * @returns Serialized data
     * @throws {CommunicationError} If serialization fails
     */
    public abstract serialize<T = unknown>(
        data: T,
        context?: Partial<SerializationContext>
    ): string | Buffer | Uint8Array;

    /**
     * Deserialize data from a specific format
     * @param data Data to deserialize
     * @param context Deserialization context
     * @returns Deserialized data
     * @throws {CommunicationError} If deserialization fails
     */
    public abstract deserialize<T = unknown>(
        data: string | Buffer | Uint8Array,
        context?: Partial<DeserializationContext>
    ): T;

    /**
     * Perform serialization with timing and error handling
     * @param data Data to serialize
     * @param context Serialization context
     * @param handler Serialization handler
     * @returns Serialized data
     */
    protected performSerialization(
        data: unknown,
        context: SerializationContext,
        handler: (data: unknown, context: SerializationContext) => string | Buffer | Uint8Array
    ): string | Buffer | Uint8Array {
        const startTime = Date.now();
        const format = context.format;

        try {
            // Transform data if needed
            const transformedData = this.transformData(data, 'serialize');

            // Perform serialization
            const result = handler(transformedData, context);

            // Update statistics
            this.updateSerializationStats(true, Date.now() - startTime, format);

            return result;
        } catch (error) {
            // Update error statistics
            this.updateSerializationStats(false, Date.now() - startTime, format);

            throw new CommunicationError(COMMUNICATION_ERROR_CODES.SERIALIZATION_ERROR, 500, {
                message: `Serialization failed for format: ${format}`,
                format,
                originalError: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Perform deserialization with timing and error handling
     * @param data Data to deserialize
     * @param context Deserialization context
     * @param handler Deserialization handler
     * @returns Deserialized data
     */
    protected performDeserialization<T>(
        data: string | Buffer | Uint8Array,
        context: DeserializationContext,
        handler: (data: string | Buffer | Uint8Array, context: DeserializationContext) => unknown
    ): T {
        const startTime = Date.now();
        const format = context.format;

        try {
            // Perform deserialization
            const result = handler(data, context);

            // Transform data if needed
            const transformedResult = this.transformData(result, 'deserialize') as T;

            // Update statistics
            this.updateDeserializationStats(true, Date.now() - startTime, format);

            return transformedResult;
        } catch (error) {
            // Update error statistics
            this.updateDeserializationStats(false, Date.now() - startTime, format);

            throw new CommunicationError(
                COMMUNICATION_ERROR_CODES.DESERIALIZATION_ERROR, 500, {
                message: `Deserialization failed for format: ${format}`,
                format,
                originalError: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Transform data (e.g., date parsing, bigint handling)
     * @param data Data to transform
     * @param direction 'serialize' or 'deserialize'
     */
    protected transformData(
        data: unknown,
        direction: 'serialize' | 'deserialize'
    ): unknown {
        if (data === null || data === undefined) {
            return data;
        }

        // Handle dates based on configuration
        if (this.config.dateParsing) {
            data = this.transformDates(data, direction);
        }

        // Handle bigints based on configuration
        if (this.config.bigIntParsing) {
            data = this.transformBigInts(data, direction);
        }

        // Apply custom transformations
        data = this.applyCustomTransformations(data, direction);

        return data;
    }

    /**
     * Transform dates based on configuration
     * @param data Data containing dates
     * @param direction Transformation direction
     */
    protected transformDates(
        data: unknown,
        direction: 'serialize' | 'deserialize'
    ): unknown {
        if (data instanceof Date) {
            switch (this.config.dateParsing) {
                case 'string':
                    return direction === 'serialize' ? data.toISOString() : data;
                case 'timestamp':
                    return direction === 'serialize' ? data.getTime() : data;
                default:
                    return data;
            }
        }

        if (Array.isArray(data)) {
            return data.map(item => this.transformDates(item, direction));
        }

        if (typeof data === 'object' && data !== null) {
            const transformed: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(data)) {
                transformed[key] = this.transformDates(value, direction);
            }
            return transformed;
        }

        return data;
    }

    /**
     * Transform bigints based on configuration
     * @param data Data containing bigints
     * @param direction Transformation direction
     */
    protected transformBigInts(
        data: unknown,
        direction: 'serialize' | 'deserialize'
    ): unknown {
        if (typeof data === 'bigint') {
            switch (this.config.bigIntParsing) {
                case 'string':
                    return direction === 'serialize' ? data.toString() : data;
                case 'number':
                    return direction === 'serialize' ? Number(data) : BigInt(data);
                default:
                    return data;
            }
        }

        if (Array.isArray(data)) {
            return data.map(item => this.transformBigInts(item, direction));
        }

        if (typeof data === 'object' && data !== null) {
            const transformed: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(data)) {
                transformed[key] = this.transformBigInts(value, direction);
            }
            return transformed;
        }

        return data;
    }

    /**
     * Apply custom transformations
     * @param data Data to transform
     * @param direction Transformation direction
     */
    protected applyCustomTransformations(
        data: unknown,
        direction: 'serialize' | 'deserialize'
    ): unknown {
        // Can be overridden by subclasses
        return data;
    }

    /**
     * Update serialization statistics
     * @param success Whether serialization succeeded
     * @param duration Serialization duration in milliseconds
     * @param format Format used
     */
    protected updateSerializationStats(
        success: boolean,
        duration: number,
        format: string
    ): void {
        this.stats.totalSerializations++;
        this.stats.averageSerializationTime = (
            (this.stats.averageSerializationTime * (this.stats.totalSerializations - 1) + duration) /
            this.stats.totalSerializations
        );

        if (!success) {
            this.stats.serializationErrors++;
        }

        // Update format usage
        this.stats.formatUsage[format] = (this.stats.formatUsage[format] || 0) + 1;
    }

    /**
     * Update deserialization statistics
     * @param success Whether deserialization succeeded
     * @param duration Deserialization duration in milliseconds
     * @param format Format used
     */
    protected updateDeserializationStats(
        success: boolean,
        duration: number,
        format: string
    ): void {
        this.stats.totalDeserializations++;
        this.stats.averageDeserializationTime = (
            (this.stats.averageDeserializationTime * (this.stats.totalDeserializations - 1) + duration) /
            this.stats.totalDeserializations
        );

        if (!success) {
            this.stats.deserializationErrors++;
        }

        // Update format usage
        this.stats.formatUsage[format] = (this.stats.formatUsage[format] || 0) + 1;
    }

    /**
     * Check if a format is supported
     * @param format Format to check
     */
    public supportsFormat(format: SerializationFormat): boolean {
        return this.supportedFormats.includes(format);
    }

    /**
     * Get content type for a format
     * @param format Format
     * @returns Content type string
     */
    public getContentType(format: SerializationFormat): string {
        const handler = this.formatHandlers.get(format);
        if (handler?.contentType) {
            return handler.contentType;
        }

        // Default content types
        switch (format) {
            case 'json':
                return 'application/json';
            case 'xml':
                return 'application/xml';
            case 'yaml':
                return 'application/yaml';
            case 'protobuf':
                return 'application/protobuf';
            case 'msgpack':
                return 'application/msgpack';
            default:
                return 'application/octet-stream';
        }
    }

    /**
     * Get format from content type
     * @param contentType Content type
     * @returns Format or undefined if not recognized
     */
    public getFormatFromContentType(contentType: string): SerializationFormat | undefined {
        const normalized = contentType.toLowerCase().split(';')[0].trim();

        for (const [format, handler] of this.formatHandlers.entries()) {
            if (handler.contentType && handler.contentType.toLowerCase() === normalized) {
                return format;
            }
        }

        // Check common content types
        if (normalized.includes('json')) {
            return 'json';
        } else if (normalized.includes('xml')) {
            return 'xml';
        } else if (normalized.includes('yaml') || normalized.includes('yml')) {
            return 'yaml';
        } else if (normalized.includes('protobuf')) {
            return 'protobuf';
        } else if (normalized.includes('msgpack')) {
            return 'msgpack';
        }

        return undefined;
    }

    /**
     * Register a custom format handler
     * @param format Format name
     * @param handler Serialization/deserialization functions
     */
    public registerFormat(
        format: SerializationFormat,
        handler: {
            serialize: (data: unknown) => string | Buffer | Uint8Array;
            deserialize: (data: string | Buffer | Uint8Array) => unknown;
            contentType?: string;
        }
    ): void {
        this.formatHandlers.set(format, handler);
        if (!this.supportedFormats.includes(format)) {
            this.supportedFormats.push(format);
        }
    }

    /**
     * Update serializer configuration
     * @param config New configuration
     */
    public updateConfig(config: Partial<SerializationConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get serializer statistics
     */
    public getStats(): {
        totalSerializations: number;
        totalDeserializations: number;
        serializationErrors: number;
        deserializationErrors: number;
        averageSerializationTime: number;
        averageDeserializationTime: number;
        formatUsage: Record<string, number>;
    } {
        return { ...this.stats };
    }

    /**
     * Reset serializer statistics
     */
    public resetStats(): void {
        this.stats = {
            totalSerializations: 0,
            totalDeserializations: 0,
            serializationErrors: 0,
            deserializationErrors: 0,
            averageSerializationTime: 0,
            averageDeserializationTime: 0,
            formatUsage: {},
        };
    }

    /**
     * Health check for the serializer
     */
    public healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    } {
        const healthy = this.supportedFormats.length > 0;

        return {
            healthy,
            message: healthy ? 'Serializer is operational' : 'No supported formats configured',
            details: {
                name: this.name,
                supportedFormats: this.supportedFormats,
                defaultFormat: this.defaultFormat,
                registeredFormats: Array.from(this.formatHandlers.keys()),
                statistics: this.getStats(),
            },
        };
    }
}