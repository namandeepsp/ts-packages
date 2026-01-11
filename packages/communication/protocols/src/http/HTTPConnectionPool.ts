import axios, { type AxiosInstance } from 'axios';
import { BaseConnectionPool, COMMUNICATION_ERROR_CODES, CommunicationError } from '@naman_deep_singh/communication-core';
import type { IConnection, ConnectionPoolConfig } from '@naman_deep_singh/communication-core';

export interface HTTPConnection extends IConnection {
  axiosInstance: AxiosInstance;
  baseURL: string;
}

export interface HTTPConnectionPoolConfig extends ConnectionPoolConfig {
  baseURL: string;
  timeout?: number;
  maxRedirects?: number;
  keepAlive?: boolean;
  maxSockets?: number;
}

export class HTTPConnectionPool extends BaseConnectionPool<HTTPConnection> {
  private readonly baseURL: string;
  private readonly axiosConfig: any;

  constructor(name: string, config: HTTPConnectionPoolConfig) {
    super(
      name, 
      config,
      async () => this.createConnectionInternal(),
      async (conn) => conn.healthCheck()
    );
    this.baseURL = config.baseURL;
    this.axiosConfig = {
      timeout: config.timeout || 30000,
      maxRedirects: config.maxRedirects || 5,
      httpAgent: config.keepAlive ? new (require('http').Agent)({ 
        keepAlive: true,
        maxSockets: config.maxSockets || 10
      }) : undefined,
      httpsAgent: config.keepAlive ? new (require('https').Agent)({ 
        keepAlive: true,
        maxSockets: config.maxSockets || 10
      }) : undefined
    };
  }

  public async createConnection(): Promise<HTTPConnection> {
    return this.createConnectionInternal();
  }

  private async createConnectionInternal(): Promise<HTTPConnection> {
    const connectionId = `http_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const axiosInstance = axios.create({
      baseURL: this.baseURL,
      ...this.axiosConfig
    });

    const axiosConfig = this.axiosConfig; // Store reference for closure

    const connection: HTTPConnection = {
      id: connectionId,
      axiosInstance,
      baseURL: this.baseURL,
      isHealthy: () => true, // HTTP connections are stateless
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      usageCount: 0,
      metadata: {
        baseURL: this.baseURL,
        timeout: this.axiosConfig.timeout
      },
      
      async close(): Promise<void> {
        // HTTP connections don't need explicit closing
      },
      
      async healthCheck(): Promise<boolean> {
        try {
          // Simple health check - try to make a HEAD request to base URL
          await axiosInstance.head('/', { timeout: 5000 });
          return true;
        } catch {
          return false;
        }
      },
      
      async reset(): Promise<void> {
        // Reset axios instance defaults if needed
        axiosInstance.defaults.timeout = axiosConfig.timeout;
      }
    };

    return connection;
  }

  public async validateConnection(connection: HTTPConnection): Promise<boolean> {
    try {
      return await connection.healthCheck();
    } catch {
      return false;
    }
  }

  public async executeRequest<T>(
    connection: HTTPConnection,
    config: any
  ): Promise<any> {
    try {
      const response = await connection.axiosInstance.request(config);
      
      // Update connection usage
      (connection as any).lastUsedAt = Date.now();
      (connection as any).usageCount++;
      
      return response;
    } catch (error) {
      throw new CommunicationError(
        COMMUNICATION_ERROR_CODES.CONNECTION_ERROR,
        503,
        {
          message: `HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          connectionId: connection.id,
          baseURL: connection.baseURL,
          config
        }
      );
    }
  }

  protected async onConnectionCreated(connection: HTTPConnection): Promise<void> {
    // Setup connection-specific interceptors if needed
    connection.axiosInstance.interceptors.request.use(
      (config) => {
        (config as any).metadata = { 
          ...(config as any).metadata, 
          connectionId: connection.id,
          timestamp: Date.now() 
        };
        return config;
      }
    );
  }

  protected async onConnectionDestroyed(connection: HTTPConnection): Promise<void> {
    await connection.close();
  }
}