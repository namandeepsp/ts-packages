import { Server } from 'http';
import { GracefulShutdownConfig, ServerPlugin } from './types';

export function createGracefulShutdown(server: Server, config: GracefulShutdownConfig = {}): void {
  const { timeout = 10000, onShutdown } = config;

  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down gracefully...`);
    
    const shutdownTimer = setTimeout(() => {
      console.log('⏰ Shutdown timeout reached, forcing exit');
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
        console.log('👋 Server closed. Exiting now.');
        process.exit(0);
      });
    } catch (error) {
      clearTimeout(shutdownTimer);
      console.error('❌ Error during shutdown:', error);
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
  app: any, 
  port: number, 
  shutdownConfig: GracefulShutdownConfig = {}
): Server {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  // Apply graceful shutdown from stored config or provided config
  const config = app.__gracefulShutdownConfig || shutdownConfig;
  createGracefulShutdown(server, config);

  return server;
}