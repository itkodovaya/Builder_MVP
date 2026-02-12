/**
 * Art Template
 *
 * Template for art & design (studios, portfolios, agencies)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class ArtTemplate extends BaseTemplate {
  id = 'art';
  name = 'Art Template';
  industry = 'art';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Портфолио', href: '/portfolio', order: 2 },
      { label: 'Услуги', href: '/services', order: 3 },
      { label: 'Процесс', href: '/process', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Портфолио', href: '/portfolio', order: 1 },
      { label: 'Бриф', href: '/brief', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `${input.brandName} — дизайн, который работает`,
        'Идеи, визуальный стиль и понятная коммуникация'
      ),
      this.createPortfolioSection(2),
      this.createServicesSection(3),
      this.createCustomSection(
        'Процесс',
        'Бриф → концепт → дизайн → правки → финал. Прозрачно и по этапам.',
        4
      ),
      this.createContactSection(input, 5),
    ];
  }

  private createPortfolioSection(order: number): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Портфолио',
        description: 'Подборка работ: брендинг, сайты, иллюстрации.',
        text: 'Хотите похожий стиль? Напишите — обсудим задачу.',
      },
      order
    );
  }

  private createServicesSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Услуги',
        description: 'Что мы делаем лучше всего',
        items: [
          { title: 'Брендинг', description: 'Лого, айдентика, гайдлайны' },
          { title: 'Веб-дизайн', description: 'Сайты, лендинги, дизайн-системы' },
          { title: 'Графика', description: 'Иллюстрации, презентации, упаковка' },
        ],
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description }, order);
  }
}


