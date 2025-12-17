// Import types first
import '../types/global-augmentations';

// Import extension modules
import { extendString } from './string';
import { extendArray } from './array';
import { extendObject } from './object';
import { extendNumber } from './number';



// Import core utilities
import { withCache, setPerformanceConfig, getPerformanceConfig } from './core/performance';

// Re-export types
import { ExtensionOptions, PerformanceConfig } from './types/extension-types';
export { ExtensionOptions, PerformanceConfig };

// Export withCache for use in extensions
export { withCache };

// Import initialization functions
import { initExtensions, extendAll } from './init/initializer';

/**
 * Initialize JavaScript prototype extensions
 * @param options - Configure which extensions to enable (default: all enabled)
 */
export function initializeExtensions(options: ExtensionOptions = {}): void {
  initExtensions(options);
}

/**
 * Initialize all extensions (convenience function)
 */
export { extendAll };

/**
 * Initialize only specific extensions
 */
export const extend = {
  string: extendString,
  array: extendArray,
  object: extendObject,
  number: extendNumber
};

// Export performance utilities
export { setPerformanceConfig, getPerformanceConfig };



// Default export
export default {
  initializeExtensions,
  extendAll,
  extend,
  setPerformanceConfig,
  getPerformanceConfig
};
