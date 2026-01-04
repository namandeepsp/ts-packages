/**
 * Serializer interface for communication layer
 * @packageDocumentation
 */
import type { SerializationConfig, SerializationFormat } from '../types/config.js';

/**
 * Serialization context
 */
export interface SerializationContext {
    /** Target format */
    format: SerializationFormat;

    /** Content type */
    contentType?: string;

    /** Character encoding */
    encoding?: string;

    /** Custom serialization options */
    options?: Record<string, unknown>;

    /** Request/response metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Deserialization context
 */
export interface DeserializationContext {
    /** Source format */
    format: SerializationFormat;

    /** Content type */
    contentType?: string;

    /** Character encoding */
    encoding?: string;

    /** Target type (for type-safe deserialization) */
    targetType?: unknown;

    /** Custom deserialization options */
    options?: Record<string, unknown>;

    /** Request/response metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Serializer interface for serializing and deserializing data
 */
export interface ISerializer {
    /** Serializer name */
    readonly name: string;

    /** Supported formats */
    readonly supportedFormats: SerializationFormat[];

    /** Default format */
    readonly defaultFormat: SerializationFormat;

    /** Serializer configuration */
    readonly config: SerializationConfig;

    /**
     * Serialize data to a specific format
     * @param data Data to serialize
     * @param context Serialization context
     * @returns Serialized data
     * @throws {CommunicationError} If serialization fails
     */
    serialize<T = unknown>(
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
    deserialize<T = unknown>(
        data: string | Buffer | Uint8Array,
        context?: Partial<DeserializationContext>
    ): T;

    /**
     * Check if a format is supported
     * @param format Format to check
     */
    supportsFormat(format: SerializationFormat): boolean;

    /**
     * Get content type for a format
     * @param format Format
     * @returns Content type string
     */
    getContentType(format: SerializationFormat): string;

    /**
     * Get format from content type
     * @param contentType Content type
     * @returns Format or undefined if not recognized
     */
    getFormatFromContentType(contentType: string): SerializationFormat | undefined;

    /**
     * Validate data against a schema
     * @param data Data to validate
     * @param schema Validation schema
     * @returns Validation result
     */
    validate?(
        data: unknown,
        schema: unknown
    ): {
        valid: boolean;
        errors?: string[];
        details?: Record<string, unknown>;
    };

    /**
     * Transform data (e.g., date parsing, bigint handling)
     * @param data Data to transform
     * @param direction 'serialize' or 'deserialize'
     */
    transform?(
        data: unknown,
        direction: 'serialize' | 'deserialize'
    ): unknown;

    /**
     * Register a custom format handler
     * @param format Format name
     * @param handler Serialization/deserialization functions
     */
    registerFormat?(
        format: SerializationFormat,
        handler: {
            serialize: (data: unknown) => string | Buffer | Uint8Array;
            deserialize: (data: string | Buffer | Uint8Array) => unknown;
            contentType?: string;
        }
    ): void;

    /**
     * Update serializer configuration
     * @param config New configuration
     */
    updateConfig(config: Partial<SerializationConfig>): void;

    /**
     * Get serializer statistics
     */
    getStats(): {
        totalSerializations: number;
        totalDeserializations: number;
        serializationErrors: number;
        deserializationErrors: number;
        averageSerializationTime: number;
        averageDeserializationTime: number;
        formatUsage: Record<string, number>;
    };

    /**
     * Reset serializer statistics
     */
    resetStats(): void;

    /**
     * Health check for the serializer
     */
    healthCheck(): {
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Serializer factory interface
 */
export interface ISerializerFactory {
    /**
     * Create a new serializer instance
     * @param name Serializer name
     * @param config Serializer configuration
     * @returns New serializer instance
     */
    create(
        name: string,
        config?: Partial<SerializationConfig>
    ): ISerializer;

    /**
     * Get an existing serializer instance
     * @param name Serializer name
     */
    get(name: string): ISerializer | undefined;

    /**
     * Get all serializer instances
     */
    getAll(): ISerializer[];

    /**
     * Register a custom serializer
     * @param name Serializer name
     * @param serializer Serializer instance or constructor
     */
    register(
        name: string,
        serializer: ISerializer | (new (config: SerializationConfig) => ISerializer)
    ): void;

    /**
     * Get available serializer names
     */
    getAvailableSerializers(): string[];

    /**
     * Get serializer for a specific format
     * @param format Format
     * @returns Serializer or undefined
     */
    getSerializerForFormat(format: SerializationFormat): ISerializer | undefined;
}
