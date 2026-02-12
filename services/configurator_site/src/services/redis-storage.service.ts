/**
 * Redis Storage Service
 * 
 * Handles storage of draft configurations in Redis with TTL support
 */

import type { Draft } from '../models/draft.model';
import { redisClientService } from './redis-client.service';
import { getTTLFromEnv } from '../config/ttl.config';
import { validateEnv } from '../config/env.config';
import { logger } from '../utils/logger.util';

const env = validateEnv();
const KEY_PREFIX = 'site-draft:';

class RedisStorageService {
  /**
   * Get Redis key for draft
   */
  getKey(draftId: string): string {
    return `${KEY_PREFIX}${draftId}`;
  }

  /**
   * Serialize draft to JSON
   */
  serializeDraft(draft: Draft): string {
    // Convert Date objects to ISO strings for JSON serialization
    const serializable = {
      ...draft,
      expiresAt: draft.expiresAt ? draft.expiresAt.toISOString() : undefined,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    };
    return JSON.stringify(serializable);
  }

  /**
   * Deserialize draft from JSON
   */
  deserializeDraft(serialized: string): Draft {
    const parsed = JSON.parse(serialized);
    return {
      ...parsed,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  }

  /**
   * Save a draft to Redis with TTL
   */
  async saveDraft(draft: Draft, ttlSeconds?: number): Promise<void> {
    try {
      const client = await redisClientService.getClient();
      const key = this.getKey(draft.id);
      const serialized = this.serializeDraft(draft);
      
      const ttl = ttlSeconds ?? Math.floor(getTTLFromEnv() / 1000);
      
      await client.setEx(key, ttl, serialized);
      logger.debug(`Saved draft ${draft.id} with TTL ${ttl}s`);
    } catch (error) {
      logger.error(`Failed to save draft ${draft.id}`, error as Error);
      throw error;
    }
  }

  /**
   * Get a draft by ID
   * Extends TTL if REDIS_TTL_EXTEND_ON_READ is enabled
   */
  async getDraft(id: string): Promise<Draft | undefined> {
    try {
      const client = await redisClientService.getClient();
      const key = this.getKey(id);
      const serialized = await client.get(key);
      
      if (!serialized) {
        return undefined; // Key doesn't exist or TTL expired
      }

      const draft = this.deserializeDraft(serialized);
      
      // Check if draft is expired (additional check)
      if (draft.expiresAt && draft.expiresAt < new Date()) {
        // Delete expired draft
        await client.del(key);
        return undefined;
      }

      // Extend TTL on read if enabled
      if (env.REDIS_TTL_EXTEND_ON_READ) {
        const ttl = Math.floor(getTTLFromEnv() / 1000);
        await client.expire(key, ttl);
        
        // Update expiresAt in draft object for consistency
        draft.expiresAt = new Date(Date.now() + getTTLFromEnv());
        logger.debug(`Extended TTL for draft ${id}`);
      }
      
      return draft;
    } catch (error) {
      logger.error(`Failed to get draft ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * Update a draft
   * Extends TTL on update
   */
  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft | null> {
    try {
      const draft = await this.getDraft(id);
      if (!draft) {
        return null;
      }

      const updatedDraft: Draft = {
        ...draft,
        ...updates,
        updatedAt: new Date(),
      };

      // Save with extended TTL
      await this.saveDraft(updatedDraft);
      
      return updatedDraft;
    } catch (error) {
      logger.error(`Failed to update draft ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete a draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    try {
      const client = await redisClientService.getClient();
      const key = this.getKey(id);
      const result = await client.del(key);
      
      logger.debug(`Deleted draft ${id}`);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to delete draft ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * Get all drafts (for debugging)
   * Note: This is expensive and should only be used for debugging
   */
  async getAllDrafts(): Promise<Draft[]> {
    try {
      const client = await redisClientService.getClient();
      const keys = await client.keys(`${KEY_PREFIX}*`);
      const drafts: Draft[] = [];

      for (const key of keys) {
        const serialized = await client.get(key);
        if (serialized) {
          try {
            const draft = this.deserializeDraft(serialized);
            drafts.push(draft);
          } catch (error) {
            logger.warn(`Failed to deserialize draft from key ${key}`, error as Error);
          }
        }
      }

      return drafts;
    } catch (error) {
      logger.error('Failed to get all drafts', error as Error);
      throw error;
    }
  }

  /**
   * Cleanup expired drafts
   * Note: Redis automatically removes expired keys, but this can be used for additional cleanup
   */
  async cleanupExpiredDrafts(): Promise<number> {
    try {
      const client = await redisClientService.getClient();
      const keys = await client.keys(`${KEY_PREFIX}*`);
      let cleaned = 0;

      for (const key of keys) {
        const serialized = await client.get(key);
        if (serialized) {
          try {
            const draft = this.deserializeDraft(serialized);
            if (draft.expiresAt && draft.expiresAt < new Date()) {
              await client.del(key);
              cleaned++;
            }
          } catch (error) {
            // Invalid draft, delete it
            await client.del(key);
            cleaned++;
          }
        }
      }

      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} expired drafts`);
      }

      return cleaned;
    } catch (error) {
      logger.error('Failed to cleanup expired drafts', error as Error);
      return 0;
    }
  }

  /**
   * Start automatic cleanup (optional, Redis handles TTL automatically)
   */
  startCleanup(intervalMinutes: number = 60): void {
    // Redis automatically removes expired keys, but we can run periodic cleanup
    // for additional validation
    setInterval(() => {
      this.cleanupExpiredDrafts().catch((error) => {
        logger.error('Cleanup interval error', error as Error);
      });
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    // Cleanup is handled by setInterval, which we can't easily track
    // In production, this would be managed differently
  }
}

// Singleton instance
export const redisStorageService = new RedisStorageService();

