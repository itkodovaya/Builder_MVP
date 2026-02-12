/**
 * Retail Template
 * 
 * Template for retail businesses
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class RetailTemplate extends BaseTemplate {
  id = 'retail';
  name = 'Retail Template';
  industry = 'retail';
  version = 1;

  /**
   * Generate navigation for retail template
   */
  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Каталог', href: '/catalog', order: 2 },
      { label: 'О нас', href: '/about', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  /**
   * Generate footer links for retail template
   */
  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'О нас', href: '/about', order: 1 },
      { label: 'Каталог', href: '/catalog', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
      { label: 'Доставка и оплата', href: '/shipping', order: 4 },
      { label: 'Политика конфиденциальности', href: '/privacy', order: 5 },
    ];
  }

  /**
   * Generate sections for retail template
   */
  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Добро пожаловать в ${input.brandName}`,
        'Широкий ассортимент качественных товаров'
      ),
      this.createProductsSection(input),
      this.createAboutSection(input, 3),
      this.createContactSection(input, 4),
    ];
  }

  /**
   * Create products section
   */
  private createProductsSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Наши товары',
        description: 'Ознакомьтесь с нашим каталогом',
        items: [
          {
            title: 'Качество',
            description: 'Только проверенные товары',
          },
          {
            title: 'Доступность',
            description: 'Конкурентные цены',
          },
          {
            title: 'Сервис',
            description: 'Быстрая доставка и поддержка',
          },
        ],
      },
      2
    );
  }
}

