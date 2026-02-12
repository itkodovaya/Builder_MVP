/**
 * Storage Service
 * 
 * Handles in-memory storage of draft configurations (fallback)
 */

import type { Draft } from '../models/draft.model';
import { logger } from '../utils/logger.util';
import { validateEnv } from '../config/env.config';

const env = validateEnv();

class StorageService {
  private drafts: Map<string, Draft> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Save a draft to storage
   */
  async saveDraft(draft: Draft): Promise<void> {
    this.drafts.set(draft.id, draft);
    logger.debug(`Draft ${draft.id} saved to memory storage (total drafts: ${this.drafts.size})`);
  }

  /**
   * Get a draft by ID
   */
  async getDraft(id: string): Promise<Draft | undefined> {
    const draft = this.drafts.get(id);
    
    // Check if draft is expired
    if (draft && draft.expiresAt && draft.expiresAt < new Date()) {
      await this.deleteDraft(id);
      return undefined;
    }
    
    logger.debug(`Getting draft ${id}: ${draft ? 'found' : 'not found'}`);
    return draft;
  }

  /**
   * Update a draft
   */
  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft | null> {
    const draft = await this.getDraft(id);
    if (!draft) {
      return null;
    }

    const updatedDraft: Draft = {
      ...draft,
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveDraft(updatedDraft);
    return updatedDraft;
  }

  /**
   * Delete a draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    const deleted = this.drafts.delete(id);
    if (deleted) {
      logger.debug(`Draft ${id} deleted from memory storage`);
    }
    return deleted;
  }

  /**
   * Get all drafts (for debugging)
   */
  async getAllDrafts(): Promise<Draft[]> {
    return Array.from(this.drafts.values());
  }

  /**
   * Cleanup expired drafts
   */
  async cleanupExpiredDrafts(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [id, draft] of this.drafts.entries()) {
      if (draft.expiresAt && draft.expiresAt < now) {
        this.drafts.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Start automatic cleanup
   */
  startCleanup(intervalMinutes: number = 60): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      const cleaned = await this.cleanupExpiredDrafts();
      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} expired drafts`);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance (fallback for memory storage)
export const storageService = new StorageService();

/**
 * Get storage service based on configuration
 * Returns Redis storage if STORAGE_TYPE=redis, otherwise in-memory
 * Falls back to in-memory storage if Redis is unavailable
 * 
 * IMPORTANT: Once fallback is determined, it stays consistent for the lifetime of the process
 * to ensure data consistency between create and read operations.
 */
let useMemoryFallback = false;
let storageTypeDetermined = false;
let cachedStorage: typeof storageService | null = null;

export async function getStorageService() {
  // If storage type has been determined, use cached storage
  if (storageTypeDetermined && cachedStorage) {
    return cachedStorage;
  }

  // If we've already determined to use memory fallback, use it
  if (useMemoryFallback) {
    storageTypeDetermined = true;
    cachedStorage = storageService;
    return storageService;
  }

  if (env.STORAGE_TYPE === 'redis') {
    try {
      const { redisStorageService } = await import('./redis-storage.service');
      const { redisClientService } = await import('./redis-client.service');
      
      // Test Redis connection
      const client = await redisClientService.getClient();
      await client.ping(); // Test connection
      
      logger.info('Using Redis storage');
      storageTypeDetermined = true;
      cachedStorage = redisStorageService as unknown as typeof storageService;
      return redisStorageService as unknown as typeof storageService;
    } catch (error) {
      logger.warn('Redis unavailable, falling back to in-memory storage', error as Error);
      useMemoryFallback = true;
      storageTypeDetermined = true;
      cachedStorage = storageService;
      return storageService;
    }
  }
  
  logger.info('Using in-memory storage');
  storageTypeDetermined = true;
  cachedStorage = storageService;
  return storageService;
}

// Export fallback state for logging in other modules
export function isUsingMemoryFallback(): boolean {
  return useMemoryFallback;
}
