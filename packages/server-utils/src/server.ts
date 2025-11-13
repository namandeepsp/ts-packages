import express from 'express';
import { Server } from 'http';
import { ServerConfig, SocketIOConfig, SocketInstance } from './types';
import { createGracefulShutdown } from './shutdown';
import crypto from 'crypto';

export interface GrpcService {
  service: Record<string, unknown>;
  implementation: Record<string, (...args: unknown[]) => unknown>;
}

export interface RpcMethod {
  [key: string]: (params: unknown[], callback: (error: Error | null, result?: unknown) => void) => void;
}

export interface WebhookConfig {
  path: string;
  secret?: string;
  handler: (payload: Record<string, unknown>, headers: Record<string, string | string[]>) => void | Promise<void>;
}

export interface GrpcServerInstance {
  start(): void;
  forceShutdown(): void;
  addService(service: unknown, implementation: unknown): void;
  bindAsync(address: string, credentials: unknown, callback: () => void): void;
}



export interface ServerInstanceConfig extends Required<Omit<ServerConfig, 'socketIO' | 'name' | 'version'>> {
  name: string;
  version: string;
  startTime: Date;
  socketIO?: SocketIOConfig;
}

export interface ServerInstance {
  app: express.Application;
  server?: Server;
  config: ServerInstanceConfig;
  start(): Promise<ServerInstance>;
  stop(): Promise<void>;
  getInfo(): ServerInfo;

  // Multi-protocol support
  addGrpcService(service: Record<string, unknown>, implementation: Record<string, (...args: unknown[]) => unknown>, port?: number): void;
  addRpcMethods(methods: RpcMethod, path?: string): void;
  addWebhook(config: WebhookConfig): void;
  addSocketIO(config?: SocketIOConfig): unknown;
}

export interface ServerInfo {
  name: string;
  version: string;
  port: number;
  uptime: number;
  status: 'starting' | 'running' | 'stopping' | 'stopped';
  startTime: Date;
}

export class ExpressServer implements ServerInstance {
  public app: express.Application;
  public server?: Server;
  public config: ServerInstanceConfig;
  private status: 'starting' | 'running' | 'stopping' | 'stopped' = 'stopped';
  private grpcServices: GrpcService[] = [];
  private grpcServer?: GrpcServerInstance;
  private rpcMethods: RpcMethod = {};
  private socketIO?: { close(): void };

  constructor(
    name: string = 'Express Server',
    version: string = '1.0.0',
    config: ServerConfig = {}
  ) {
    this.app = express();
    this.config = {
      name,
      version,
      startTime: new Date(),
      port: config.port || 3000,
      cors: config.cors ?? true,
      helmet: config.helmet ?? true,
      json: config.json ?? true,
      customMiddleware: config.customMiddleware || [],
      healthCheck: config.healthCheck ?? true,
      gracefulShutdown: config.gracefulShutdown ?? true,
      socketIO: config.socketIO
    };

    // Apply middleware based on configuration
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Apply CORS if enabled
    if (this.config.cors) {
      try {
        const cors = require('cors');
        const corsOptions = typeof this.config.cors === 'object' ? this.config.cors : undefined;
        this.app.use(cors(corsOptions));
      } catch (error) {
        console.warn(`${this.config.name}: CORS middleware not available. Install cors package.`);
      }
    }

    // Apply Helmet if enabled
    if (this.config.helmet) {
      try {
        const helmet = require('helmet');
        this.app.use(helmet());
      } catch (error) {
        console.warn(`${this.config.name}: Helmet middleware not available. Install helmet package.`);
      }
    }

    // Apply JSON parser if enabled
    if (this.config.json) {
      this.app.use(express.json());
    }

    // Apply custom middleware
    if (this.config.customMiddleware && this.config.customMiddleware.length > 0) {
      this.config.customMiddleware.forEach(middleware => {
        this.app.use(middleware);
      });
    }

    // Add health check if enabled
    if (this.config.healthCheck) {
      const healthPath = typeof this.config.healthCheck === 'string' ? this.config.healthCheck : '/health';
      this.app.get(healthPath, (req, res) => {
        res.status(200).json({
          status: 'healthy',
          service: this.config.name,
          version: this.config.version,
          uptime: Date.now() - this.config.startTime.getTime(),
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  async start(): Promise<ServerInstance> {
    this.status = 'starting';

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          this.status = 'running';
          console.log(`🚀 ${this.config.name} v${this.config.version} running on http://localhost:${this.config.port}`);

          if (this.config.gracefulShutdown) {
            createGracefulShutdown(this.server!, {
              onShutdown: async () => {
                this.status = 'stopping';
              }
            });
          }

          resolve(this);
        });

        this.server.on('error', reject);
      } catch (error: unknown) {
        this.status = 'stopped';
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    this.status = 'stopping';

    // Stop gRPC server if running
    if (this.grpcServer) {
      this.grpcServer.forceShutdown();
    }

    // Stop Socket.IO server if running
    if (this.socketIO) {
      this.socketIO.close();
    }

    if (!this.server) {
      this.status = 'stopped';
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.status = 'stopped';
        console.log(`👋 ${this.config.name} stopped`);
        resolve();
      });
    });
  }

  getInfo(): ServerInfo {
    return {
      name: this.config.name,
      version: this.config.version,
      port: this.config.port,
      uptime: Date.now() - this.config.startTime.getTime(),
      status: this.status,
      startTime: this.config.startTime
    };
  }

  addGrpcService(service: Record<string, unknown>, implementation: Record<string, (...args: unknown[]) => unknown>, port: number = 50051): void {
    this.grpcServices.push({ service, implementation });

    // Lazy load gRPC to avoid dependency issues
    if (!this.grpcServer) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const grpc = require('@grpc/grpc-js') as {
          Server: new () => {
            start(): void;
            forceShutdown(): void;
            addService(service: unknown, implementation: unknown): void;
            bindAsync(address: string, credentials: unknown, callback: () => void): void;
          };
          ServerCredentials: { createInsecure(): unknown };
        };
        this.grpcServer = new grpc.Server();

        // Add all services
        this.grpcServices.forEach(({ service, implementation }) => {
          this.grpcServer!.addService(service, implementation);
        });

        this.grpcServer.bindAsync(
          `0.0.0.0:${port}`,
          grpc.ServerCredentials.createInsecure(),
          () => {
            this.grpcServer!.start();
            console.log(`🔗 ${this.config.name} gRPC server running on port ${port}`);
          }
        );
      } catch (error: unknown) {
        console.warn(`${this.config.name}: gRPC not available. Install @grpc/grpc-js to use gRPC features.`);
      }
    }
  }

  addRpcMethods(methods: RpcMethod, path: string = '/rpc'): void {
    Object.assign(this.rpcMethods, methods);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jayson = require('jayson') as {
        server: (methods: RpcMethod) => {
          middleware(): express.RequestHandler;
        };
      };
      const rpcServer = jayson.server(this.rpcMethods);
      this.app.use(path, rpcServer.middleware());
      console.log(`📡 ${this.config.name} JSON-RPC server mounted on ${path}`);
    } catch (error: unknown) {
      console.warn(`${this.config.name}: JSON-RPC not available. Install jayson to use RPC features.`);
    }
  }

  addWebhook(config: WebhookConfig): void {
    this.app.post(config.path, express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        // Verify signature if secret provided
        if (config.secret) {
          const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature-256'];
          if (signature) {
            const expectedSignature = crypto
              .createHmac('sha256', config.secret)
              .update(req.body)
              .digest('hex');

            const providedSignature = Array.isArray(signature) ? signature[0] : signature;
            if (!providedSignature.includes(expectedSignature)) {
              return res.status(401).json({ error: 'Invalid signature' });
            }
          }
        }

        // Parse JSON payload
        const payload = JSON.parse(req.body.toString());

        // Call handler
        await config.handler(payload, req.headers as Record<string, string | string[]>);

        res.status(200).json({ success: true });
      } catch (error: unknown) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    });

    console.log(`🪝 ${this.config.name} webhook registered at ${config.path}${config.secret ? ' (with signature verification)' : ''}`);
  }

  addSocketIO(config: SocketIOConfig = {}): unknown {
    if (!this.server) {
      throw new Error(`${this.config.name}: Server must be started before adding Socket.IO`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Server } = require('socket.io') as {
        Server: new (server: Server, options?: {
          cors?: {
            origin?: string | string[] | boolean;
            methods?: string[];
            credentials?: boolean;
          };
          path?: string;
        }) => {
          on: (event: string, handler: (socket: unknown) => void) => void;
          close: () => void;
        };
      };

      // Configure CORS
      const corsConfig = config.cors === true 
        ? { origin: '*', methods: ['GET', 'POST'] }
        : config.cors || undefined;

      // Create Socket.IO server
      const io = new Server(this.server, {
        cors: config.cors ? corsConfig : undefined,
        path: config.path || '/socket.io'
      });

      // Store reference for cleanup
      this.socketIO = io;

      // Handle connections
      io.on('connection', (socket: unknown) => {
        const typedSocket = socket as SocketInstance;
        console.log(`🔌 ${this.config.name}: Socket connected [${typedSocket.id}]`);

        // Call user-defined connection handler
        if (config.onConnection) {
          config.onConnection(socket);
        }

        // Handle disconnection
        typedSocket.on('disconnect', (reason) => {
          console.log(`🔌 ${this.config.name}: Socket disconnected [${typedSocket.id}] - ${reason}`);

          // Call user-defined disconnection handler
          if (config.onDisconnection) {
            config.onDisconnection(socket, reason as string);
          }
        });
      });

      console.log(`🔌 ${this.config.name} Socket.IO server attached${config.path ? ` at ${config.path}` : ''}${config.cors ? ' (CORS enabled)' : ''}`);
      return io;
    } catch (error: unknown) {
      console.warn(`${this.config.name}: Socket.IO not available. Install socket.io to use WebSocket features.`);
      return null;
    }
  }
}

export function createServer(
  name?: string,
  version?: string,
  config?: ServerConfig
): ServerInstance {
  return new ExpressServer(name, version, config);
}