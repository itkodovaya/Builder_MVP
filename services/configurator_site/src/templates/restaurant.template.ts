/**
 * Restaurant Template
 *
 * Template for restaurants, cafes, coffee shops
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class RestaurantTemplate extends BaseTemplate {
  id = 'restaurant';
  name = 'Restaurant Template';
  industry = 'restaurant';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Меню', href: '/menu', order: 2 },
      { label: 'Бронирование', href: '/booking', order: 3 },
      { label: 'О нас', href: '/about', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Меню', href: '/menu', order: 1 },
      { label: 'Доставка', href: '/delivery', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `${input.brandName} — вкусные моменты`,
        'Свежие продукты, авторские блюда и уютная атмосфера'
      ),
      this.createMenuHighlightsSection(2),
      this.createCustomSection(
        'Бронирование',
        'Забронируйте столик заранее — ответим и подтвердим время.',
        3
      ),
      this.createAboutSection(input, 4),
      this.createContactSection(input, 5),
    ];
  }

  private createMenuHighlightsSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Хиты меню',
        description: 'То, что выбирают чаще всего',
        items: [
          { title: 'Завтраки', description: 'Быстро, вкусно и с заботой' },
          { title: 'Основные блюда', description: 'Сезонные сочетания и классика' },
          { title: 'Десерты', description: 'Идеальное завершение вечера' },
        ],
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection(
      'custom',
      { title, description, text: 'Хотите доставку? Напишите нам — подскажем условия.' },
      order
    );
  }
}


