/**
 * Site Controller
 * 
 * Handles HTTP requests related to site configuration
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { siteService } from '../services/site.service';
import { fileUploadService } from '../services/file-upload.service';
import { previewService } from '../services/preview.service';
import { configService } from '../services/config.service';
import { createDraftSchema, updateDraftSchema } from '../schemas/draft.schema';
import { migrateDraftSchema } from '../schemas/migration.schema';
import type { CreateDraftInput, UpdateDraftInput } from '../schemas/draft.schema';
import type { MigrateDraftInput } from '../schemas/migration.schema';

interface CreateDraftParams {
  Body: CreateDraftInput;
}

interface GetDraftParams {
  Params: { id: string };
}

interface UpdateDraftParams {
  Params: { id: string };
  Body: UpdateDraftInput;
}

interface DeleteDraftParams {
  Params: { id: string };
}

interface MigrateDraftParams {
  Params: { id: string };
  Body: MigrateDraftInput;
}

interface PublishSiteParams {
  Params: { siteId: string };
}

export class SiteController {
  /**
   * Create a new draft
   */
  async createDraft(
    request: FastifyRequest<CreateDraftParams>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const data = createDraftSchema.parse(request.body);

      const draft = await siteService.createDraft(data);

      return reply.code(201).send({
        success: true,
        data: draft,
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Get a draft by ID
   */
  async getDraft(
    request: FastifyRequest<GetDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const draft = await siteService.getDraft(id);

      if (!draft) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: draft,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Update a draft
   */
  async updateDraft(
    request: FastifyRequest<UpdateDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = updateDraftSchema.parse(request.body);

      const draft = await siteService.updateDraft(id, data);

      if (!draft) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: draft,
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Get site config for a draft
   */
  async getSiteConfig(
    request: FastifyRequest<GetDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const config = await siteService.generateSiteConfig(id);

      if (!config) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: config,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Get preview HTML for a draft
   * Supports ETag caching and security headers
   * If Frappe Builder Page exists, uses Frappe for rendering
   */
  async getPreview(
    request: FastifyRequest<GetDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      // Get draft to check if Frappe page exists
      const { getStorageService } = await import('../services/storage.service');
      const storage = await getStorageService();
      const draft = await storage.getDraft(id);
      
      if (!draft) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      // If Frappe page exists, get preview from Frappe
      if (draft.frappePageName) {
        try {
          const frappeHtml = await siteService.getFrappePreview(draft.frappePageName);
          return reply
            .type('application/json')
            .send({
              success: true,
              data: {
                html: frappeHtml,
                assets: {},
              },
            });
        } catch (error) {
          // Fall back to configurator preview if Frappe fails
          console.warn('Failed to get Frappe preview, falling back to configurator:', error);
        }
      }

      // Fallback to configurator preview
      const config = await siteService.generateSiteConfig(id);
      if (!config) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft config not found',
          },
        });
      }

      // Generate ETag from config
      const etag = previewService.generateETag(config);

      // Check If-None-Match header for cache validation
      const ifNoneMatch = request.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        return reply.code(304).send(); // Not Modified
      }

      // Generate JSON preview payload (HTML + CSS + optional assets)
      const previewPayload = previewService.generatePreviewJson(config);

      // Set cache headers (ETag is still based on config hash)
      reply.header('Cache-Control', 'public, max-age=300'); // 5 minutes
      reply.header('ETag', etag);
      reply.header('X-Content-Type-Options', 'nosniff');

      return reply
        .type('application/json')
        .send({
          success: true,
          data: previewPayload,
        });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Delete a draft
   */
  async deleteDraft(
    request: FastifyRequest<DeleteDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const deleted = await siteService.deleteDraft(id);

      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Draft deleted successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Upload logo file
   */
  async uploadLogo(
    request: FastifyRequest<GetDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
          },
        });
      }

      const buffer = await data.toBuffer();
      const validation = fileUploadService.validateFile({
        filename: data.filename || 'unknown',
        mimeType: data.mimetype || 'application/octet-stream',
        size: buffer.length,
      });

      if (!validation.valid) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error,
          },
        });
      }

      const logo = await fileUploadService.saveFile(
        buffer,
        data.filename || 'logo',
        data.mimetype || 'image/png',
        id
      );

      // Update draft with logo
      await siteService.updateDraft(id, {
        logo: {
          filename: logo.filename,
          mimeType: logo.mimeType,
          size: logo.size,
        },
      });

      return reply.send({
        success: true,
        data: logo,
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Migrate draft to permanent site
   */
  async migrateDraft(
    request: FastifyRequest<MigrateDraftParams>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = migrateDraftSchema.parse(request.body);

      const result = await siteService.migrateDraft(id, data.userId);

      if (!result.success) {
        // Determine status code based on error
        let statusCode = 500;
        if (result.error === 'Draft not found') {
          statusCode = 404;
        } else if (result.error === 'Draft has expired' || result.error === 'Draft is incomplete') {
          statusCode = 400;
        }

        return reply.code(statusCode).send({
          success: false,
          error: {
            code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'VALIDATION_ERROR' : 'MIGRATION_ERROR',
            message: result.error || 'Migration failed',
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          siteId: result.siteId!,
          draftId: result.draftId,
          migratedAt: result.migratedAt!,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * Publish site
   */
  async publishSite(
    request: FastifyRequest<PublishSiteParams>,
    reply: FastifyReply
  ) {
    try {
      const { siteId } = request.params;

      const result = await siteService.publishSite(siteId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: statusCode === 404 ? 'NOT_FOUND' : 'PUBLISH_ERROR',
            message: error.message,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }
}

export const siteController = new SiteController();
