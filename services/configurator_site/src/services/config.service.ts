/**
 * Config Service
 * 
 * Handles site configuration generation and management using templates
 */

import type { Draft } from '../models/draft.model';
import type { SiteConfig } from '../models/site-config.model';
import type { ConfigInput } from '../models/template.model';
import { templateRegistry } from '../templates';

class ConfigService {
  /**
   * Generate site config from draft using templates
   */
  generateSiteConfig(draft: Draft): SiteConfig {
    // Prepare input data
    const input: ConfigInput = {
      brandName: draft.brandName,
      industry: draft.industry,
      logo: draft.logo?.url,
    };

    // Get template for industry or use default
    const template = templateRegistry.getTemplateOrDefault(input.industry);

    // Apply template to generate base config (структура и контент зависят от сферы)
    const config = template.apply(input);

    // Привяжем визуальный шаблон (classic / modern и т.п.) к конфигу,
    // чтобы PreviewService мог выбрать нужный рендерер по templateId.
    // Если в драфте нет явного выбора, используем 'modern' как более наглядный.
    config.templateId = draft.templateId || config.templateId || 'modern';

    return config;
  }

  /**
   * Build config from wizard steps
   * @deprecated Use generateSiteConfig instead
   */
  buildConfigFromSteps(steps: Draft['steps']): Partial<SiteConfig> {
    const config: Partial<SiteConfig> = {};

    for (const step of steps) {
      switch (step.stepType) {
        case 'brand-name':
          if (step.data.brandName) {
            config.brand = {
              ...config.brand,
              name: step.data.brandName as string,
            } as SiteConfig['brand'];
          }
          break;
        case 'industry':
          if (step.data.industry) {
            config.brand = {
              ...config.brand,
              industry: step.data.industry as string,
            } as SiteConfig['brand'];
          }
          break;
        case 'logo':
          // Logo is handled separately
          break;
      }
    }

    return config;
  }

  /**
   * Validate config structure
   */
  validateConfig(config: SiteConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.brand?.name) {
      errors.push('Brand name is required');
    }

    if (!config.brand?.industry) {
      errors.push('Industry is required');
    }

    if (!config.theme?.primaryColor) {
      errors.push('Primary color is required');
    }

    if (!config.layout?.header) {
      errors.push('Header configuration is required');
    }

    if (!config.layout?.sections || config.layout.sections.length === 0) {
      errors.push('At least one section is required');
    }

    // Validate sections
    if (config.layout?.sections) {
      for (const section of config.layout.sections) {
        if (!section.id) {
          errors.push('Section ID is required');
        }
        if (section.order === undefined || section.order < 0) {
          errors.push('Section order must be a positive number');
        }
      }
    }

    // Validate navigation
    if (config.layout?.header?.navigation) {
      for (const item of config.layout.header.navigation) {
        if (!item.order || item.order < 0) {
          errors.push('Navigation item order must be a positive number');
        }
      }
    }

    // Validate footer links
    if (config.layout?.footer?.links) {
      for (const link of config.layout.footer.links) {
        if (!link.order || link.order < 0) {
          errors.push('Footer link order must be a positive number');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge configs
   */
  mergeConfigs(base: SiteConfig, updates: Partial<SiteConfig>): SiteConfig {
    return {
      brand: { ...base.brand, ...updates.brand },
      theme: { ...base.theme, ...updates.theme },
      layout: {
        header: { ...base.layout.header, ...updates.layout?.header },
        sections: updates.layout?.sections || base.layout.sections,
        footer: { ...base.layout.footer, ...updates.layout?.footer },
      },
    };
  }

  /**
   * Get primary color for industry
   * @deprecated Use template system instead
   */
  private getPrimaryColorForIndustry(industry: string): string {
    const colorMap: Record<string, string> = {
      tech: '#3B82F6',
      retail: '#10B981',
      education: '#8B5CF6',
      healthcare: '#EF4444',
      finance: '#F59E0B',
      'real-estate': '#06B6D4',
      restaurant: '#EC4899',
      beauty: '#F97316',
      sports: '#14B8A6',
      art: '#A855F7',
      consulting: '#6366F1',
      other: '#6B7280',
    };

    return colorMap[industry] || '#3B82F6';
  }

  /**
   * Get secondary color for industry
   * @deprecated Use template system instead
   */
  private getSecondaryColorForIndustry(industry: string): string {
    const colorMap: Record<string, string> = {
      tech: '#60A5FA',
      retail: '#34D399',
      education: '#A78BFA',
      healthcare: '#F87171',
      finance: '#FBBF24',
      'real-estate': '#22D3EE',
      restaurant: '#F472B6',
      beauty: '#FB923C',
      sports: '#2DD4BF',
      art: '#C084FC',
      consulting: '#818CF8',
      other: '#9CA3AF',
    };

    return colorMap[industry] || '#60A5FA';
  }
}

export const configService = new ConfigService();
