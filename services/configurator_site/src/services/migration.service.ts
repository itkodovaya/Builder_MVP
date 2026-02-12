/**
 * Migration Service
 * 
 * Handles migration of drafts to permanent sites
 */

import { generateId } from '../utils/id.util';
import { validateEnv } from '../config/env.config';
import { logger } from '../utils/logger.util';
import type { Draft } from '../models/draft.model';
import type { SiteConfig } from '../models/site-config.model';
import type { PermanentSite, MigrationResult } from '../models/migration.model';

const env = validateEnv();

class MigrationService {
  /**
   * Migrate draft to permanent site
   */
  async migrateDraftToPermanentSite(
    draft: Draft,
    config: SiteConfig,
    userId: string
  ): Promise<MigrationResult> {
    try {
      // 1. Prepare permanent site data
      const permanentSite: PermanentSite = {
        id: generateId(),
        userId,
        brandName: draft.brandName,
        industry: draft.industry,
        logo: draft.logo
          ? {
              id: draft.logo.id,
              filename: draft.logo.filename,
              url: draft.logo.url,
              mimeType: draft.logo.mimeType,
              size: draft.logo.size,
              uploadedAt: draft.logo.uploadedAt.toISOString(),
            }
          : undefined,
        config: JSON.parse(JSON.stringify(config)) as Record<string, unknown>,
        isTemporary: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Save to database via external API
      const savedSite = await this.saveToDatabase(permanentSite);

      return {
        success: true,
        siteId: savedSite.id,
        draftId: draft.id,
        migratedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to migrate draft', error as Error);
      return {
        success: false,
        draftId: draft.id,
        error: error instanceof Error ? error.message : 'Migration failed',
      };
    }
  }

  /**
   * Save permanent site to database via external API
   */
  private async saveToDatabase(site: PermanentSite): Promise<PermanentSite> {
    const apiUrl = env.SITES_API_URL;
    const apiToken = env.SITES_API_TOKEN;
    const timeout = env.SITES_API_TIMEOUT || 5000;

    if (!apiUrl) {
      throw new Error('SITES_API_URL is not configured');
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${apiUrl}/api/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify(site),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save site to database: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      
      // Return site with ID from response or original ID
      return {
        ...site,
        id: result.data?.id || result.id || site.id,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Validate draft can be migrated
   */
  validateDraftForMigration(draft: Draft): { valid: boolean; error?: string } {
    // Check if draft exists
    if (!draft) {
      return { valid: false, error: 'Draft not found' };
    }

    // Check if draft has expired
    if (draft.expiresAt && draft.expiresAt < new Date()) {
      return { valid: false, error: 'Draft has expired' };
    }

    // Check if draft has required data
    if (!draft.brandName || !draft.industry) {
      return { valid: false, error: 'Draft is incomplete' };
    }

    return { valid: true };
  }
}

export const migrationService = new MigrationService();

