import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ServerConfig, ServerPlugin } from './types';

export function createServer(config: ServerConfig = {}): express.Application {
  const app = express();

  // Apply default middleware
  if (config.helmet !== false) {
    app.use(helmet());
  }

  if (config.cors !== false) {
    const corsOptions = typeof config.cors === 'object' ? config.cors : undefined;
    app.use(cors(corsOptions));
  }

  if (config.json !== false) {
    app.use(express.json());
  }

  // Apply custom middleware
  if (config.customMiddleware) {
    config.customMiddleware.forEach(middleware => {
      app.use(middleware);
    });
  }

  return app;
}

export function withPlugin(app: express.Application, plugin: ServerPlugin, config: ServerConfig = {}): express.Application {
  plugin(app, config);
  return app;
}

export function createServerWithPlugins(config: ServerConfig = {}, ...plugins: ServerPlugin[]): express.Application {
  const app = createServer(config);
  
  plugins.forEach(plugin => {
    plugin(app, config);
  });

  return app;
}