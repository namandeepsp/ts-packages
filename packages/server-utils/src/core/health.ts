import type { Application, Request, RequestHandler, Response } from 'express'
import type { HealthCheckConfig, ServerPlugin } from '../types'

export function createHealthCheck(
	config: HealthCheckConfig = {},
): RequestHandler {
	const { customChecks = [] } = config

	return async (req: Request, res: Response) => {
		try {
			const checks: Record<string, boolean> = {
				server: true,
				timestamp: Date.now() as any,
			}

			// Run custom health checks
			for (const check of customChecks) {
				try {
					checks[check.name] = await check.check()
				} catch (error) {
					checks[check.name] = false
				}
			}

			const isHealthy = Object.values(checks).every(
				(status) => status === true || typeof status === 'number',
			)

			res.status(isHealthy ? 200 : 503).json({
				status: isHealthy ? 'healthy' : 'unhealthy',
				checks,
			})
		} catch (error) {
			res.status(503).json({
				status: 'unhealthy',
				error: 'Health check failed',
			})
		}
	}
}

export function withHealthCheck(
	path = '/health',
	config: HealthCheckConfig = {},
): ServerPlugin {
	return (app: Application) => {
		app.get(path, createHealthCheck(config))
	}
}

// Convenience function for direct use
export function addHealthCheck(
	app: Application,
	path = '/health',
	config: HealthCheckConfig = {},
): void {
	app.get(path, createHealthCheck(config))
}
