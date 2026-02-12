/**
 * Default Template
 * 
 * Default template for all industries
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig } from '../models/site-config.model';

export class DefaultTemplate extends BaseTemplate {
  id = 'default';
  name = 'Default Template';
  industry = 'default';
  version = 1;

  /**
   * Generate sections for default template
   */
  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(input),
      this.createAboutSection(input),
      this.createContactSection(input),
    ];
  }
}

