import { extendString } from './string-extensions';
import { extendArray } from './array-extensions';
import { extendObject } from './object-extensions';
import { extendNumber } from './number-extensions';
import { setPerformanceConfig, getPerformanceConfig, type PerformanceConfig, withCache } from './performance';
import './types';

// Export withCache for use in extensions
export { withCache };

export interface ExtensionOptions {
  string?: boolean;
  array?: boolean;
  object?: boolean;
  number?: boolean;
  performance?: PerformanceConfig;
}

/**
 * Initialize JavaScript prototype extensions
 * @param options - Configure which extensions to enable (default: all enabled)
 */
export function initExtensions(options: ExtensionOptions = {}): void {
  const {
    string = true,
    array = true,
    object = true,
    number = true,
    performance
  } = options;

  if (performance) {
    setPerformanceConfig(performance);
  }

  if (string) extendString();
  if (array) extendArray();
  if (object) extendObject();
  if (number) extendNumber();
}

/**
 * Initialize all extensions (convenience function)
 */
export function extendAll(): void {
  initExtensions();
}

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
export { setPerformanceConfig, getPerformanceConfig, type PerformanceConfig };

export default {
  initExtensions,
  extendAll,
  extend,
  setPerformanceConfig,
  getPerformanceConfig
};