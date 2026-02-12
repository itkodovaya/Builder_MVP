/**
 * Template Service
 * 
 * Service for managing site templates
 */

import { templateRegistry } from '../templates';
import type { SiteTemplate } from '../models/template.model';
import { logger } from '../utils/logger.util';

class TemplateService {
  /**
   * Get all templates
   */
  getAllTemplates(): SiteTemplate[] {
    return templateRegistry.getAllTemplates();
  }

  /**
   * Get template by industry
   */
  getTemplate(industry: string): SiteTemplate | null {
    return templateRegistry.getTemplate(industry);
  }

  /**
   * Get template by ID (for MVP, we use industry as ID)
   */
  getTemplateById(id: string): SiteTemplate | null {
    // In MVP, template ID is the industry name
    return templateRegistry.getTemplate(id) || templateRegistry.getDefaultTemplate();
  }

  /**
   * Register a new template
   * Note: In MVP, templates are code-based. For full CRUD, we'd need persistent storage.
   */
  registerTemplate(template: SiteTemplate): void {
    templateRegistry.register(template);
    logger.info(`Template registered for industry: ${Array.isArray(template.industry) ? template.industry.join(', ') : template.industry}`);
  }

  /**
   * Get template info (without full implementation)
   */
  getTemplateInfo(template: SiteTemplate): {
    id: string;
    name: string;
    industry: string | string[];
    version: number;
  } {
    const industries = Array.isArray(template.industry) ? template.industry : [template.industry];
    return {
      id: industries[0] || 'default',
      name: template.name,
      industry: template.industry,
      version: template.version,
    };
  }
}

export const templateService = new TemplateService();

