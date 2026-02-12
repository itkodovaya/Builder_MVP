# Система шаблонов для генерации Site Config

## Алгоритм генерации

### Входные данные

```typescript
{
  brandName: string;    // Название бренда
  industry: string;    // Сфера деятельности
  logo?: string;       // URL логотипа (опционально)
}
```

### Процесс генерации

1. **Подготовка данных** - преобразование Draft в ConfigInput
2. **Выбор шаблона** - поиск шаблона по industry в реестре
3. **Fallback** - использование default шаблона, если не найден
4. **Применение шаблона** - генерация всех компонентов config
5. **Валидация** - проверка корректности структуры
6. **Возврат** - готовый SiteConfig

### Псевдокод

```typescript
function generateSiteConfig(draft: Draft): SiteConfig {
  // 1. Подготовка входных данных
  const input = {
    brandName: draft.brandName,
    industry: draft.industry,
    logo: draft.logo?.url,
  };
  
  // 2. Выбор шаблона
  const template = templateRegistry.getTemplateOrDefault(input.industry);
  
  // 3. Применение шаблона
  const config = template.apply(input);
  
  // 4. Валидация
  validateConfig(config);
  
  return config;
}
```

## Пример Site Config

### Входные данные

```json
{
  "brandName": "Моя Компания",
  "industry": "tech",
  "logo": "/uploads/logo.png"
}
```

### Выходной Site Config (Tech Template)

```json
{
  "brand": {
    "name": "Моя Компания",
    "industry": "tech",
    "logo": "/uploads/logo.png"
  },
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#60A5FA",
    "fontFamily": "Inter, sans-serif"
  },
  "layout": {
    "header": {
      "showLogo": true,
      "logoUrl": "/uploads/logo.png",
      "navigation": [
        { "label": "Главная", "href": "/", "order": 1 },
        { "label": "Продукты", "href": "/products", "order": 2 },
        { "label": "О нас", "href": "/about", "order": 3 },
        { "label": "Контакты", "href": "/contact", "order": 4 }
      ]
    },
    "sections": [
      {
        "id": "clx1234567890",
        "type": "hero",
        "content": {
          "title": "Добро пожаловать в Моя Компания",
          "subtitle": "Инновационные технологии для вашего бизнеса"
        },
        "order": 1,
        "visible": true
      },
      {
        "id": "clx9876543210",
        "type": "services",
        "content": {
          "title": "Наши возможности",
          "items": [
            {
              "title": "Быстро",
              "description": "Мгновенная работа и высокая производительность"
            },
            {
              "title": "Надежно",
              "description": "Проверенные решения и стабильная работа"
            },
            {
              "title": "Современно",
              "description": "Актуальные технологии и инновации"
            }
          ]
        },
        "order": 2,
        "visible": true
      },
      {
        "id": "clx5555555555",
        "type": "about",
        "content": {
          "title": "О нас",
          "description": "Мы - Моя Компания, компания в сфере tech."
        },
        "order": 3,
        "visible": true
      },
      {
        "id": "clx4444444444",
        "type": "contact",
        "content": {
          "title": "Свяжитесь с нами",
          "email": "info@example.com"
        },
        "order": 4,
        "visible": true
      }
    ],
    "footer": {
      "showBrand": true,
      "copyright": "© 2024 Моя Компания. All rights reserved.",
      "links": [
        { "label": "О нас", "href": "/about", "order": 1 },
        { "label": "Продукты", "href": "/products", "order": 2 },
        { "label": "Контакты", "href": "/contact", "order": 3 },
        { "label": "Политика конфиденциальности", "href": "/privacy", "order": 4 }
      ]
    }
  }
}
```

## Структура шаблонов

### Доступные шаблоны

- **DefaultTemplate** - базовый шаблон для всех индустрий
- **TechTemplate** - шаблон для технологических компаний
- **RetailTemplate** - шаблон для розничной торговли
- **HealthcareTemplate** - шаблон для здравоохранения

### Добавление новых шаблонов

См. [Документацию по добавлению шаблонов](./adding-templates.md)

## Пригодность для публикации

Сгенерированный config полностью пригоден для публикации:

- ✅ Все обязательные поля заполнены
- ✅ Корректная структура данных
- ✅ Валидные цвета и ссылки
- ✅ Правильный порядок секций
- ✅ Готов к использованию в preview и публикации

