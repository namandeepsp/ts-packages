/**
 * Custom error class for cache operations
 */
export class CacheError extends Error {
  public readonly code: string;
  public readonly adapter?: string;
  public readonly originalError?: Error;

  constructor(message: string, code: string = 'CACHE_ERROR', adapter?: string, originalError?: Error) {
    super(message);
    this.name = 'CacheError';
    this.code = code;
    this.adapter = adapter;
    this.originalError = originalError;
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}
