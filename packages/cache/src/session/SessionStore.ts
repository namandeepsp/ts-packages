import type { ICache } from '../core/interfaces';
import type { SessionData, SessionOptions } from '../types';
import { CacheError } from '../errors';

/**
 * Session store wrapper around cache adapters
 * Provides session management functionality
 */
export class SessionStore {
  private cache: ICache<SessionData>;
  private options: Required<SessionOptions>;

  constructor(cache: ICache<SessionData>, options: SessionOptions = {}) {
    this.cache = cache;
    this.options = {
      ttl: options.ttl ?? 3600, // 1 hour default
      serialize: options.serialize ?? ((data) => JSON.stringify(data)),
      deserialize: options.deserialize ?? ((data) => JSON.parse(data))
    };
  }

  /**
   * Create a new session
   */
  async create(
    sessionId: string,
    data: SessionData,
    ttl?: number
  ): Promise<void> {
    try {
      const ttlValue = ttl ?? this.options.ttl;
      await this.cache.set(sessionId, data, ttlValue);
    } catch (err) {
      throw new CacheError(
        `Failed to create session "${sessionId}"`,
        'SESSION_CREATE_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Get session data
   */
  async get(sessionId: string): Promise<SessionData | null> {
    try {
      return await this.cache.get(sessionId);
    } catch (err) {
      throw new CacheError(
        `Failed to get session "${sessionId}"`,
        'SESSION_GET_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Update/merge session data
   */
  async update(sessionId: string, data: Partial<SessionData>): Promise<void> {
    try {
      const current = await this.cache.get(sessionId);

      if (!current) {
        throw new CacheError(
          `Session "${sessionId}" not found`,
          'SESSION_NOT_FOUND'
        );
      }

      const merged = { ...current, ...data };
      await this.cache.set(sessionId, merged, this.options.ttl);
    } catch (err) {
      if (err instanceof CacheError) {
        throw err;
      }
      throw new CacheError(
        `Failed to update session "${sessionId}"`,
        'SESSION_UPDATE_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<boolean> {
    try {
      return await this.cache.delete(sessionId);
    } catch (err) {
      throw new CacheError(
        `Failed to delete session "${sessionId}"`,
        'SESSION_DELETE_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Check if session exists
   */
  async exists(sessionId: string): Promise<boolean> {
    try {
      return await this.cache.exists(sessionId);
    } catch (err) {
      throw new CacheError(
        `Failed to check session "${sessionId}" existence`,
        'SESSION_EXISTS_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Clear all sessions
   */
  async clear(): Promise<void> {
    try {
      await this.cache.clear();
    } catch (err) {
      throw new CacheError(
        'Failed to clear sessions',
        'SESSION_CLEAR_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Get all session keys (limited use - may be slow with large datasets)
   */
  async getMultiple(sessionIds: string[]): Promise<Record<string, SessionData | null>> {
    try {
      return await this.cache.getMultiple(sessionIds);
    } catch (err) {
      throw new CacheError(
        'Failed to get multiple sessions',
        'SESSION_GET_MULTIPLE_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Delete multiple sessions
   */
  async deleteMultiple(sessionIds: string[]): Promise<number> {
    try {
      return await this.cache.deleteMultiple(sessionIds);
    } catch (err) {
      throw new CacheError(
        'Failed to delete multiple sessions',
        'SESSION_DELETE_MULTIPLE_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Extend session expiry
   */
  async extend(sessionId: string, ttl?: number): Promise<void> {
    try {
      const current = await this.cache.get(sessionId);

      if (!current) {
        throw new CacheError(
          `Session "${sessionId}" not found`,
          'SESSION_NOT_FOUND'
        );
      }

      const ttlValue = ttl ?? this.options.ttl;
      await this.cache.set(sessionId, current, ttlValue);
    } catch (err) {
      if (err instanceof CacheError) {
        throw err;
      }
      throw new CacheError(
        `Failed to extend session "${sessionId}"`,
        'SESSION_EXTEND_ERROR',
        'session',
        err as Error
      );
    }
  }

  /**
   * Get session data and extend expiry in one operation
   */
  async getAndExtend(sessionId: string, ttl?: number): Promise<SessionData | null> {
    try {
      const data = await this.get(sessionId);

      if (data) {
        await this.extend(sessionId, ttl);
      }

      return data;
    } catch (err) {
      if (err instanceof CacheError) {
        throw err;
      }
      throw new CacheError(
        `Failed to get and extend session "${sessionId}"`,
        'SESSION_GET_EXTEND_ERROR',
        'session',
        err as Error
      );
    }
  }
}
