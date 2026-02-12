/**
 * Consulting Template
 *
 * Template for consulting services (business, IT, legal-lite MVP)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class ConsultingTemplate extends BaseTemplate {
  id = 'consulting';
  name = 'Consulting Template';
  industry = 'consulting';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Услуги', href: '/services', order: 2 },
      { label: 'Кейсы', href: '/cases', order: 3 },
      { label: 'Команда', href: '/team', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Кейсы', href: '/cases', order: 1 },
      { label: 'Контакты', href: '/contact', order: 2 },
      { label: 'Политика', href: '/privacy', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `${input.brandName} — консалтинг для роста`,
        'Стратегия, процессы и внедрение без лишней теории'
      ),
      this.createServicesSection(2),
      this.createCasesSection(3),
      this.createCustomSection(
        'План на 30 дней',
        'Диагностика → план → быстрые победы → метрики. Двигаемся итерациями.',
        4
      ),
      this.createContactSection(input, 5),
    ];
  }

  private createServicesSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Чем поможем',
        description: 'Фокус на результат и измеримые изменения',
        items: [
          { title: 'Стратегия', description: 'Цели, позиционирование, дорожная карта' },
          { title: 'Операционка', description: 'Процессы, роли, KPI и регламенты' },
          { title: 'Внедрение', description: 'Сопровождение изменений и контроль результата' },
        ],
      },
      order
    );
  }

  private createCasesSection(order: number): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Кейсы',
        description: 'Несколько примеров: рост конверсии, снижение затрат, ускорение процессов.',
        text: 'Расскажите о задаче — предложим 2–3 варианта решения.',
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description }, order);
  }
}


