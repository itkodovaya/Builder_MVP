/**
 * Beauty Template
 *
 * Template for beauty & wellness businesses (salons, spas)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class BeautyTemplate extends BaseTemplate {
  id = 'beauty';
  name = 'Beauty Template';
  industry = 'beauty';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'Мастера', href: '/team', order: 3 },
      { label: 'Запись', href: '/booking', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Запись', href: '/booking', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Красота с ${input.brandName}`,
        'Уход, стиль и комфорт — в одном месте'
      ),
      this.createBeautyServicesSection(2),
      this.createCustomSection(
        'Акции',
        'Скидка для новых клиентов и подарочные сертификаты.',
        3
      ),
      this.createCustomSection(
        'Отзывы',
        'Нам доверяют — качество и сервис на первом месте.',
        4
      ),
      this.createContactSection(input, 5),
    ];
  }

  private createBeautyServicesSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Услуги',
        description: 'Подберите процедуру под ваш запрос',
        items: [
          { title: 'Стрижка и укладка', description: 'Подчеркнём ваш стиль' },
          { title: 'Маникюр', description: 'Аккуратно и стойко' },
          { title: 'Уход', description: 'Спа и восстановление' },
        ],
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description, text: 'Запишитесь онлайн — мы подтвердим время.' }, order);
  }
}


