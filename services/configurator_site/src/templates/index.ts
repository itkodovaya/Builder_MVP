/**
 * Template Registry
 * 
 * Centralized registry for managing site templates
 */

import type { SiteTemplate } from '../models/template.model';
import { DefaultTemplate } from './default.template';
import { TechTemplate } from './tech.template';
import { RetailTemplate } from './retail.template';
import { HealthcareTemplate } from './healthcare.template';
import { EducationTemplate } from './education.template';
import { FinanceTemplate } from './finance.template';
import { RealEstateTemplate } from './real-estate.template';
import { RestaurantTemplate } from './restaurant.template';
import { BeautyTemplate } from './beauty.template';
import { SportsTemplate } from './sports.template';
import { ArtTemplate } from './art.template';
import { ConsultingTemplate } from './consulting.template';

class TemplateRegistry {
  private templates: Map<string, SiteTemplate> = new Map();
  private defaultTemplate: SiteTemplate;

  constructor() {
    // Initialize default template
    this.defaultTemplate = new DefaultTemplate();
    this.templates.set('default', this.defaultTemplate);

    // Register industry-specific templates
    this.register(new TechTemplate());
    this.register(new RetailTemplate());
    this.register(new HealthcareTemplate());
    this.register(new EducationTemplate());
    this.register(new FinanceTemplate());
    this.register(new RealEstateTemplate());
    this.register(new RestaurantTemplate());
    this.register(new BeautyTemplate());
    this.register(new SportsTemplate());
    this.register(new ArtTemplate());
    this.register(new ConsultingTemplate());
  }

  /**
   * Register a template
   */
  register(template: SiteTemplate): void {
    const industries = Array.isArray(template.industry)
      ? template.industry
      : [template.industry];

    for (const industry of industries) {
      this.templates.set(industry, template);
    }
  }

  /**
   * Get template by industry
   */
  getTemplate(industry: string): SiteTemplate | null {
    return this.templates.get(industry) || null;
  }

  /**
   * Get default template
   */
  getDefaultTemplate(): SiteTemplate {
    return this.defaultTemplate;
  }

  /**
   * Get template for industry or fallback to default
   */
  getTemplateOrDefault(industry: string): SiteTemplate {
    return this.getTemplate(industry) || this.defaultTemplate;
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): SiteTemplate[] {
    const uniqueTemplates = new Set<SiteTemplate>();
    for (const template of this.templates.values()) {
      uniqueTemplates.add(template);
    }
    return Array.from(uniqueTemplates);
  }

  /**
   * Check if template exists for industry
   */
  hasTemplate(industry: string): boolean {
    return this.templates.has(industry);
  }
}

// Singleton instance
export const templateRegistry = new TemplateRegistry();

// Export templates for direct access if needed
export { DefaultTemplate } from './default.template';
export { TechTemplate } from './tech.template';
export { RetailTemplate } from './retail.template';
export { HealthcareTemplate } from './healthcare.template';
export { EducationTemplate } from './education.template';
export { FinanceTemplate } from './finance.template';
export { RealEstateTemplate } from './real-estate.template';
export { RestaurantTemplate } from './restaurant.template';
export { BeautyTemplate } from './beauty.template';
export { SportsTemplate } from './sports.template';
export { ArtTemplate } from './art.template';
export { ConsultingTemplate } from './consulting.template';

