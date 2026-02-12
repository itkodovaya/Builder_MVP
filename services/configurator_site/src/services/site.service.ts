/**
 * Site Service
 * 
 * Business logic for site configuration operations
 */

import path from 'path';
import { generateId } from '../utils/id.util';
import { getStorageService, isUsingMemoryFallback } from './storage.service';
import { fileUploadService } from './file-upload.service';
import { configService } from './config.service';
import { previewService } from './preview.service';
import { migrationService } from './migration.service';
import { publishService } from './publish.service';
import { staticSiteStorage } from './static-site-storage.service';
import { getTTLFromEnv } from '../config/ttl.config';
import { validateEnv } from '../config/env.config';
import { logger } from '../utils/logger.util';
import type { Draft, CreateDraftData, UpdateDraftData } from '../models/draft.model';
import type { SiteConfig } from '../models/site-config.model';
import type { MigrationResult } from '../models/migration.model';
import type { PublishResult } from '../models/publish.model';

const env = validateEnv();

class SiteService {
  /**
   * Create a new draft
   */
  async createDraft(data: CreateDraftData): Promise<Draft> {
    // Validate draft data
    this.validateDraftData(data);

    const draftId = generateId();
    const now = new Date();
    const ttl = getTTLFromEnv();
    const expiresAt = new Date(now.getTime() + ttl);

    // Handle logo upload if provided
    let logo;
    if (data.logo) {
      // For now, we'll store logo metadata
      // Actual file upload will be handled separately via multipart
      logo = {
        id: generateId(),
        filename: data.logo.filename,
        originalName: data.logo.filename,
        mimeType: data.logo.mimeType,
        size: data.logo.size,
        path: '', // Will be set when file is actually uploaded
        url: '', // Will be set when file is actually uploaded
        uploadedAt: now,
      };
    }

    const draft: Draft = {
      id: draftId,
      brandName: data.brandName,
      industry: data.industry,
      templateId: data.templateId,
      logo,
      steps: data.steps || [],
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    const storage = await getStorageService();
    logger.info(`Saving draft ${draft.id} to storage (type: ${env.STORAGE_TYPE})`);
    await storage.saveDraft(draft);
    logger.debug(`Draft ${draft.id} saved successfully`);
    
    // Verify draft was saved
    const savedDraft = await storage.getDraft(draft.id);
    if (!savedDraft) {
      logger.error(`Failed to verify draft ${draft.id} was saved`);
      throw new Error('Failed to save draft to storage');
    }
    
    // Create Builder Page in Frappe if enabled
    if (env.FRAPPE_ENABLED) {
      try {
        const frappePageName = await this.createFrappeBuilderPage(draft);
        logger.info(`Created Frappe Builder Page: ${frappePageName} for draft ${draft.id}`);
        // Store Frappe page name in draft
        draft.frappePageName = frappePageName;
        // Update draft in storage with Frappe page name
        await storage.saveDraft(draft);
      } catch (error) {
        logger.warn(`Failed to create Frappe Builder Page for draft ${draft.id}:`, error);
        // Don't fail the draft creation if Frappe fails
      }
    }
    
    return draft;
  }

  /**
   * Update an existing draft
   * Invalidates config to force regeneration on next preview request
   */
  async updateDraft(id: string, data: UpdateDraftData): Promise<Draft | null> {
    const storage = await getStorageService();
    const draft = await storage.getDraft(id);
    if (!draft) {
      return null;
    }

    // Validate update data
    if (data.brandName !== undefined && !data.brandName.trim()) {
      throw new Error('Brand name cannot be empty');
    }

    if (data.industry !== undefined && !data.industry.trim()) {
      throw new Error('Industry cannot be empty');
    }

    const updates: Partial<Draft> = {
      updatedAt: new Date(),
      config: undefined, // Invalidate config to force regeneration
    };

    if (data.brandName !== undefined) {
      updates.brandName = data.brandName;
    }

    if (data.industry !== undefined) {
      updates.industry = data.industry;
    }

    if (data.templateId !== undefined) {
      updates.templateId = data.templateId;
    }

    if (data.steps !== undefined) {
      updates.steps = data.steps;
    }

    // Handle logo update
    if (data.logo) {
      updates.logo = {
        id: draft.logo?.id || generateId(),
        filename: data.logo.filename,
        originalName: data.logo.filename,
        mimeType: data.logo.mimeType,
        size: data.logo.size,
        path: draft.logo?.path || '',
        url: draft.logo?.url || '',
        uploadedAt: draft.logo?.uploadedAt || new Date(),
      };
    }

    const updatedDraft = await storage.updateDraft(id, updates);
    return updatedDraft;
  }

  /**
   * Get a draft by ID
   */
  async getDraft(id: string): Promise<Draft | null> {
    const storage = await getStorageService();
    const usingFallback = isUsingMemoryFallback();
    logger.debug(`Getting draft ${id} from storage (type: ${env.STORAGE_TYPE}, fallback: ${usingFallback})`);
    const draft = await storage.getDraft(id);
    if (!draft) {
      logger.warn(`Draft ${id} not found in storage. Storage type: ${env.STORAGE_TYPE}, using fallback: ${usingFallback}`);
      // Try to list all drafts for debugging (only works for memory storage)
      try {
        if (typeof storage.getAllDrafts === 'function') {
          const allDrafts = await storage.getAllDrafts();
          logger.debug(`Total drafts in storage: ${allDrafts.length}`);
          if (allDrafts.length > 0) {
            logger.debug(`Available draft IDs: ${allDrafts.map(d => d.id).join(', ')}`);
          }
        }
      } catch (error) {
        // getAllDrafts might not be available for Redis storage
        logger.debug('Cannot list all drafts (method not available)');
      }
    } else {
      logger.debug(`Draft ${id} found: brandName=${draft.brandName}, industry=${draft.industry}`);
    }
    return draft || null;
  }

  /**
   * Delete a draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    const storage = await getStorageService();
    const draft = await storage.getDraft(id);
    if (draft?.logo) {
      // Delete associated logo file
      await fileUploadService.deleteFile(draft.logo.filename);
    }
    return storage.deleteDraft(id);
  }

  /**
   * Generate site config for a draft
   */
  async generateSiteConfig(draftId: string): Promise<SiteConfig | null> {
    const storage = await getStorageService();
    const draft = await storage.getDraft(draftId);
    if (!draft) {
      return null;
    }

    // Generate config if not already generated
    if (!draft.config) {
      const config = configService.generateSiteConfig(draft);
      await storage.updateDraft(draftId, { config });
      return config;
    }

    return draft.config;
  }

  /**
   * Get preview HTML for a draft
   */
  async getPreview(draftId: string): Promise<string | null> {
    const config = await this.generateSiteConfig(draftId);
    if (!config) {
      return null;
    }

    return previewService.generatePreview(config);
  }

  /**
   * Migrate draft to permanent site
   */
  async migrateDraft(draftId: string, userId: string): Promise<MigrationResult> {
    const storage = await getStorageService();
    
    // 1. Get draft
    const draft = await storage.getDraft(draftId);
    if (!draft) {
      return {
        success: false,
        draftId,
        error: 'Draft not found',
      };
    }

    // 2. Validate draft for migration
    const validation = migrationService.validateDraftForMigration(draft);
    if (!validation.valid) {
      return {
        success: false,
        draftId,
        error: validation.error || 'Draft validation failed',
      };
    }

    // 3. Generate site config if needed
    let config = draft.config;
    if (!config) {
      config = configService.generateSiteConfig(draft);
      if (!config) {
        return {
          success: false,
          draftId,
          error: 'Failed to generate site config',
        };
      }
    }

    // 4. Migrate to permanent site
    const migrationResult = await migrationService.migrateDraftToPermanentSite(
      draft,
      config,
      userId
    );

    // 5. Delete draft from cache only if migration was successful
    if (migrationResult.success) {
      try {
        await storage.deleteDraft(draftId);
        logger.info(`Draft ${draftId} migrated and deleted from cache`);
      } catch (error) {
        // Log error but don't fail migration
        logger.error(`Failed to delete draft ${draftId} from cache`, error as Error);
      }
    }

    return migrationResult;
  }

  /**
   * Publish site
   */
  async publishSite(siteId: string): Promise<PublishResult> {
    // Get site config from external API or cache
    // For now, we'll need to get it from the external API
    // This assumes the site has been migrated and exists in the external system
    
    // For MVP, we'll get config from a draft if it exists
    // In production, this should come from the sites API
    const storage = await getStorageService();
    const draft = await storage.getDraft(siteId);
    
    if (!draft) {
      throw new Error('Site not found');
    }

    // Generate site config if not already generated
    let config = draft.config;
    if (!config) {
      config = configService.generateSiteConfig(draft);
    }

    // Validate config
    const validation = configService.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Site config is invalid: ${validation.errors.join(', ')}`);
    }

    // Generate static site files
    const staticFiles = await publishService.generateStaticSite(config, siteId);

    // Prepare assets (copy logos)
    const assets: Array<{ sourcePath: string; targetPath: string; filename: string }> = [];
    if (draft.logo && draft.logo.path) {
      const logoFilename = path.basename(draft.logo.filename);
      assets.push({
        sourcePath: draft.logo.path,
        targetPath: `assets/${logoFilename}`,
        filename: logoFilename,
      });
      
      // Update logo URL in HTML to point to assets
      staticFiles.html = staticFiles.html.replace(
        draft.logo.url,
        `/p/${siteId}/assets/${logoFilename}`
      );
    }

    staticFiles.assets = assets;

    // Save static site
    await staticSiteStorage.saveSite(siteId, staticFiles);

    const baseUrl = process.env.PUBLISH_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/p/${siteId}`;

    return {
      siteId,
      url,
      publishedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate draft data
   */
  validateDraftData(data: CreateDraftData | UpdateDraftData): void {
    if ('brandName' in data && data.brandName !== undefined) {
      if (!data.brandName.trim()) {
        throw new Error('Brand name is required');
      }
      if (data.brandName.length > 100) {
        throw new Error('Brand name must not exceed 100 characters');
      }
    }

    if ('industry' in data && data.industry !== undefined) {
      if (!data.industry.trim()) {
        throw new Error('Industry is required');
      }
    }

    if (data.logo) {
      const validation = fileUploadService.validateFile({
        filename: data.logo.filename,
        mimeType: data.logo.mimeType,
        size: data.logo.size,
      });

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file');
      }
    }
  }

  /**
   * Create Builder Page in Frappe
   */
  private async createFrappeBuilderPage(draft: Draft): Promise<string> {
    if (!env.FRAPPE_ENABLED || !env.FRAPPE_SERVICE_URL) {
      throw new Error('Frappe service is not enabled or configured');
    }

    const logoUrl = draft.logo?.url 
      ? `${env.FRAPPE_SERVICE_URL.replace(/\/$/, '')}${draft.logo.url.startsWith('/') ? '' : '/'}${draft.logo.url}`
      : undefined;

    const requestBody = {
      brand_name: draft.brandName,
      business_area: draft.industry,
      logo_url: logoUrl,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.FRAPPE_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.FRAPPE_SERVICE_URL}/api/method/builder.api.create_site_from_wizard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Frappe Builder Page: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (result.message && result.message.page_name) {
        return result.message.page_name;
      } else if (result.page_name) {
        return result.page_name;
      } else {
        throw new Error('Invalid response from Frappe API: missing page_name');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${env.FRAPPE_TIMEOUT_MS}ms`);
      }
      throw error;
    }
  }

  /**
   * Get preview HTML from Frappe Builder Page
   */
  async getFrappePreview(pageName: string): Promise<string> {
    if (!env.FRAPPE_ENABLED || !env.FRAPPE_SERVICE_URL) {
      throw new Error('Frappe service is not enabled or configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.FRAPPE_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${env.FRAPPE_SERVICE_URL}/api/method/builder.api.get_page_preview_html?page=${encodeURIComponent(pageName)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Frappe preview: ${response.status} ${errorText}`);
      }

      // Frappe returns HTML directly
      const html = await response.text();
      return html;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${env.FRAPPE_TIMEOUT_MS}ms`);
      }
      throw error;
    }
  }

  /**
   * Get storage service (internal method)
   */
  private async getStorage() {
    return await getStorageService();
  }
}

export const siteService = new SiteService();
