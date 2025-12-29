// Types for extension options and configurations
import { type PerformanceConfig } from '../core/index.js'

export interface ExtensionOptions {
	string?: boolean
	array?: boolean
	object?: boolean
	number?: boolean
	performance?: PerformanceConfig
}

export { PerformanceConfig }
