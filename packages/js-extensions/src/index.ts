import { extendString } from './string-extensions';
import { extendArray } from './array-extensions';
import { extendObject } from './object-extensions';
import { extendNumber } from './number-extensions';
import './types';

export interface ExtensionOptions {
  string?: boolean;
  array?: boolean;
  object?: boolean;
  number?: boolean;
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
    number = true
  } = options;

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



export default {
  initExtensions,
  extendAll,
  extend
};