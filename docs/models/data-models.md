# Минимальные модели данных для конструктора сайтов

## Общие требования

- **Сериализуемость**: Все модели должны быть сериализуемы в JSON
- **Хранение**: Подходят для хранения в кеше (Redis) и БД (PostgreSQL/MongoDB)
- **Версионирование**: Поддержка версионирования через поле `version`
- **Метаданные**: Все модели содержат базовые метаданные (id, timestamps)

## 1. BrandProfile

Профиль бренда - базовая информация о бренде/компании.

```typescript
interface BrandProfile {
  // Идентификация
  id: string;                    // Уникальный ID (cuid2)
  version: number;                // Версия модели (для миграций)
  
  // Основная информация
  name: string;                   // Название бренда (обязательно, max 100 символов)
  industry: string;               // Сфера деятельности (обязательно)
  
  // Логотип
  logo?: LogoReference;           // Ссылка на логотип (опционально)
  
  // Метаданные
  createdAt: string;             // ISO 8601 дата создания
  updatedAt: string;             // ISO 8601 дата обновления
}

interface LogoReference {
  id: string;                     // ID файла логотипа
  url: string;                    // URL для доступа к файлу
  filename: string;               // Имя файла
  mimeType: string;               // MIME тип (image/png, image/jpeg, etc.)
  size: number;                   // Размер файла в байтах
  uploadedAt: string;            // ISO 8601 дата загрузки
}
```

### JSON пример:
```json
{
  "id": "clx1234567890",
  "version": 1,
  "name": "Моя Компания",
  "industry": "tech",
  "logo": {
    "id": "clx9876543210",
    "url": "/uploads/clx9876543210.png",
    "filename": "clx9876543210.png",
    "mimeType": "image/png",
    "size": 24560,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 2. SiteDraft

Временный черновик сайта без регистрации пользователя.

```typescript
interface SiteDraft {
  // Идентификация
  id: string;                    // Уникальный ID черновика (cuid2)
  version: number;                // Версия модели
  
  // Связь с профилем бренда
  brandProfileId: string;        // ID профиля бренда
  
  // Статус
  status: 'draft' | 'configuring' | 'ready' | 'expired';
  
  // Данные мастера (wizard steps)
  wizardSteps: WizardStep[];     // Шаги мастера создания
  
  // Сгенерированная конфигурация (опционально, генерируется по запросу)
  config?: SiteConfig;           // Ссылка на SiteConfig (опционально)
  
  // TTL для временных черновиков
  expiresAt?: string;            // ISO 8601 дата истечения (для неавторизованных)
  
  // Метаданные
  createdAt: string;             // ISO 8601 дата создания
  updatedAt: string;            // ISO 8601 дата обновления
}

interface WizardStep {
  stepNumber: number;            // Номер шага (1, 2, 3, ...)
  stepType: 'brand-name' | 'industry' | 'logo' | 'custom';
  data: Record<string, unknown>; // Данные шага (сериализуемые)
  completed: boolean;            // Шаг завершен
  completedAt?: string;         // ISO 8601 дата завершения
}
```

### JSON пример:
```json
{
  "id": "clx1111111111",
  "version": 1,
  "brandProfileId": "clx1234567890",
  "status": "configuring",
  "wizardSteps": [
    {
      "stepNumber": 1,
      "stepType": "brand-name",
      "data": { "brandName": "Моя Компания" },
      "completed": true,
      "completedAt": "2024-01-15T10:05:00.000Z"
    },
    {
      "stepNumber": 2,
      "stepType": "industry",
      "data": { "industry": "tech" },
      "completed": true,
      "completedAt": "2024-01-15T10:10:00.000Z"
    },
    {
      "stepNumber": 3,
      "stepType": "logo",
      "data": { "logoId": "clx9876543210" },
      "completed": false
    }
  ],
  "expiresAt": "2024-01-16T10:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:10:00.000Z"
}
```

## 3. SiteConfig

Результат работы конфигуратора - финальная конфигурация сайта.

```typescript
interface SiteConfig {
  // Идентификация
  id: string;                    // Уникальный ID конфигурации (cuid2)
  version: number;                // Версия конфигурации (для миграций)
  
  // Связи
  siteDraftId: string;           // ID черновика, из которого создана конфигурация
  brandProfileId: string;        // ID профиля бренда
  
  // Конфигурация бренда
  brand: {
    name: string;                 // Название бренда
    industry: string;             // Сфера деятельности
    logo?: string;                // URL логотипа (опционально)
  };
  
  // Тема оформления
  theme: {
    primaryColor: string;        // Основной цвет (hex, например: #3B82F6)
    secondaryColor: string;      // Вторичный цвет (hex)
    fontFamily?: string;         // Шрифт (опционально)
  };
  
  // Структура сайта
  layout: {
    header: HeaderConfig;
    sections: SectionConfig[];
    footer: FooterConfig;
  };
  
  // Метаданные
  generatedAt: string;          // ISO 8601 дата генерации
  createdAt: string;            // ISO 8601 дата создания
  updatedAt: string;            // ISO 8601 дата обновления
}

interface HeaderConfig {
  showLogo: boolean;            // Показывать ли логотип
  logoUrl?: string;             // URL логотипа (если отличается от brand.logo)
  navigation: NavigationItem[]; // Элементы навигации
}

interface NavigationItem {
  label: string;                // Текст ссылки
  href: string;                 // URL ссылки
  order: number;                // Порядок отображения
}

interface SectionConfig {
  id: string;                   // Уникальный ID секции
  type: 'hero' | 'about' | 'services' | 'contact' | 'custom';
  content: Record<string, unknown>; // Контент секции (сериализуемый)
  order: number;                // Порядок отображения
  visible: boolean;             // Видимость секции
}

interface FooterConfig {
  showBrand: boolean;           // Показывать ли название бренда
  copyright: string;           // Текст копирайта
  links: FooterLink[];         // Ссылки в футере
}

interface FooterLink {
  label: string;               // Текст ссылки
  href: string;                 // URL ссылки
  order: number;               // Порядок отображения
}
```

### JSON пример:
```json
{
  "id": "clx2222222222",
  "version": 1,
  "siteDraftId": "clx1111111111",
  "brandProfileId": "clx1234567890",
  "brand": {
    "name": "Моя Компания",
    "industry": "tech",
    "logo": "/uploads/clx9876543210.png"
  },
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#60A5FA",
    "fontFamily": "Inter, sans-serif"
  },
  "layout": {
    "header": {
      "showLogo": true,
      "logoUrl": "/uploads/clx9876543210.png",
      "navigation": [
        { "label": "Главная", "href": "/", "order": 1 },
        { "label": "О нас", "href": "/about", "order": 2 },
        { "label": "Услуги", "href": "/services", "order": 3 },
        { "label": "Контакты", "href": "/contact", "order": 4 }
      ]
    },
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "content": {
          "title": "Добро пожаловать в Моя Компания",
          "subtitle": "Мы специализируемся в сфере tech"
        },
        "order": 1,
        "visible": true
      },
      {
        "id": "about-1",
        "type": "about",
        "content": {
          "title": "О нас",
          "description": "Мы - Моя Компания, компания в сфере tech."
        },
        "order": 2,
        "visible": true
      }
    ],
    "footer": {
      "showBrand": true,
      "copyright": "© 2024 Моя Компания. All rights reserved.",
      "links": [
        { "label": "О нас", "href": "/about", "order": 1 },
        { "label": "Услуги", "href": "/services", "order": 2 },
        { "label": "Контакты", "href": "/contact", "order": 3 },
        { "label": "Политика конфиденциальности", "href": "/privacy", "order": 4 }
      ]
    }
  },
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Связи между моделями

```
BrandProfile (1) ──< (N) SiteDraft
                         │
                         └──> (1) SiteConfig
```

- Один `BrandProfile` может иметь множество `SiteDraft`
- Один `SiteDraft` генерирует один `SiteConfig`
- `SiteConfig` ссылается на `BrandProfile` для доступа к данным бренда

## Особенности реализации

### Версионирование

Поле `version` используется для:
- Миграций данных при изменении структуры моделей
- Совместимости между версиями API
- Отслеживания изменений структуры

### Сериализация

Все даты хранятся в формате ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`):
- Совместимо с JSON
- Легко парсится в JavaScript (`new Date(dateString)`)
- Поддерживается всеми БД и кешами

### Хранение в кеше

Для Redis можно использовать:
```typescript
// Ключ для кеша
const cacheKey = `site-draft:${draftId}`;
// TTL в секундах
const ttl = Math.floor((new Date(draft.expiresAt).getTime() - Date.now()) / 1000);
await redis.setex(cacheKey, ttl, JSON.stringify(draft));
```

### Хранение в БД

Для PostgreSQL можно использовать JSONB:
```sql
CREATE TABLE site_drafts (
  id VARCHAR(255) PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  brand_profile_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  wizard_steps JSONB NOT NULL,
  config JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

Для MongoDB документы хранятся как есть (BSON поддерживает все типы).

## Минимальные требования к валидации

### BrandProfile
- `name`: обязательное, 1-100 символов
- `industry`: обязательное, не пустое
- `logo`: опциональное, если указано - должно быть валидным `LogoReference`

### SiteDraft
- `brandProfileId`: обязательное, должно существовать
- `status`: обязательное, одно из допустимых значений
- `wizardSteps`: обязательное, массив, не пустой
- `expiresAt`: опциональное, если указано - должно быть в будущем

### SiteConfig
- `siteDraftId`: обязательное, должно существовать
- `brandProfileId`: обязательное, должно существовать
- `brand.name`: обязательное, не пустое
- `brand.industry`: обязательное, не пустое
- `theme.primaryColor`: обязательное, валидный hex цвет
- `theme.secondaryColor`: обязательное, валидный hex цвет
- `layout.sections`: обязательное, массив, не пустой

