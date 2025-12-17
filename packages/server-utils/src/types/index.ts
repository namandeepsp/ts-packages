import express from 'express';

export interface CorsOptions {
  origin?: string | string[] | boolean | RegExp | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export interface ServerConfig {
  port?: number;
  cors?: boolean | CorsOptions;
  helmet?: boolean;
  json?: boolean;
  cookieParser?: boolean;
  customMiddleware?: express.RequestHandler[];
  healthCheck?: boolean | string;
  gracefulShutdown?: boolean;
  socketIO?: SocketIOConfig;
  periodicHealthCheck?: PeriodicHealthCheckConfig;
  name?: string;
  version?: string;
  // Cache integration (disabled by default)
  cache?: {
    enabled?: boolean;
    // adapter specific options passed to CacheFactory.create
    adapter?: 'redis' | 'memcache' | 'memory';
    options?: unknown;
    defaultTTL?: number;
  };
  // Session integration (disabled by default)
  session?: {
    enabled?: boolean;
    // cookie name pattern will be generated as {servername}.sid unless overridden
    cookieName?: string;
    ttl?: number;
    cookieOptions?: {
      path?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
    };
  };
}

export interface PeriodicHealthCheckConfig {
  enabled?: boolean;
  interval?: number;
  services?: HealthCheckService[];
}

export interface HealthCheckService {
  name: string;
  url: string;
  timeout?: number;
}

export interface SocketIOConfig {
  enabled?: boolean;
  cors?: boolean | {
    origin?: string | string[] | boolean;
    methods?: string[];
    credentials?: boolean;
  };
  onConnection?: (socket: unknown) => void;
  onDisconnection?: (socket: unknown, reason: string) => void;
  path?: string;
}

export interface HealthCheckConfig {
  path?: string;
  customChecks?: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
}

export interface GracefulShutdownConfig {
  timeout?: number;
  onShutdown?: () => Promise<void>;
  serverName?: string;
  serverVersion?: string;
}

export interface SocketInstance {
  id: string;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  broadcast: {
    emit: (event: string, data?: unknown) => void;
  };
  disconnect: () => void;
}

export type ServerPlugin = (app: express.Application, config: ServerConfig) => void;