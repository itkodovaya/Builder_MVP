/**
 * Redis Client Service
 * 
 * Manages Redis connection and provides client instance
 */

import { createClient, type RedisClientType } from 'redis';
import { validateEnv } from '../config/env.config';
import { logger } from '../utils/logger.util';

const env = validateEnv();

class RedisClientService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  /**
   * Get or create Redis client
   */
  async getClient(): Promise<RedisClientType> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    return this.connect();
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<RedisClientType> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      this.client = createClient({
        url: env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 retries');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      // Error handling
      this.client.on('error', (err) => {
        logger.error('Redis client error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis', error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Check if client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Singleton instance
export const redisClientService = new RedisClientService();

