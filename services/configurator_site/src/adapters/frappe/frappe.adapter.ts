/**
 * Frappe Adapter
 * 
 * Implementation of IConfiguratorAdapter using Frappe Service
 */

import type {
  IConfiguratorAdapter,
  RenderOptions,
  RenderResult,
  ValidationResult,
  PreviewResult,
  Template,
} from '../configurator.adapter';
import type { Block } from '../../models/block.model';
import type { SiteConfig } from '../../models/site-config.model';
import { frappeClient } from './frappe-client';
import { toFrappeBlocks, fromFrappeBlocks } from './transformers';
import { logger } from '../../utils/logger.util';
import { FallbackAdapter } from '../fallback/fallback.adapter';

export class FrappeAdapter implements IConfiguratorAdapter {
  private fallbackAdapter: FallbackAdapter;

  constructor() {
    this.fallbackAdapter = new FallbackAdapter();
  }

  /**
   * Render a page from blocks
   */
  async renderPage(blocks: Block[], options?: RenderOptions): Promise<RenderResult> {
    try {
      // Check if Frappe is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        logger.warn('Frappe Service unavailable, falling back to fallback adapter');
        return this.fallbackAdapter.renderPage(blocks, options);
      }

      // Transform blocks to Frappe format
      const frappeBlocks = toFrappeBlocks(blocks);

      // Call Frappe Service
      const response = await frappeClient.renderPage({
        blocks: frappeBlocks,
        options,
      });

      return {
        html: response.html,
        css: response.css,
        metadata: response.metadata || options?.metadata,
      };
    } catch (error) {
      logger.error('Frappe render error, falling back to fallback adapter:', error as Error);
      return this.fallbackAdapter.renderPage(blocks, options);
    }
  }

  /**
   * Validate block structure
   */
  async validateBlocks(blocks: Block[]): Promise<ValidationResult> {
    try {
      // Check if Frappe is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        logger.warn('Frappe Service unavailable, using fallback validation');
        return this.fallbackAdapter.validateBlocks(blocks);
      }

      // Transform blocks to Frappe format
      const frappeBlocks = toFrappeBlocks(blocks);

      // Call Frappe Service
      const response = await frappeClient.validateBlocks({
        blocks: frappeBlocks,
      });

      return {
        valid: response.valid,
        errors: response.errors.map((err) => ({
          path: err.path,
          message: err.message,
          code: err.code,
        })),
      };
    } catch (error) {
      logger.error('Frappe validation error, using fallback validation:', error as Error);
      return this.fallbackAdapter.validateBlocks(blocks);
    }
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates(): Promise<Template[]> {
    try {
      // Check if Frappe is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return [];
      }

      // Call Frappe Service
      const templates = await frappeClient.getTemplates();

      return templates.map((t) => ({
        id: t.id,
        name: t.name,
        industry: t.industry,
        version: t.version,
        description: t.description,
      }));
    } catch (error) {
      logger.error('Frappe get templates error:', error as Error);
      return [];
    }
  }

  /**
   * Generate preview of a page
   */
  async previewPage(blocks: Block[], options?: RenderOptions): Promise<PreviewResult> {
    try {
      // Check if Frappe is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        logger.warn('Frappe Service unavailable, falling back to fallback adapter');
        return this.fallbackAdapter.previewPage(blocks, options);
      }

      // Transform blocks to Frappe format
      const frappeBlocks = toFrappeBlocks(blocks);

      // Call Frappe Service
      const response = await frappeClient.previewPage({
        blocks: frappeBlocks,
        options,
      });

      return {
        html: response.html,
        css: response.css,
        assets: {},
      };
    } catch (error) {
      logger.error('Frappe preview error, falling back to fallback adapter:', error as Error);
      return this.fallbackAdapter.previewPage(blocks, options);
    }
  }

  /**
   * Convert SiteConfig to blocks
   */
  configToBlocks(config: SiteConfig): Block[] {
    // Use fallback adapter for config to blocks conversion
    // This is a simple transformation that doesn't require Frappe
    return this.fallbackAdapter.configToBlocks(config);
  }

  /**
   * Check if adapter is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await frappeClient.healthCheck();
      return health.status === 'ok';
    } catch (error) {
      logger.debug('Frappe Service health check failed:', error as Error);
      return false;
    }
  }
}

