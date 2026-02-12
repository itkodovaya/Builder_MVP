/**
 * Tech Template
 * 
 * Template for technology companies
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class TechTemplate extends BaseTemplate {
  id = 'tech';
  name = 'Tech Template';
  industry = 'tech';
  version = 1;

  /**
   * Generate navigation for tech template
   */
  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Продукты', href: '/products', order: 2 },
      { label: 'О нас', href: '/about', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  /**
   * Generate footer links for tech template
   */
  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'О нас', href: '/about', order: 1 },
      { label: 'Продукты', href: '/products', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
      { label: 'Политика конфиденциальности', href: '/privacy', order: 4 },
    ];
  }

  /**
   * Generate sections for tech template
   */
  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Добро пожаловать в ${input.brandName}`,
        'Инновационные технологии для вашего бизнеса'
      ),
      this.createFeaturesSection(input),
      this.createAboutSection(input, 3),
      this.createContactSection(input, 4),
    ];
  }

  /**
   * Create features section
   */
  private createFeaturesSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Наши возможности',
        items: [
          {
            title: 'Быстро',
            description: 'Мгновенная работа и высокая производительность',
          },
          {
            title: 'Надежно',
            description: 'Проверенные решения и стабильная работа',
          },
          {
            title: 'Современно',
            description: 'Актуальные технологии и инновации',
          },
        ],
      },
      2
    );
  }
}

