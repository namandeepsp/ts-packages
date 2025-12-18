// Configuration validation utilities (import PerformanceConfig from core/performance)
import type { PerformanceConfig } from '../core/performance'

export function validateConfig(
	config: Partial<PerformanceConfig>,
	defaultConfig: PerformanceConfig,
): PerformanceConfig {
	return { ...defaultConfig, ...config }
}

export function validatePerformanceSettings(
	settings: Partial<PerformanceConfig>,
): PerformanceConfig {
	const validated: PerformanceConfig = {
		enableCaching: settings.enableCaching ?? false,
		maxCacheSize: Math.max(1, settings.maxCacheSize ?? 100),
		enableValidation: settings.enableValidation ?? true,
	}
	return validated
}

export function mergeConfigs<T extends Record<string, any>>(
	base: T,
	override: Partial<T>,
): T {
	const result = { ...base }
	for (const key in override) {
		if (override[key] !== undefined) {
			result[key] = override[key]
		}
	}
	return result
}
