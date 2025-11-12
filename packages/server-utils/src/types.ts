import express from 'express';
import { CorsOptions } from 'cors';

export interface ServerConfig {
  port?: number;
  cors?: boolean | CorsOptions;
  helmet?: boolean;
  json?: boolean;
  customMiddleware?: express.RequestHandler[];
  healthCheck?: boolean | string;
  gracefulShutdown?: boolean;
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
}

export type ServerPlugin = (app: express.Application, config: ServerConfig) => void;