import { BaseInterceptor, CommunicationError, COMMUNICATION_ERROR_CODES } from '@naman_deep_singh/communication-core';
import type { HTTPRequest, HTTPResponse, RequestContext } from '@naman_deep_singh/communication-core';

export interface HTTPInterceptorConfig {
  /** Interceptor name */
  name: string;
  /** Interceptor priority (higher = executed first) */
  priority?: number;
  /** Enable/disable interceptor */
  enabled?: boolean;
  /** Request timeout for this interceptor */
  timeout?: number;
}

export class HTTPInterceptor extends BaseInterceptor<HTTPRequest, HTTPResponse> {
  constructor(config: HTTPInterceptorConfig) {
    super(config.name, {
      enabled: config.enabled !== false,
      priority: config.priority || 0,
      timeout: config.timeout
    });
  }

  public async onRequest(
    request: HTTPRequest,
    context: RequestContext
  ): Promise<HTTPRequest | undefined> {
    // Add default headers if not present
    const headers = {
      'User-Agent': 'communication-protocols/1.0.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...request.headers
    };

    // Add request ID if not present
    const requestId = request.id || context.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add timestamp
    const timestamp = request.timestamp || Date.now();

    return {
      ...request,
      id: requestId,
      timestamp,
      headers
    };
  }

  public async onResponse(
    response: HTTPResponse,
    context: RequestContext
  ): Promise<HTTPResponse | undefined> {
    // Add response processing timestamp
    const processedResponse: HTTPResponse = {
      ...response,
      metadata: {
        ...response.metadata,
        processedAt: Date.now(),
        interceptor: this.name
      }
    };

    return processedResponse;
  }

  public async onError(
    error: CommunicationError,
    context: RequestContext
  ): Promise<CommunicationError | undefined> {
    // Add error context - create new error with enhanced details
    const enhancedError = new CommunicationError(
      COMMUNICATION_ERROR_CODES.PROTOCOL_ERROR,
      error.statusCode,
      {
        message: error.message,
        originalCode: error.code,
        interceptor: this.name,
        context: {
          requestId: context.requestId,
          attempt: context.attempt,
          timestamp: Date.now()
        }
      }
    );

    return enhancedError;
  }

  protected async onInitialize(context: any): Promise<void> {
    // Setup interceptor-specific initialization
    console.log(`HTTP Interceptor '${this.name}' initialized for protocol: ${context.protocol}`);
  }

  protected async onCleanup(): Promise<void> {
    // Cleanup interceptor resources
    console.log(`HTTP Interceptor '${this.name}' cleaned up`);
  }
}

/**
 * Pre-built HTTP interceptors
 */
export class LoggingHTTPInterceptor extends HTTPInterceptor {
  constructor(enabled: boolean = true) {
    super({ name: 'logging', priority: 100, enabled });
  }

  public async onRequest(request: HTTPRequest, context: RequestContext): Promise<HTTPRequest | undefined> {
    console.log(`[HTTP] ${request.method} ${request.url}`, {
      requestId: context.requestId,
      headers: request.headers,
      timestamp: new Date().toISOString()
    });

    return super.onRequest(request, context);
  }

  public async onResponse(response: HTTPResponse, context: RequestContext): Promise<HTTPResponse | undefined> {
    console.log(`[HTTP] Response ${response.status} ${response.statusText}`, {
      requestId: context.requestId,
      duration: response.duration,
      timestamp: new Date().toISOString()
    });

    return super.onResponse(response, context);
  }

  public async onError(error: CommunicationError, context: RequestContext): Promise<CommunicationError | undefined> {
    console.error(`[HTTP] Error ${error.code}: ${error.message}`, {
      requestId: context.requestId,
      details: error.details,
      timestamp: new Date().toISOString()
    });

    return super.onError(error, context);
  }
}

export class AuthHTTPInterceptor extends HTTPInterceptor {
  private token?: string;
  private tokenType: string;

  constructor(token?: string, tokenType: string = 'Bearer', enabled: boolean = true) {
    super({ name: 'auth', priority: 90, enabled });
    this.token = token;
    this.tokenType = tokenType;
  }

  public setToken(token: string, tokenType: string = 'Bearer'): void {
    this.token = token;
    this.tokenType = tokenType;
  }

  public async onRequest(request: HTTPRequest, context: RequestContext): Promise<HTTPRequest | undefined> {
    if (this.token && !request.headers?.['Authorization']) {
      const headers = {
        ...request.headers,
        'Authorization': `${this.tokenType} ${this.token}`
      };

      return {
        ...request,
        headers
      };
    }

    return super.onRequest(request, context);
  }
}