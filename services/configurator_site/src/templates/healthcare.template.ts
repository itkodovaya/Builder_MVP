/**
 * Healthcare Template
 * 
 * Template for healthcare businesses
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class HealthcareTemplate extends BaseTemplate {
  id = 'healthcare';
  name = 'Healthcare Template';
  industry = 'healthcare';
  version = 1;

  /**
   * Generate navigation for healthcare template
   */
  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'О нас', href: '/about', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  /**
   * Generate footer links for healthcare template
   */
  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'О нас', href: '/about', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
      { label: 'Запись на прием', href: '/appointment', order: 4 },
      { label: 'Политика конфиденциальности', href: '/privacy', order: 5 },
    ];
  }

  /**
   * Generate sections for healthcare template
   */
  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Добро пожаловать в ${input.brandName}`,
        'Забота о вашем здоровье - наш приоритет'
      ),
      this.createServicesSection(input),
      this.createAboutSection(input, 3),
      this.createContactSection(input, 4),
    ];
  }

  /**
   * Create services section
   */
  private createServicesSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Наши услуги',
        items: [
          {
            title: 'Профессионализм',
            description: 'Опытные специалисты',
          },
          {
            title: 'Забота',
            description: 'Индивидуальный подход',
          },
          {
            title: 'Технологии',
            description: 'Современное оборудование',
          },
        ],
      },
      2
    );
  }
}

