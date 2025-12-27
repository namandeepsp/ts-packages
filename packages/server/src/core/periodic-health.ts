import type { HealthCheckService, PeriodicHealthCheckConfig } from '../types'

export class PeriodicHealthMonitor {
	private intervals: NodeJS.Timeout[] = []
	private config: PeriodicHealthCheckConfig
	private serviceName: string

	constructor(config: PeriodicHealthCheckConfig, serviceName: string) {
		this.config = config
		this.serviceName = serviceName
	}

	start(): void {
		if (!this.config.enabled || !this.config.services?.length) {
			return
		}

		const interval = this.config.interval || 30000

		this.config.services.forEach((service) => {
			const intervalId = setInterval(async () => {
				await this.checkServiceHealth(service)
			}, interval)

			this.intervals.push(intervalId)
		})

		console.log(
			`📊 ${this.serviceName}: Periodic health monitoring enabled (${interval}ms interval) for ${this.config.services.length} service(s)`,
		)
	}

	stop(): void {
		this.intervals.forEach((interval) => clearInterval(interval))
		this.intervals = []
		console.log(`🛑 ${this.serviceName}: Periodic health monitoring stopped`)
	}

	private async checkServiceHealth(
		service: HealthCheckService,
	): Promise<boolean> {
		try {
			const controller = new AbortController()
			const timeout = service.timeout || 5000
			const timeoutId = setTimeout(() => controller.abort(), timeout)

			const response = await fetch(service.url, {
				method: 'GET',
				signal: controller.signal,
				headers: {
					'User-Agent': `${this.serviceName}-health-monitor`,
				},
			})

			clearTimeout(timeoutId)

			if (response.ok) {
				console.log(`🟢 ${service.name} is healthy`)
				return true
			} else {
				console.log(`🔴 ${service.name} returned ${response.status}`)
				return false
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error'
			console.log(`🔴 ${service.name} health check failed: ${errorMessage}`)
			return false
		}
	}

	// Get current health status of all services
	async getHealthStatus(): Promise<Record<string, boolean>> {
		if (!this.config.services?.length) {
			return {}
		}

		const results: Record<string, boolean> = {}

		await Promise.all(
			this.config.services.map(async (service) => {
				results[service.name] = await this.checkServiceHealth(service)
			}),
		)

		return results
	}
}
