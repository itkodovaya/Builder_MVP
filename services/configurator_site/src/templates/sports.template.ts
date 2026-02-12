/**
 * Sports Template
 *
 * Template for sports & fitness (gyms, studios, coaches)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class SportsTemplate extends BaseTemplate {
  id = 'sports';
  name = 'Sports Template';
  industry = 'sports';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Тренировки', href: '/training', order: 2 },
      { label: 'Расписание', href: '/schedule', order: 3 },
      { label: 'Абонементы', href: '/plans', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Расписание', href: '/schedule', order: 1 },
      { label: 'Абонементы', href: '/plans', order: 2 },
      { label: 'Контакты', href: '/contact', order: 3 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `${input.brandName} — тренируйся с удовольствием`,
        'Группы, персональные тренировки и понятный прогресс'
      ),
      this.createPlansSection(2),
      this.createTrainingTypesSection(3),
      this.createCustomSection(
        'Результаты',
        'Трек прогресса, замеры и поддержка тренера — чтобы вы не бросили.',
        4
      ),
      this.createContactSection(input, 5),
    ];
  }

  private createPlansSection(order: number): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Абонементы',
        description: 'Выберите удобный формат',
        items: [
          { title: 'Старт', description: 'Для тех, кто начинает' },
          { title: 'Про', description: 'Регулярные тренировки 3–4 раза в неделю' },
          { title: 'Персональный', description: 'Индивидуальная программа и контроль' },
        ],
      },
      order
    );
  }

  private createTrainingTypesSection(order: number): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Тренировки',
        description: 'Силовые, функциональные, растяжка и кардио — под вашу цель.',
        text: 'Запишитесь на пробное занятие — познакомимся и подберём нагрузку.',
      },
      order
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection('custom', { title, description }, order);
  }
}


