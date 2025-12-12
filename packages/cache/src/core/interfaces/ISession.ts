import type { SessionData } from '../../types';

/**
 * Session store interface
 */
export interface ISession {
  /**
   * Get session data
   */
  get(sessionId: string): Promise<SessionData | null>;

  /**
   * Set session data
   */
  set(sessionId: string, data: SessionData, ttl?: number): Promise<void>;

  /**
   * Delete session
   */
  delete(sessionId: string): Promise<boolean>;

  /**
   * Check if session exists
   */
  exists(sessionId: string): Promise<boolean>;

  /**
   * Clear all sessions
   */
  clear(): Promise<void>;

  /**
   * Update/merge session data
   */
  update(sessionId: string, data: Partial<SessionData>): Promise<void>;
}
