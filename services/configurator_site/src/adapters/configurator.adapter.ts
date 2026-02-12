/**
 * Configurator Adapter Interface
 * 
 * Abstraction layer for any site configurator (Frappe, custom, etc.)
 */

import type { Block } from '../models/block.model';
import type { SiteConfig } from '../models/site-config.model';

export interface RenderOptions {
  inlineCSS?: boolean;
  cssPath?: string;
  metadata?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
  };
}

export interface RenderResult {
  html: string;
  css?: string;
  metadata?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code?: string;
}

export interface PreviewResult {
  html: string;
  css?: string;
  assets?: Record<string, string>;
}

export interface Template {
  id: string;
  name: string;
  industry?: string | string[];
  version?: number;
  description?: string;
}

/**
 * Interface for configurator adapters
 * Allows swapping between different rendering engines (Frappe, custom, etc.)
 */
export interface IConfiguratorAdapter {
  /**
   * Render a page from blocks
   */
  renderPage(blocks: Block[], options?: RenderOptions): Promise<RenderResult>;

  /**
   * Validate block structure
   */
  validateBlocks(blocks: Block[]): Promise<ValidationResult>;

  /**
   * Get available templates
   */
  getAvailableTemplates(): Promise<Template[]>;

  /**
   * Generate preview of a page
   */
  previewPage(blocks: Block[], options?: RenderOptions): Promise<PreviewResult>;

  /**
   * Convert SiteConfig to blocks
   */
  configToBlocks(config: SiteConfig): Block[];

  /**
   * Check if adapter is available/healthy
   */
  isAvailable(): Promise<boolean>;
}

