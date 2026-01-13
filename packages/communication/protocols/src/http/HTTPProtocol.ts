import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { BaseProtocol, CommunicationError, COMMUNICATION_ERROR_CODES } from '@naman_deep_singh/communication-core';
import type { HTTPRequest, HTTPResponse, BaseProtocolConfig } from '@naman_deep_singh/communication-core';
import { HTTPConnectionPool } from './HTTPConnectionPool.js';

export interface HTTPProtocolConfig extends BaseProtocolConfig {
  baseURL?: string;
  timeout?: number;
  maxRedirects?: number;
  validateStatus?: (status: number) => boolean;
  withCredentials?: boolean;
  auth?: {
    username: string;
    password: string;
  };
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export class HTTPProtocol extends BaseProtocol<HTTPRequest, HTTPResponse> {
  private axiosInstance: AxiosInstance;
  private connectionPool?: HTTPConnectionPool;

  constructor(config: HTTPProtocolConfig) {
    super('http', config);

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      maxRedirects: config.maxRedirects || 5,
      validateStatus: config.validateStatus || ((status) => status >= 200 && status < 300),
      withCredentials: config.withCredentials || false,
      auth: config.auth,
      proxy: config.proxy
    });

    this.setupInterceptors();
  }

  public async send(request: HTTPRequest): Promise<HTTPResponse> {
    const startTime = Date.now();
    const context = this.createRequestContext(request);

    try {
      // Execute request interceptors
      const processedRequest = await this.executeRequestInterceptors(request, context);

      // Convert to axios config
      const axiosConfig: AxiosRequestConfig = {
        method: processedRequest.method,
        url: processedRequest.url,
        data: processedRequest.body,
        params: processedRequest.query,
        headers: processedRequest.headers,
        timeout: processedRequest.timeout || this.config.timeout,
        responseType: processedRequest.responseType || 'json'
      };

      // Send request
      const axiosResponse: AxiosResponse = await this.axiosInstance.request(axiosConfig);

      // Create HTTP response
      const response: HTTPResponse = {
        data: axiosResponse.data,
        status: axiosResponse.status as any, // Cast to satisfy HTTPStatusCode
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers as Record<string, string>,
        url: axiosResponse.config.url || processedRequest.url,
        duration: Date.now() - startTime,
        requestId: context.requestId,
        redirected: axiosResponse.request?.res?.responseUrl !== axiosResponse.config.url
      };

      // Execute response interceptors
      const processedResponse = await this.executeResponseInterceptors(response, context);

      this.updateMetrics(true, Date.now() - startTime);
      return processedResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, duration);

      const commError = this.createCommunicationError(error, request, context);
      const errorResult = await this.executeErrorInterceptors(commError, context);

      if (errorResult instanceof CommunicationError) {
        throw errorResult;
      }

      return errorResult as HTTPResponse;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        (config as any).metadata = { ...(config as any).metadata, timestamp: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }

  private createCommunicationError(error: any, request: HTTPRequest, context: any): CommunicationError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      const message = error.message || 'HTTP request failed';

      return new CommunicationError(
        COMMUNICATION_ERROR_CODES.HTTP_PROTOCOL_ERROR,
        status,
        {
          message,
          statusText: error.response?.statusText,
          url: request.url,
          method: request.method,
          requestId: context.requestId,
          response: error.response?.data
        }
      );
    }

    return new CommunicationError(
      COMMUNICATION_ERROR_CODES.PROTOCOL_ERROR,
      500,
      {
        message: error.message || 'Unknown HTTP error',
        url: request.url,
        method: request.method,
        requestId: context.requestId
      }
    );
  }

  public setConnectionPool(pool: HTTPConnectionPool): void {
    this.connectionPool = pool;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  protected async onConfigure(newConfig: Partial<HTTPProtocolConfig>): Promise<void> {
    // Update axios defaults
    if (newConfig.baseURL) this.axiosInstance.defaults.baseURL = newConfig.baseURL;
    if (newConfig.timeout) this.axiosInstance.defaults.timeout = newConfig.timeout;
    if (newConfig.withCredentials !== undefined) {
      this.axiosInstance.defaults.withCredentials = newConfig.withCredentials;
    }
  }
}