/**
 * API Route Definitions
 * 
 * Define all API endpoints for the configurator service
 */

import type { FastifyInstance } from 'fastify';
import { siteController } from '../controllers/site.controller';
import { authController } from '../controllers/auth.controller';
import { adminController } from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/admin.middleware';
import { fileUploadService } from '../services/file-upload.service';
import { staticSiteStorage } from '../services/static-site-storage.service';
import { validateEnv } from '../config/env.config';
import path from 'path';
import { readFile } from 'fs/promises';

const env = validateEnv();

export async function registerRoutes(fastify: FastifyInstance) {
  // Register multipart for file uploads
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    },
  });

  // Serve uploaded files
  fastify.get('/uploads/*', async (request, reply) => {
    try {
      const filePath = request.url.replace('/uploads/', '');
      const uploadDir = fileUploadService.getUploadDir();
      const fullPath = path.join(uploadDir, filePath);
      
      const file = await readFile(fullPath);
      const ext = path.extname(filePath).toLowerCase();
      
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.webp') contentType = 'image/webp';
      
      return reply.type(contentType).send(file);
    } catch (error) {
      return reply.code(404).send({ error: 'File not found' });
    }
  });

  // Auth Routes
  fastify.post('/api/auth/register', authController.register.bind(authController));
  fastify.post('/api/auth/login', authController.login.bind(authController));

  // API Routes
  fastify.post('/api/drafts', siteController.createDraft.bind(siteController));

  fastify.get('/api/drafts/:id', siteController.getDraft.bind(siteController));

  fastify.patch('/api/drafts/:id', siteController.updateDraft.bind(siteController));

  fastify.delete('/api/drafts/:id', siteController.deleteDraft.bind(siteController));

  fastify.get('/api/drafts/:id/config', siteController.getSiteConfig.bind(siteController));

  fastify.get('/api/drafts/:id/preview', siteController.getPreview.bind(siteController));

  fastify.post('/api/drafts/:id/logo', siteController.uploadLogo.bind(siteController));

  fastify.post('/api/drafts/:id/migrate', siteController.migrateDraft.bind(siteController));

  // Publish site
  fastify.post('/api/sites/:siteId/publish', siteController.publishSite.bind(siteController));

  // Serve published sites
  fastify.get('/p/:siteId', async (request, reply) => {
    try {
      const { siteId } = request.params as { siteId: string };
      const html = await staticSiteStorage.getSiteHTML(siteId);
      return reply.type('text/html').send(html);
    } catch (error) {
      return reply.code(404).send({ error: 'Site not found' });
    }
  });

  fastify.get('/p/:siteId/styles.css', async (request, reply) => {
    try {
      const { siteId } = request.params as { siteId: string };
      const css = await staticSiteStorage.getSiteCSS(siteId);
      return reply.type('text/css').send(css);
    } catch (error) {
      return reply.code(404).send({ error: 'CSS not found' });
    }
  });

  fastify.get('/p/:siteId/assets/*', async (request, reply) => {
    try {
      const { siteId } = request.params as { siteId: string };
      const assetPath = (request.url as string).replace(`/p/${siteId}/assets/`, '');
      const asset = await staticSiteStorage.getAsset(siteId, assetPath);
      
      const ext = path.extname(assetPath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.webp') contentType = 'image/webp';
      
      return reply.type(contentType).send(asset);
    } catch (error) {
      return reply.code(404).send({ error: 'Asset not found' });
    }
  });

      // Health check
      fastify.get('/health', async () => {
        return { status: 'ok', service: 'configurator-site' };
      });

      // Debug endpoint to list all drafts (for development only)
      if (env.NODE_ENV === 'development') {
        fastify.get('/api/debug/drafts', async (request, reply) => {
          try {
            const { getStorageService } = await import('../services/storage.service');
            const storage = await getStorageService();
            const drafts = await storage.getAllDrafts();
            return reply.send({
              success: true,
              data: {
                count: drafts.length,
                drafts: drafts.map((d) => ({
                  id: d.id,
                  brandName: d.brandName,
                  industry: d.industry,
                  hasLogo: !!d.logo,
                  hasConfig: !!d.config,
                  expiresAt: d.expiresAt?.toISOString(),
                  createdAt: d.createdAt.toISOString(),
                })),
              },
            });
          } catch (error) {
            return reply.code(500).send({
              success: false,
              error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
              },
            });
          }
        });
      }

      // Admin Routes - все защищены middleware requireAdmin
      // Users
      fastify.get('/api/admin/users', { preHandler: requireAdmin }, adminController.getAllUsers.bind(adminController) as never);
      fastify.get('/api/admin/users/:id', { preHandler: requireAdmin }, adminController.getUser.bind(adminController) as never);
      fastify.put('/api/admin/users/:id', { preHandler: requireAdmin }, adminController.updateUser.bind(adminController) as never);
      fastify.delete('/api/admin/users/:id', { preHandler: requireAdmin }, adminController.deleteUser.bind(adminController) as never);

      // Sites
      fastify.get('/api/admin/sites', { preHandler: requireAdmin }, adminController.getAllSites.bind(adminController) as never);
      fastify.get('/api/admin/sites/:id', { preHandler: requireAdmin }, adminController.getSite.bind(adminController) as never);
      fastify.delete('/api/admin/sites/:id', { preHandler: requireAdmin }, adminController.deleteSite.bind(adminController) as never);

      // Templates
      fastify.get('/api/admin/templates', { preHandler: requireAdmin }, adminController.getAllTemplates.bind(adminController) as never);

      // Drafts
      fastify.get('/api/admin/drafts', { preHandler: requireAdmin }, adminController.getAllDrafts.bind(adminController) as never);
      fastify.get('/api/admin/drafts/:id', { preHandler: requireAdmin }, adminController.getDraft.bind(adminController) as never);
      fastify.delete('/api/admin/drafts/:id', { preHandler: requireAdmin }, adminController.deleteDraft.bind(adminController) as never);

      // Statistics
      fastify.get('/api/admin/stats', { preHandler: requireAdmin }, adminController.getStats.bind(adminController));
    }
