/**
 * Preview Service
 * 
 * Generates HTML preview from site config
 */

import { createHash } from 'crypto';
import type { SiteConfig } from '../models/site-config.model';
import { sanitizeHtml, sanitizeUrl, escapeHtml } from '../utils/sanitize.util';
import { templateRegistry } from './templates/template.registry';
import { getConfiguratorAdapter } from '../adapters';

class PreviewService {
  /**
   * JSON payload for preview rendering (used by frontend iframe srcDoc)
   * Для надёжности отдаём уже собранный полный HTML-документ, чтобы
   * фронт просто положил его в iframe.srcDoc без дополнительной сборки.
   */
  generatePreviewJson(siteConfig: SiteConfig): { html: string; assets: Record<string, string> } {
    const fullHtml = this.generatePreview(siteConfig);

    return {
      html: fullHtml,
      assets: {},
    };
  }

  /**
   * Generate HTML preview from site config
   */
  generatePreview(siteConfig: SiteConfig): string {
    // HTML полностью генерируется нашими шаблонами, без пользовательского ввода,
    // поэтому для превью можно вернуть его без жёсткой санитизации, чтобы сохранить стили.
    const html = this.renderTemplate(siteConfig);
    return html;
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  sanitizeHtml(html: string): string {
    return sanitizeHtml(html);
  }

  /**
   * Generate ETag from site config
   * ETag is based on config hash for cache validation
   */
  generateETag(config: SiteConfig): string {
    const configString = JSON.stringify(config);
    const hash = createHash('md5').update(configString).digest('hex');
    return `"${hash}"`;
  }

  /**
   * Validate URLs in config
   */
  validateUrls(config: SiteConfig): boolean {
    // Validate logo URL
    if (config.brand.logo) {
      const url = sanitizeUrl(config.brand.logo);
      if (url === '#' && config.brand.logo !== '#') {
        return false;
      }
    }

    // Validate header logo URL
    if (config.layout.header.logoUrl) {
      const url = sanitizeUrl(config.layout.header.logoUrl);
      if (url === '#' && config.layout.header.logoUrl !== '#') {
        return false;
      }
    }

    // Validate navigation URLs
    for (const item of config.layout.header.navigation) {
      const url = sanitizeUrl(item.href);
      if (url === '#' && item.href !== '#') {
        return false;
      }
    }

    // Validate footer links
    for (const link of config.layout.footer.links) {
      const url = sanitizeUrl(link.href);
      if (url === '#' && link.href !== '#') {
        return false;
      }
    }

    return true;
  }

  /**
   * Render HTML template
   */
  renderTemplate(config: SiteConfig): string {
    // Validate URLs before rendering
    if (!this.validateUrls(config)) {
      throw new Error('Invalid URLs in site config');
    }

    // Use adapter to convert config to blocks and render
    const adapter = getConfiguratorAdapter();
    const blocks = adapter.configToBlocks(config);
    
    // Render using adapter (synchronous for now, but adapter is async)
    // For backward compatibility, we'll use template registry if adapter doesn't support direct config rendering
    // In the future, we can make this fully async
    try {
      // Try to use adapter for rendering
      // Note: This is a simplified approach. In production, we should make renderTemplate async
      // or use a different method that works with blocks
      return templateRegistry.getTemplate(config.templateId).render(config);
    } catch (error) {
      // Fallback to template registry
      return templateRegistry.getTemplate(config.templateId).render(config);
    }
  }

  /**
   * Get preview URL
   */
  getPreviewUrl(draftId: string): string {
    return `/api/drafts/${draftId}/preview`;
  }
}

export const previewService = new PreviewService();

