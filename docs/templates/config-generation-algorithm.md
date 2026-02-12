# Алгоритм генерации Site Config

## Обзор

Алгоритм генерации site config на основе входных данных с использованием системы шаблонов.

## Входные данные

```typescript
interface ConfigInput {
  brandName: string;        // Название бренда
  industry: string;         // Сфера деятельности
  logo?: string;            // URL логотипа (опционально)
}
```

## Алгоритм

### Шаг 1: Подготовка входных данных

```typescript
const input: ConfigInput = {
  brandName: draft.brandName,
  industry: draft.industry,
  logo: draft.logo?.url,
};
```

### Шаг 2: Выбор шаблона

```typescript
// Получить шаблон для индустрии
const template = templateRegistry.getTemplate(industry);

// Если шаблон не найден, использовать default
const selectedTemplate = template || templateRegistry.getDefaultTemplate();
```

**Логика выбора:**
1. Поиск шаблона по `industry` в реестре
2. Если не найден - использование default шаблона
3. Если шаблон поддерживает несколько индустрий - проверка всех

### Шаг 3: Применение шаблона

```typescript
const config = template.apply(input);
```

**Процесс применения:**

1. **Генерация brand config:**
   ```typescript
   brand: {
     name: input.brandName,
     industry: input.industry,
     logo: input.logo,
   }
   ```

2. **Генерация theme:**
   ```typescript
   theme: {
     primaryColor: getPrimaryColor(industry),
     secondaryColor: getSecondaryColor(industry),
     fontFamily: 'Inter, sans-serif',
   }
   ```

3. **Генерация header:**
   ```typescript
   header: {
     showLogo: !!input.logo,
     logoUrl: input.logo,
     navigation: generateNavigation(input),
   }
   ```

4. **Генерация sections:**
   ```typescript
   sections: generateSections(input) // Шаблон-специфичная логика
   ```

5. **Генерация footer:**
   ```typescript
   footer: {
     showBrand: true,
     copyright: `© ${year} ${brandName}. All rights reserved.`,
     links: generateFooterLinks(input),
   }
   ```

### Шаг 4: Валидация

```typescript
const validation = configService.validateConfig(config);
if (!validation.valid) {
  throw new Error(`Config validation failed: ${validation.errors.join(', ')}`);
}
```

**Проверки:**
- Наличие обязательных полей (brand.name, brand.industry, theme.primaryColor)
- Наличие header и sections
- Корректность структуры секций (id, order, visible)
- Корректность навигации и футера (order)

### Шаг 5: Возврат результата

```typescript
return config;
```

## Пример генерации

### Входные данные

```json
{
  "brandName": "Моя Компания",
  "industry": "tech",
  "logo": "/uploads/logo.png"
}
```

### Процесс генерации

1. **Выбор шаблона:** `TechTemplate` (для industry="tech")

2. **Генерация brand:**
   ```json
   {
     "name": "Моя Компания",
     "industry": "tech",
     "logo": "/uploads/logo.png"
   }
   ```

3. **Генерация theme:**
   ```json
   {
     "primaryColor": "#3B82F6",
     "secondaryColor": "#60A5FA",
     "fontFamily": "Inter, sans-serif"
   }
   ```

4. **Генерация header:**
   ```json
   {
     "showLogo": true,
     "logoUrl": "/uploads/logo.png",
     "navigation": [
       { "label": "Главная", "href": "/", "order": 1 },
       { "label": "Продукты", "href": "/products", "order": 2 },
       { "label": "О нас", "href": "/about", "order": 3 },
       { "label": "Контакты", "href": "/contact", "order": 4 }
     ]
   }
   ```

5. **Генерация sections (TechTemplate):**
   ```json
   [
     {
       "id": "clx...",
       "type": "hero",
       "content": {
         "title": "Добро пожаловать в Моя Компания",
         "subtitle": "Инновационные технологии для вашего бизнеса"
       },
       "order": 1,
       "visible": true
     },
     {
       "id": "clx...",
       "type": "services",
       "content": {
         "title": "Наши возможности",
         "items": [...]
       },
       "order": 2,
       "visible": true
     },
     {
       "id": "clx...",
       "type": "about",
       "content": {
         "title": "О нас",
         "description": "Мы - Моя Компания, компания в сфере tech."
       },
       "order": 3,
       "visible": true
     },
     {
       "id": "clx...",
       "type": "contact",
       "content": {
         "title": "Свяжитесь с нами",
         "email": "info@example.com"
       },
       "order": 4,
       "visible": true
     }
   ]
   ```

6. **Генерация footer:**
   ```json
   {
     "showBrand": true,
     "copyright": "© 2024 Моя Компания. All rights reserved.",
     "links": [
       { "label": "О нас", "href": "/about", "order": 1 },
       { "label": "Продукты", "href": "/products", "order": 2 },
       { "label": "Контакты", "href": "/contact", "order": 3 },
       { "label": "Политика конфиденциальности", "href": "/privacy", "order": 4 }
     ]
   }
   ```

### Выходной Site Config

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
    "header": { ... },
    "sections": [ ... ],
    "footer": { ... }
  }
}
```

## Особенности реализации

### Выбор шаблона

- Приоритет: шаблон для конкретной индустрии
- Fallback: default шаблон
- Поддержка множественных индустрий: один шаблон для нескольких

### Генерация секций

- Каждый шаблон определяет свой набор секций
- Секции имеют уникальные ID (генерируются автоматически)
- Порядок определяется полем `order`
- Видимость контролируется полем `visible`

### Темы и цвета

- Цвета выбираются на основе индустрии
- Можно переопределить в шаблоне
- Поддержка кастомных цветовых схем

### Навигация и футер

- Базовые значения в `BaseTemplate`
- Можно переопределить в конкретном шаблоне
- Поддержка кастомных ссылок

## Расширяемость

### Добавление нового шаблона

1. Создать класс, наследующий `BaseTemplate`
2. Реализовать `generateSections()`
3. Зарегистрировать в реестре
4. Готово - шаблон автоматически используется

### Кастомизация существующего шаблона

1. Наследовать от существующего шаблона
2. Переопределить нужные методы
3. Зарегистрировать с другим ID

## Производительность

- Генерация config: O(n), где n - количество секций
- Выбор шаблона: O(1) (Map lookup)
- Валидация: O(n), где n - количество элементов для проверки

## Пригодность для публикации

Сгенерированный config пригоден для публикации, если:

1. ✅ Все обязательные поля заполнены
2. ✅ Все секции имеют корректную структуру
3. ✅ Навигация и футер корректны
4. ✅ Цвета валидны (hex формат)
5. ✅ Порядок секций корректен
6. ✅ Все ссылки валидны

Config можно использовать для:
- Генерации HTML preview
- Публикации сайта
- Экспорта в другие форматы
- Дальнейшей кастомизации

