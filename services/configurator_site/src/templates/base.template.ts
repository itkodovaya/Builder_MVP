/**
 * Base Template
 * 
 * Abstract base class for all site templates
 */

import { generateId } from '../utils/id.util';
import type { SiteTemplate, ConfigInput, BrandConfig, ThemeConfig } from '../models/template.model';
import type { SiteConfig, HeaderConfig, FooterConfig, SectionConfig, NavigationItem } from '../models/site-config.model';

export abstract class BaseTemplate implements SiteTemplate {
  abstract id: string;
  abstract name: string;
  abstract industry: string | string[];
  version: number = 1;

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract generateSections(input: ConfigInput): SectionConfig[];

  /**
   * Generate brand configuration
   */
  generateBrand(input: ConfigInput): BrandConfig {
    return {
      name: input.brandName,
      industry: input.industry,
      logo: input.logo,
    };
  }

  /**
   * Generate theme configuration
   */
  generateTheme(input: ConfigInput): ThemeConfig {
    return {
      primaryColor: this.getPrimaryColor(input.industry),
      secondaryColor: this.getSecondaryColor(input.industry),
      fontFamily: 'Inter, sans-serif',
    };
  }

  /**
   * Generate header configuration
   */
  generateHeader(input: ConfigInput): HeaderConfig {
    return {
      showLogo: !!input.logo,
      logoUrl: input.logo,
      navigation: this.generateNavigation(input),
    };
  }

  /**
   * Generate footer configuration
   */
  generateFooter(input: ConfigInput): FooterConfig {
    return {
      showBrand: true,
      copyright: `© ${new Date().getFullYear()} ${input.brandName}. All rights reserved.`,
      links: this.generateFooterLinks(input),
    };
  }

  /**
   * Apply template to generate full site config
   */
  apply(input: ConfigInput): SiteConfig {
    const config: SiteConfig = {
      brand: this.generateBrand(input),
      theme: this.generateTheme(input),
      layout: {
        header: this.generateHeader(input),
        sections: this.generateSections(input),
        footer: this.generateFooter(input),
      },
    };

    return config;
  }

  /**
   * Get primary color for industry
   */
  protected getPrimaryColor(industry: string): string {
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
   */
  protected getSecondaryColor(industry: string): string {
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

  /**
   * Generate navigation items (can be overridden)
   */
  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'О нас', href: '/about', order: 2 },
      { label: 'Услуги', href: '/services', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  /**
   * Generate footer links (can be overridden)
   */
  protected generateFooterLinks(input: ConfigInput): FooterConfig['links'] {
    return [
      { label: 'О нас', href: '/about', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
      { label: 'Политика конфиденциальности', href: '/privacy', order: 4 },
    ];
  }

  /**
   * Create a section with unique ID
   */
  protected createSection(
    type: SectionConfig['type'],
    content: Record<string, unknown>,
    order: number,
    visible: boolean = true
  ): SectionConfig {
    return {
      id: generateId(),
      type,
      content,
      order,
      visible,
    };
  }

  /**
   * Create hero section (helper method)
   */
  protected createHeroSection(
    input: ConfigInput,
    title?: string,
    subtitle?: string
  ): SectionConfig {
    return this.createSection(
      'hero',
      {
        title: title || `Добро пожаловать в ${input.brandName}`,
        subtitle: subtitle || `Мы специализируемся в сфере ${input.industry}`,
      },
      1
    );
  }

  /**
   * Create about section (helper method)
   */
  protected createAboutSection(input: ConfigInput, order: number = 2): SectionConfig {
    return this.createSection(
      'about',
      {
        title: 'О нас',
        description: `Мы - ${input.brandName}, компания в сфере ${input.industry}.`,
      },
      order
    );
  }

  /**
   * Create contact section (helper method)
   */
  protected createContactSection(input: ConfigInput, order: number = 3): SectionConfig {
    return this.createSection(
      'contact',
      {
        title: 'Свяжитесь с нами',
        email: 'info@example.com',
      },
      order
    );
  }
}

