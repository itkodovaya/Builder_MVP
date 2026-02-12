/**
 * Education Template
 *
 * Template for education businesses (courses, schools, tutors)
 */

import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class EducationTemplate extends BaseTemplate {
  id = 'education';
  name = 'Education Template';
  industry = 'education';
  version = 1;

  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Программы', href: '/programs', order: 2 },
      { label: 'Преподаватели', href: '/team', order: 3 },
      { label: 'Отзывы', href: '/reviews', order: 4 },
      { label: 'Контакты', href: '/contact', order: 5 },
    ];
  }

  protected generateFooterLinks(input: ConfigInput) {
    return [
      { label: 'Программы', href: '/programs', order: 1 },
      { label: 'Цены', href: '/pricing', order: 2 },
      { label: 'Вопросы', href: '/faq', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(
        input,
        `Учитесь с ${input.brandName}`,
        'Короткие программы, понятные результаты, поддержка на каждом шаге'
      ),
      this.createProgramsSection(input),
      this.createCustomSection(
        'Почему выбирают нас',
        'Методика, практика и наставники — чтобы вы реально применяли знания.',
        3
      ),
      this.createAboutSection(input, 4),
      this.createContactSection(input, 5),
    ];
  }

  private createProgramsSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'services',
      {
        title: 'Популярные программы',
        description: 'Выберите формат и начните обучение уже сегодня',
        items: [
          { title: 'Интенсив', description: 'Быстрый старт за 2–4 недели' },
          { title: 'Профессия', description: 'Глубокая программа на 2–6 месяцев' },
          { title: 'Наставничество', description: 'Индивидуальный план и обратная связь' },
        ],
      },
      2
    );
  }

  private createCustomSection(title: string, description: string, order: number): SectionConfig {
    return this.createSection(
      'custom',
      {
        title,
        description,
        text: 'Оставьте заявку — поможем подобрать программу под вашу цель.',
      },
      order
    );
  }
}


