/**
 * Finance Template
 *
 * Template for finance businesses (accounting, investments, fintech)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class FinanceTemplate extends BaseTemplate {
  id = 'finance';
  name = 'Finance Template';
  industry = 'finance';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Решения', href: '/solutions', order: 2 },
      { label: 'Кейсы', href: '/cases', order: 3 },
      { label: 'Тарифы', href: '/pricing', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Политика', href: '/privacy', order: 1 },
      { label: 'Документы', href: '/docs', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `${input.brandName}: финансы под контролем`,
        'Прозрачность, безопасность и понятные отчёты'
      ),
      this.createTrustSection(2),
      this.createSolutionsSection(3),
      this.createCustomSection(
        'Как мы работаем',
        'Анализ → план → внедрение → сопровождение. Всё фиксируем в цифрах.',
        4
      ),
      this.createContactSection(input, 5),
    ];
  }

  private createTrustSection(order: number): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Надёжность',
        description: 'Соблюдаем стандарты, защищаем данные, работаем по договору.',
        text: 'Запросите консультацию — покажем, где можно оптимизировать расходы уже в этом месяце.',
      },
      order
    );
  }

  private createSolutionsSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Решения',
        description: 'Выберите то, что актуально для вашего бизнеса',
        items: [
          { title: 'Учёт и отчётность', description: 'Регулярная отчётность и контроль показателей' },
          { title: 'Планирование', description: 'Бюджетирование и прогнозирование денежного потока' },
          { title: 'Риск-менеджмент', description: 'Контроль рисков и соответствие требованиям' },
        ],
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description }, order);
  }
}


