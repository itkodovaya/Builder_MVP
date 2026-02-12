/**
 * Real Estate Template
 *
 * Template for real estate agencies and developers
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class RealEstateTemplate extends BaseTemplate {
  id = 'real-estate';
  name = 'Real Estate Template';
  industry = 'real-estate';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Объекты', href: '/listings', order: 2 },
      { label: 'Условия', href: '/terms', order: 3 },
      { label: 'О компании', href: '/about', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Объекты', href: '/listings', order: 1 },
      { label: 'Ипотека', href: '/mortgage', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Найдите свой дом с ${input.brandName}`,
        'Подбор, показы, сопровождение сделки — под ключ'
      ),
      this.createListingsSection(2),
      this.createCustomSection(
        'Сопровождение',
        'Проверка документов, переговоры, подготовка сделки и безопасные расчёты.',
        3
      ),
      this.createAboutSection(input, 4),
      this.createContactSection(input, 5),
    ];
  }

  private createListingsSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Популярные категории',
        description: 'Выберите направление — мы подберём варианты',
        items: [
          { title: 'Квартиры', description: 'Новостройки и вторичный рынок' },
          { title: 'Дома', description: 'Коттеджи, таунхаусы, участки' },
          { title: 'Коммерция', description: 'Офисы, склады, торговые площади' },
        ],
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description, text: 'Оставьте заявку — свяжемся и уточним критерии.' }, order);
  }
}


