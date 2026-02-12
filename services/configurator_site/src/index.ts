/**
 * Site Configurator Service
 * 
 * Main entry point for the site configurator service.
 * This service handles:
 * - Draft site creation and management
 * - Site configuration generation
 * - Preview generation
 * - Temporary draft storage with TTL
 */

import Fastify from 'fastify';
import { registerRoutes } from './api/routes';
import { validateEnv } from './config/env.config';
import { getStorageService } from './services/storage.service';
import { redisClientService } from './services/redis-client.service';
import { getTTLFromEnv } from './config/ttl.config';
import { logger } from './utils/logger.util';

const env = validateEnv();

async function startServer() {
  // Initialize Redis connection if using Redis storage
  if (env.STORAGE_TYPE === 'redis') {
    try {
      await redisClientService.connect();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis', error as Error);
      logger.warn('⚠️  Falling back to in-memory storage');
      // Set environment to use memory storage
      process.env.STORAGE_TYPE = 'memory';
      // Continue with in-memory storage as fallback
    }
  }

  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Register CORS with explicit origins for development
  await fastify.register(import('@fastify/cors'), {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return cb(null, true);
      }
      
      // In development, allow localhost and 127.0.0.1 on any port
      if (env.NODE_ENV === 'development') {
        const allowedOrigins = [
          /^http:\/\/localhost:\d+$/,
          /^https:\/\/localhost:\d+$/,
          /^http:\/\/127\.0\.0\.1:\d+$/,
          /^https:\/\/127\.0\.0\.1:\d+$/,
        ];
        
        const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
        return cb(null, isAllowed);
      }
      
      // In production, use strict origin checking
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Register routes
  await registerRoutes(fastify);

  // Start cleanup task for expired drafts
  const cleanupInterval = 60; // minutes
  const storage = await getStorageService();
  storage.startCleanup(cleanupInterval);

  // Start server
  try {
    const address = await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Site Configurator Service started on ${address}`);
    logger.info(`📝 Environment: ${env.NODE_ENV}`);
    logger.info(`💾 Storage: ${env.STORAGE_TYPE}`);
    logger.info(`⏰ TTL: ${getTTLFromEnv() / 1000 / 60 / 60} hours`);
    logger.info(`🔄 TTL extend on read: ${env.REDIS_TTL_EXTEND_ON_READ}`);
    logger.info(`🧹 Cleanup interval: ${cleanupInterval} minutes`);
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  const storage = await getStorageService();
  storage.stopCleanup();
  if (env.STORAGE_TYPE === 'redis') {
    await redisClientService.disconnect();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  const storage = await getStorageService();
  storage.stopCleanup();
  if (env.STORAGE_TYPE === 'redis') {
    await redisClientService.disconnect();
  }
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Failed to start server', error as Error);
  process.exit(1);
});
