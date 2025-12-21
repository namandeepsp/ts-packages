import crypto from 'crypto'

import {
	type CacheConfig,
	CacheFactory,
	type ICache,
	type SessionData,
	SessionStore,
} from '@naman_deep_singh/cache'
import express, { json, raw } from 'express'

import { PeriodicHealthMonitor } from './periodic-health'
import { createGracefulShutdown } from './shutdown'

import type { Server } from 'http'
import type { Application, RequestHandler } from 'express'
import { useSession } from '../middleware'
import type { ServerConfig, SocketIOConfig, SocketInstance } from '../types'

export interface GrpcService {
	service: Record<string, unknown>
	implementation: Record<string, (...args: unknown[]) => unknown>
}

export interface RpcMethod {
	[key: string]: (
		params: unknown[],
		callback: (error: Error | null, result?: unknown) => void,
	) => void
}

export interface WebhookConfig {
	path: string
	secret?: string
	handler: (
		payload: Record<string, unknown>,
		headers: Record<string, string | string[]>,
	) => void | Promise<void>
}

export interface GrpcServerInstance {
	start(): void
	forceShutdown(): void
	addService(service: unknown, implementation: unknown): void
	bindAsync(address: string, credentials: unknown, callback: () => void): void
}

export interface ServerInstanceConfig
	extends Required<Omit<ServerConfig, 'socketIO' | 'name' | 'version'>> {
	name: string
	version: string
	startTime: Date
	socketIO?: SocketIOConfig
}

export interface ServerInstance {
	app: Application
	server?: Server
	config: ServerInstanceConfig
	start(): Promise<ServerInstance>
	stop(): Promise<void>
	getInfo(): ServerInfo

	// Multi-protocol support
	addGrpcService(
		service: Record<string, unknown>,
		implementation: Record<string, (...args: unknown[]) => unknown>,
		port?: number,
	): void
	addRpcMethods(methods: RpcMethod, path?: string): void
	addWebhook(config: WebhookConfig): void
	addSocketIO(config?: SocketIOConfig): unknown
}

export interface ServerInfo {
	name: string
	version: string
	port: number
	uptime: number
	status: 'starting' | 'running' | 'stopping' | 'stopped'
	startTime: Date
}

export class ExpressServer implements ServerInstance {
	public app: Application
	public server?: Server
	public config: ServerInstanceConfig
	public cache?: ICache<unknown>
	public sessionStore?: SessionStore | undefined
	private status: 'starting' | 'running' | 'stopping' | 'stopped' = 'stopped'
	private grpcServices: GrpcService[] = []
	private grpcServer?: GrpcServerInstance
	private rpcMethods: RpcMethod = {}
	private socketIO?: { close(): void }
	private healthMonitor?: PeriodicHealthMonitor

	constructor(
		name = 'Express Server',
		version = '1.0.0',
		config: ServerConfig = {},
	) {
		this.app = express()
		this.config = {
			name,
			version,
			startTime: new Date(),
			port: config.port || 3000,
			cors: config.cors ?? true,
			helmet: config.helmet ?? true,
			json: config.json ?? true,
			cookieParser: config.cookieParser ?? false,
			customMiddleware: config.customMiddleware || [],
			healthCheck: config.healthCheck ?? true,
			gracefulShutdown: config.gracefulShutdown ?? true,
			socketIO: config.socketIO,
			periodicHealthCheck: config.periodicHealthCheck || { enabled: false },
			cache: config.cache || { enabled: false },
			session: config.session || { enabled: false },
		}

		// Initialize locals for cache/session
		this.app.locals.cache = undefined
		this.app.locals.sessionStore = undefined
		this.app.locals.cacheDefaultTTL = config.cache?.defaultTTL

		// Apply middleware based on configuration
		this.setupMiddleware()

		// Setup periodic health monitoring
		this.setupPeriodicHealthMonitoring()
	}

	private setupMiddleware(): void {
		// Apply CORS if enabled
		if (this.config.cors) {
			try {
				const cors = require('cors')
				const corsOptions =
					typeof this.config.cors === 'object' ? this.config.cors : undefined
				this.app.use(cors(corsOptions))
			} catch (_error) {
				console.warn(
					`${this.config.name}: CORS middleware not available. Install cors package.`,
				)
			}
		}

		// Apply Helmet if enabled
		if (this.config.helmet) {
			try {
				const helmet = require('helmet')
				this.app.use(helmet())
			} catch (_error) {
				console.warn(
					`${this.config.name}: Helmet middleware not available. Install helmet package.`,
				)
			}
		}

		// Apply JSON parser if enabled
		if (this.config.json) {
			this.app.use(json())
		}

		// Apply cookie parser if enabled
		if (this.config.cookieParser) {
			try {
				const cookieParser = require('cookie-parser')
				this.app.use(cookieParser())
			} catch (_error) {
				console.warn(
					`${this.config.name}: Cookie parser middleware not available. Install cookie-parser package.`,
				)
			}
		}

		// Apply custom middleware
		if (
			this.config.customMiddleware &&
			this.config.customMiddleware.length > 0
		) {
			this.config.customMiddleware.forEach((middleware) => {
				this.app.use(middleware)
			})
		}

		// Add health check if enabled
		if (this.config.healthCheck) {
			const healthPath =
				typeof this.config.healthCheck === 'string'
					? this.config.healthCheck
					: '/health'
			this.app.get(healthPath, async (req, res) => {
				const base = {
					status: 'healthy',
					service: this.config.name,
					version: this.config.version,
					uptime: Date.now() - this.config.startTime.getTime(),
					timestamp: new Date().toISOString(),
				} as Record<string, unknown>

				// If cache is enabled, include its health
				const cache = req.app.locals.cache
				if (cache && typeof (cache as any).isAlive === 'function') {
					try {
						base.cache = await (cache as any).isAlive()
					} catch (e) {
						base.cache = {
							isAlive: false,
							adapter: 'unknown',
							timestamp: new Date(),
							error: (e as Error).message,
						}
					}
				}

				res.status(200).json(base)
			})
		}
	}

	private async setupCacheAndSession(
		config: ServerConfig,
		serverName: string,
	): Promise<void> {
		try {
			// Initialize cache if enabled
			if (config.cache && config.cache.enabled) {
				try {
					const provided = config.cache?.options as
						| Record<string, unknown>
						| undefined
					let cacheConfig: Record<string, unknown> | undefined =
						provided && typeof provided === 'object' ? provided : undefined
					if (!cacheConfig) {
						cacheConfig = { adapter: config.cache.adapter || 'memory' }
					}

					console.log(
						`🔄 [${serverName}] Initializing cache adapter: ${config.cache.adapter || 'memory'}...`,
					)

					// Use createWithFallback to prefer primary and fall back to memory when configured
					const cfg = {
						...((cacheConfig as Record<string, any>) || {}),
						ttl:
							(cacheConfig as Record<string, any>)?.ttl ??
							config.cache?.defaultTTL,
					} as unknown as CacheConfig
					const cache = await CacheFactory.createWithFallback<unknown>(cfg)

					this.app.locals.cache = cache as unknown
					this.cache = cache as ICache<unknown>
					this.app.locals.cacheDefaultTTL = config.cache?.defaultTTL

					// attach per-request helper middleware
					this.app.use((req, _res, next) => {
						req.cache = cache as unknown
						next()
					})

					console.log(
						`✅ [${serverName}] Cache initialized successfully (adapter: ${cacheConfig.adapter || 'memory'})`,
					)
				} catch (err) {
					console.error(
						`❌ [${serverName}] Failed to initialize cache (fallback to memory if enabled):`,
						err instanceof Error ? err.message : err,
					)
					// Cache initialization error is critical but we continue to allow graceful fallback
				}
			}

			// Initialize session if enabled
			if (config.session && config.session.enabled) {
				const cookieName =
					config.session.cookieName ||
					`${serverName.replace(/\s+/g, '_').toLowerCase()}.sid`
				const ttl = config.session.ttl ?? 3600
				let cache = this.app.locals.cache as ICache<unknown> | undefined

				if (!cache) {
					// fallback to in-memory cache for session store
					try {
						cache = CacheFactory.create({ adapter: 'memory' })
						this.app.locals.cache = cache
						this.cache = cache as ICache<unknown>
						console.log(
							`📝 [${serverName}] Session store using in-memory cache`,
						)
					} catch (e) {
						console.error(
							`❌ [${serverName}] Failed to create in-memory cache for sessions:`,
							e instanceof Error ? e.message : e,
						)
					}
				} else {
					console.log(
						`📝 [${serverName}] Session store initialized with configured cache adapter`,
					)
				}

				if (!cache) {
					console.error(
						`❌ [${serverName}] CRITICAL: Session enabled but no cache available to store sessions. Session functionality will be unavailable.`,
					)
				} else {
					const store = new SessionStore(cache as ICache<SessionData>, { ttl })
					this.app.locals.sessionStore = store
					this.app.locals.sessionCookieName = cookieName
					this.sessionStore = store

					// attach session middleware globally so req.sessionStore is available
					try {
						this.app.use(useSession(cookieName))
						console.log(
							`✅ [${serverName}] Session middleware enabled (cookie: ${cookieName}, TTL: ${ttl}s)`,
						)
					} catch (err) {
						console.error(
							`❌ [${serverName}] Session middleware not available:`,
							err instanceof Error ? err.message : err,
						)
					}
				}
			}
		} catch (err) {
			console.error(
				`❌ [${serverName}] Error during cache/session setup:`,
				err instanceof Error ? err.message : err,
			)
		}
	}

	private setupPeriodicHealthMonitoring(): void {
		if (this.config.periodicHealthCheck?.enabled) {
			this.healthMonitor = new PeriodicHealthMonitor(
				this.config.periodicHealthCheck,
				this.config.name,
			)
		}
	}

	async start(): Promise<ServerInstance> {
		this.status = 'starting'

		// Initialize cache and session before starting the server
		await this.setupCacheAndSession(this.config, this.config.name)

		return new Promise((resolve, reject) => {
			try {
				this.server = this.app.listen(this.config.port, () => {
					this.status = 'running'
					console.log(
						`🚀 ${this.config.name} v${this.config.version} running on http://localhost:${this.config.port}`,
					)

					if (this.config.gracefulShutdown) {
						createGracefulShutdown(this.server!, {
							onShutdown: async () => {
								this.status = 'stopping'
								// Stop health monitoring during shutdown
								if (this.healthMonitor) {
									this.healthMonitor.stop()
								}
								// Close cache and session store if present
								try {
									const cache = this.app.locals.cache as
										| ICache<unknown>
										| undefined
									if (cache && typeof cache.close === 'function') {
										await cache.close()
									}
								} catch (e) {
									console.warn(`${this.config.name}: Error closing cache`, e)
								}

								try {
									const store = this.app.locals.sessionStore as
										| SessionStore
										| undefined
									if (store && typeof (store as any).close === 'function') {
										await (store as any).close()
									}
								} catch (_e) {
									// SessionStore may not have close; ignore
								}
							},
						})
					}

					// Start periodic health monitoring after server is running
					if (this.healthMonitor) {
						this.healthMonitor.start()
					}

					resolve(this)
				})

				this.server.on('error', reject)
			} catch (error: unknown) {
				this.status = 'stopped'
				reject(error)
			}
		})
	}

	async stop(): Promise<void> {
		this.status = 'stopping'

		// Stop gRPC server if running
		if (this.grpcServer) {
			this.grpcServer.forceShutdown()
		}

		// Stop periodic health monitoring
		if (this.healthMonitor) {
			this.healthMonitor.stop()
		}

		// Stop Socket.IO server if running
		if (this.socketIO) {
			this.socketIO.close()
		}

		if (!this.server) {
			this.status = 'stopped'
			return
		}

		return new Promise((resolve) => {
			this.server!.close(() => {
				this.status = 'stopped'
				console.log(`👋 ${this.config.name} stopped`)
				resolve()
			})
		})
	}

	getInfo(): ServerInfo {
		return {
			name: this.config.name,
			version: this.config.version,
			port: this.config.port,
			uptime: Date.now() - this.config.startTime.getTime(),
			status: this.status,
			startTime: this.config.startTime,
		}
	}

	addGrpcService(
		service: Record<string, unknown>,
		implementation: Record<string, (...args: unknown[]) => unknown>,
		port = 50051,
	): void {
		this.grpcServices.push({ service, implementation })

		// Lazy load gRPC to avoid dependency issues
		if (!this.grpcServer) {
			try {
				const grpc = require('@grpc/grpc-js') as {
					Server: new () => {
						start(): void
						forceShutdown(): void
						addService(service: unknown, implementation: unknown): void
						bindAsync(
							address: string,
							credentials: unknown,
							callback: () => void,
						): void
					}
					ServerCredentials: { createInsecure(): unknown }
				}
				this.grpcServer = new grpc.Server()

				// Add all services
				this.grpcServices.forEach(({ service, implementation }) => {
					this.grpcServer!.addService(service, implementation)
				})

				this.grpcServer.bindAsync(
					`0.0.0.0:${port}`,
					grpc.ServerCredentials.createInsecure(),
					() => {
						this.grpcServer!.start()
						console.log(
							`🔗 ${this.config.name} gRPC server running on port ${port}`,
						)
					},
				)
			} catch (_error: unknown) {
				console.warn(
					`${this.config.name}: gRPC not available. Install @grpc/grpc-js to use gRPC features.`,
				)
			}
		}
	}

	addRpcMethods(methods: RpcMethod, path = '/rpc'): void {
		Object.assign(this.rpcMethods, methods)

		try {
			const jayson = require('jayson') as {
				server: (methods: RpcMethod) => {
					middleware(): RequestHandler
				}
			}
			const rpcServer = jayson.server(this.rpcMethods)
			this.app.use(path, rpcServer.middleware())
			console.log(`📡 ${this.config.name} JSON-RPC server mounted on ${path}`)
		} catch (_error: unknown) {
			console.warn(
				`${this.config.name}: JSON-RPC not available. Install jayson to use RPC features.`,
			)
		}
	}

	addWebhook(config: WebhookConfig): void {
		this.app.post(
			config.path,
			raw({ type: 'application/json' }),
			async (req, res) => {
				try {
					// Verify signature if secret provided
					if (config.secret) {
						const signature =
							req.headers['x-hub-signature-256'] ||
							req.headers['x-signature-256']
						if (signature) {
							const expectedSignature = crypto
								.createHmac('sha256', config.secret)
								.update(req.body)
								.digest('hex')

							const providedSignature = Array.isArray(signature)
								? signature[0]
								: signature
							if (!providedSignature.includes(expectedSignature)) {
								return res.status(401).json({ error: 'Invalid signature' })
							}
						}
					}

					// Parse JSON payload
					const payload = JSON.parse(req.body.toString())

					// Call handler
					await config.handler(
						payload,
						req.headers as Record<string, string | string[]>,
					)

					res.status(200).json({ success: true })
				} catch (error: unknown) {
					console.error('Webhook error:', error)
					res.status(500).json({ error: 'Webhook processing failed' })
				}
			},
		)

		console.log(
			`🪝 ${this.config.name} webhook registered at ${config.path}${config.secret ? ' (with signature verification)' : ''}`,
		)
	}

	addSocketIO(config: SocketIOConfig = {}): unknown {
		if (!this.server) {
			throw new Error(
				`${this.config.name}: Server must be started before adding Socket.IO`,
			)
		}

		try {
			const { Server } = require('socket.io') as {
				Server: new (
					server: Server,
					options?: {
						cors?: {
							origin?: string | string[] | boolean
							methods?: string[]
							credentials?: boolean
						}
						path?: string
					},
				) => {
					on: (event: string, handler: (socket: unknown) => void) => void
					close: () => void
				}
			}

			// Configure CORS
			const corsConfig =
				config.cors === true
					? { origin: '*', methods: ['GET', 'POST'] }
					: config.cors || undefined

			// Create Socket.IO server
			const io = new Server(this.server, {
				cors: config.cors ? corsConfig : undefined,
				path: config.path || '/socket.io',
			})

			// Store reference for cleanup
			this.socketIO = io

			// Handle connections
			io.on('connection', (socket: unknown) => {
				const typedSocket = socket as SocketInstance
				console.log(
					`🔌 ${this.config.name}: Socket connected [${typedSocket.id}]`,
				)

				// Call user-defined connection handler
				if (config.onConnection) {
					config.onConnection(socket)
				}

				// Handle disconnection
				typedSocket.on('disconnect', (reason) => {
					console.log(
						`🔌 ${this.config.name}: Socket disconnected [${typedSocket.id}] - ${reason}`,
					)

					// Call user-defined disconnection handler
					if (config.onDisconnection) {
						config.onDisconnection(socket, reason as string)
					}
				})
			})

			console.log(
				`🔌 ${this.config.name} Socket.IO server attached${config.path ? ` at ${config.path}` : ''}${config.cors ? ' (CORS enabled)' : ''}`,
			)
			return io
		} catch (_error: unknown) {
			console.warn(
				`${this.config.name}: Socket.IO not available. Install socket.io to use WebSocket features.`,
			)
			return null
		}
	}
}

export function createServer(
	name?: string,
	version?: string,
	config?: ServerConfig,
): ServerInstance {
	return new ExpressServer(name, version, config)
}
