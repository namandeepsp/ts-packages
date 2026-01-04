/**
 * Protocol interface for communication layer
 * @packageDocumentation
 */

import type { BaseProtocolConfig } from '../types/config.js';
import type { Request } from '../types/request.js';
import type { Response } from '../types/response.js';
import type { IInterceptor } from './Interceptor.interface.js';

/**
 * Protocol interface for all communication protocols
 * This is the base contract that all protocols must implement
 */
export interface IProtocol<TRequest = Request, TResponse = Response> {
    /** Protocol name identifier */
    readonly name: string;

    /** Protocol version */
    readonly version?: string;

    /** Protocol configuration */
    readonly config: BaseProtocolConfig;

    /**
     * Send a request using this protocol
     * @param request The request to send
     * @returns Promise resolving to the response
     * @throws {CommunicationError} If the request fails
     */
    send(request: TRequest): Promise<TResponse>;

    /**
     * Configure the protocol with new settings
     * @param config Configuration object
     */
    configure(config: Partial<BaseProtocolConfig>): void;

    /**
     * Connect to the service (for stateful protocols)
     * @returns Promise that resolves when connected
     */
    connect?(): Promise<void>;

    /**
     * Disconnect from the service (for stateful protocols)
     * @returns Promise that resolves when disconnected
     */
    disconnect?(): Promise<void>;

    /**
     * Check if the protocol is currently connected
     * @returns True if connected, false otherwise
     */
    isConnected?(): boolean;

    /**
     * Add an interceptor to the protocol
     * @param interceptor Interceptor to add
     */
    addInterceptor?(interceptor: IInterceptor<TRequest, TResponse>): void;

    /**
     * Remove an interceptor from the protocol
     * @param interceptorId Interceptor identifier
     */
    removeInterceptor?(interceptorId: string): void;

    /**
     * Get all interceptors
     */
    getInterceptors?(): IInterceptor<TRequest, TResponse>[];

    /**
     * Event emitter for protocol events
     */
    readonly events?: {
        /**
         * Subscribe to protocol events
         * @param event Event name
         * @param listener Event listener
         */
        on(event: string, listener: (data: any) => void): void;

        /**
         * Unsubscribe from protocol events
         * @param event Event name
         * @param listener Event listener
         */
        off(event: string, listener: (data: any) => void): void;
    };

    /**
     * Get protocol metrics
     */
    getMetrics?(): Record<string, unknown>;

    /**
     * Reset protocol metrics
     */
    resetMetrics?(): void;

    /**
     * Health check for the protocol
     * @returns Promise resolving to health status
     */
    healthCheck?(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, unknown>;
    }>;
}

/**
 * Protocol factory interface for creating protocol instances
 */
export interface IProtocolFactory {
    /**
     * Create a new protocol instance
     * @param config Protocol configuration
     * @returns New protocol instance
     */
    create(config: BaseProtocolConfig): IProtocol;

    /**
     * Register a protocol implementation
     * @param name Protocol name
     * @param constructor Protocol constructor
     */
    register?(name: string, constructor: new (config: BaseProtocolConfig) => IProtocol): void;

    /**
     * Get available protocol names
     * @returns Array of protocol names
     */
    getAvailableProtocols?(): string[];
}