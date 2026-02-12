# Добавление новых шаблонов

## Обзор

Система шаблонов позволяет легко добавлять новые шаблоны для разных индустрий. Каждый шаблон определяет структуру сайта, секции, навигацию и стили.

## Структура шаблона

### Базовый класс

Все шаблоны наследуются от `BaseTemplate`:

```typescript
import { BaseTemplate } from '../templates/base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig } from '../models/site-config.model';

export class MyTemplate extends BaseTemplate {
  id = 'my-template';
  name = 'My Template';
  industry = 'my-industry'; // или ['industry1', 'industry2']
  version = 1;

  generateSections(input: ConfigInput): SectionConfig[] {
    // Реализация генерации секций
  }
}
```

## Шаги добавления нового шаблона

### 1. Создать файл шаблона

Создайте файл `src/templates/my-template.template.ts`:

```typescript
import { BaseTemplate } from './base.template';
import type { ConfigInput } from '../models/template.model';
import type { SectionConfig, NavigationItem } from '../models/site-config.model';

export class MyTemplate extends BaseTemplate {
  id = 'my-template';
  name = 'My Template';
  industry = 'my-industry';
  version = 1;

  /**
   * Generate sections for this template
   */
  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(input),
      this.createCustomSection(input),
      this.createAboutSection(input),
      this.createContactSection(input),
    ];
  }

  /**
   * Override navigation if needed
   */
  protected generateNavigation(input: ConfigInput): NavigationItem[] {
    return [
      { label: 'Главная', href: '/', order: 1 },
      { label: 'Кастомная', href: '/custom', order: 2 },
      { label: 'О нас', href: '/about', order: 3 },
      { label: 'Контакты', href: '/contact', order: 4 },
    ];
  }

  /**
   * Create custom section
   */
  private createCustomSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Кастомная секция',
        description: 'Описание кастомной секции',
      },
      2
    );
  }
}
```

### 2. Зарегистрировать шаблон

Добавьте регистрацию в `src/templates/index.ts`:

```typescript
import { MyTemplate } from './my-template.template';

class TemplateRegistry {
  constructor() {
    // ... существующие регистрации
    
    // Регистрация нового шаблона
    this.register(new MyTemplate());
  }
}
```

### 3. Экспортировать шаблон (опционально)

Добавьте экспорт в `src/templates/index.ts`:

```typescript
export { MyTemplate } from './my-template.template';
```

## Доступные методы базового класса

### Методы генерации

- `generateBrand(input)` - Генерация конфигурации бренда
- `generateTheme(input)` - Генерация темы (цвета, шрифты)
- `generateHeader(input)` - Генерация заголовка
- `generateFooter(input)` - Генерация футера
- `generateSections(input)` - **Абстрактный метод** - должен быть реализован

### Вспомогательные методы

- `createSection(type, content, order, visible)` - Создание секции с уникальным ID
- `createHeroSection(input, title?, subtitle?)` - Создание hero секции
- `createAboutSection(input)` - Создание секции "О нас"
- `createContactSection(input)` - Создание секции контактов
- `getPrimaryColor(industry)` - Получение основного цвета для индустрии
- `getSecondaryColor(industry)` - Получение вторичного цвета для индустрии

### Переопределяемые методы

- `generateNavigation(input)` - Генерация навигации (можно переопределить)
- `generateFooterLinks(input)` - Генерация ссылок футера (можно переопределить)

## Типы секций

Доступные типы секций:

- `hero` - Главная секция с приветствием
- `about` - Секция "О нас"
- `services` - Секция услуг/товаров
- `contact` - Секция контактов
- `custom` - Кастомная секция

## Примеры

### Пример 1: Простой шаблон

```typescript
export class SimpleTemplate extends BaseTemplate {
  id = 'simple';
  name = 'Simple Template';
  industry = 'other';
  version = 1;

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(input),
      this.createAboutSection(input),
      this.createContactSection(input),
    ];
  }
}
```

### Пример 2: Шаблон с кастомными секциями

```typescript
export class CustomTemplate extends BaseTemplate {
  id = 'custom';
  name = 'Custom Template';
  industry = 'custom';
  version = 1;

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(input),
      this.createPortfolioSection(input),
      this.createTestimonialsSection(input),
      this.createAboutSection(input),
      this.createContactSection(input),
    ];
  }

  private createPortfolioSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Портфолио',
        items: [
          { title: 'Проект 1', description: 'Описание проекта 1' },
          { title: 'Проект 2', description: 'Описание проекта 2' },
        ],
      },
      2
    );
  }

  private createTestimonialsSection(input: ConfigInput): SectionConfig {
    return this.createSection(
      'custom',
      {
        title: 'Отзывы',
        testimonials: [
          { author: 'Иван Иванов', text: 'Отличный сервис!' },
          { author: 'Петр Петров', text: 'Рекомендую!' },
        ],
      },
      3
    );
  }
}
```

### Пример 3: Шаблон для нескольких индустрий

```typescript
export class MultiIndustryTemplate extends BaseTemplate {
  id = 'multi';
  name = 'Multi Industry Template';
  industry = ['education', 'consulting']; // Несколько индустрий
  version = 1;

  generateSections(input: ConfigInput): SectionConfig[] {
    return [
      this.createHeroSection(input),
      this.createServicesSection(input),
      this.createAboutSection(input),
      this.createContactSection(input),
    ];
  }
}
```

## Валидация

После создания шаблона убедитесь, что:

1. Все секции имеют уникальные ID (используйте `createSection`)
2. Порядок секций корректен (`order`)
3. Навигация и футер имеют поле `order`
4. Все секции имеют поле `visible`

## Тестирование

После добавления шаблона протестируйте:

1. Генерацию config для соответствующей индустрии
2. Корректность структуры config
3. Валидацию config
4. Рендеринг preview

## Лучшие практики

1. **Используйте helper методы** - `createSection`, `createHeroSection` и т.д.
2. **Переиспользуйте базовые секции** - `createAboutSection`, `createContactSection`
3. **Добавляйте уникальные секции** - для специфики индустрии
4. **Тестируйте валидацию** - убедитесь, что config проходит валидацию
5. **Документируйте особенности** - добавьте комментарии к кастомным секциям

