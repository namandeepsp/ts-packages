import { Server } from 'http';

import { GracefulShutdownConfig, ServerPlugin } from '../types';

export function createGracefulShutdown(server: Server, config: GracefulShutdownConfig = {}): void {
  const { timeout = 10000, onShutdown, serverName, serverVersion } = config;
  const nameVersion = serverName && serverVersion ? `${serverName} v${serverVersion}` : 'Server';

  const shutdown = async (signal: string) => {
    console.log(`🛑 ${nameVersion} received ${signal}, shutting down gracefully...`);

    const shutdownTimer = setTimeout(() => {
      console.log(`⏰ ${nameVersion} shutdown timeout reached, forcing exit`);
      process.exit(1);
    }, timeout);

    try {
      // Run custom shutdown logic
      if (onShutdown) {
        await onShutdown();
      }

      // Close server
      server.close(() => {
        clearTimeout(shutdownTimer);
        console.log(`👋 ${nameVersion} closed. Exiting now.`);
        process.exit(0);
      });
    } catch (error) {
      clearTimeout(shutdownTimer);
      console.error(`❌ ${nameVersion} error during shutdown:`, error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export function withGracefulShutdown(config: GracefulShutdownConfig = {}): ServerPlugin {
  return (app, serverConfig) => {
    // This plugin needs to be applied after server.listen()
    // Store config for later use
    (app as any).__gracefulShutdownConfig = config;
  };
}


export function startServerWithShutdown(
  app: import('express').Application,
  port: number,
  shutdownConfig: GracefulShutdownConfig = {},
  serverName?: string,
  serverVersion?: string
): Server {
  const server = app.listen(port, () => {
    const nameVersion = serverName && serverVersion ? `${serverName} v${serverVersion}` : 'Server';
    console.log(`🚀 ${nameVersion} running on http://localhost:${port}`);
  });


  // Apply graceful shutdown from stored config or provided config
  const config = (app as any).__gracefulShutdownConfig || shutdownConfig;
  const enhancedConfig = {
    ...config,
    serverName,
    serverVersion
  };
  createGracefulShutdown(server, enhancedConfig);

  return server;
}