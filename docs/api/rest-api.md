# REST API - Configurator Site Service

## Базовый URL

```
http://localhost:3001
```

## Общие требования

- **Авторизация**: Не требуется (API публичный)
- **Формат данных**: JSON для всех запросов и ответов (кроме preview)
- **Идентификация**: Все операции привязаны к `draft_id` (параметр пути)
- **Content-Type**: `application/json` для JSON запросов

## Формат ответов

### Успешный ответ

```json
{
  "success": true,
  "data": { ... }
}
```

### Ошибка

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Описание ошибки"
  }
}
```

### Коды ошибок

- `400` - Ошибка валидации (неверные данные)
- `404` - Черновик не найден
- `500` - Внутренняя ошибка сервера

---

## 1. Создание черновика

Создает новый черновик сайта с начальными данными.

### Endpoint

```
POST /api/drafts
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "brandName": "Моя Компания",
  "industry": "tech",
  "steps": [
    {
      "stepNumber": 1,
      "stepType": "brand-name",
      "data": {
        "brandName": "Моя Компания"
      },
      "completed": true
    }
  ]
}
```

### Поля запроса

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `brandName` | string | Да | Название бренда (1-100 символов) |
| `industry` | string | Да | Сфера деятельности (не пустое) |
| `steps` | array | Нет | Массив шагов мастера |
| `logo` | object | Нет | Метаданные логотипа (используется при создании с логотипом) |

### Структура шага (WizardStep)

```json
{
  "stepNumber": 1,
  "stepType": "brand-name" | "industry" | "logo" | "other",
  "data": {
    // Произвольные данные шага
  },
  "completed": true
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890abcdef",
    "brandName": "Моя Компания",
    "industry": "tech",
    "logo": null,
    "steps": [
      {
        "stepNumber": 1,
        "stepType": "brand-name",
        "data": {
          "brandName": "Моя Компания"
        },
        "completed": true
      }
    ],
    "config": null,
    "expiresAt": "2024-01-16T10:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Brand name is required"
  }
}
```

### Пример запроса

```bash
curl -X POST http://localhost:3001/api/drafts \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Моя Компания",
    "industry": "tech"
  }'
```

---

## 2. Обновление шагов черновика

Обновляет данные черновика (название, сфера деятельности, логотип).

### Endpoint

```
PATCH /api/drafts/:draft_id
```

### Path Parameters

| Параметр | Тип | Описание |
|----------|-----|----------|
| `draft_id` | string | ID черновика |

### Request Headers

```
Content-Type: application/json
```

### Request Body

Все поля опциональны. Можно обновлять отдельные поля или несколько одновременно.

#### Обновление названия бренда

```json
{
  "brandName": "Новое название компании"
}
```

#### Обновление сферы деятельности

```json
{
  "industry": "retail"
}
```

#### Обновление названия и сферы

```json
{
  "brandName": "Новое название",
  "industry": "retail"
}
```

#### Обновление шагов мастера

```json
{
  "steps": [
    {
      "stepNumber": 1,
      "stepType": "brand-name",
      "data": {
        "brandName": "Обновленное название"
      },
      "completed": true
    },
    {
      "stepNumber": 2,
      "stepType": "industry",
      "data": {
        "industry": "tech"
      },
      "completed": true
    }
  ]
}
```

#### Обновление метаданных логотипа

```json
{
  "logo": {
    "filename": "logo.png",
    "mimeType": "image/png",
    "size": 24560
  }
}
```

### Поля запроса

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `brandName` | string | Нет | Название бренда (1-100 символов) |
| `industry` | string | Нет | Сфера деятельности |
| `steps` | array | Нет | Массив шагов мастера |
| `logo` | object | Нет | Метаданные логотипа |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890abcdef",
    "brandName": "Новое название",
    "industry": "retail",
    "logo": null,
    "steps": [
      {
        "stepNumber": 1,
        "stepType": "brand-name",
        "data": {
          "brandName": "Новое название"
        },
        "completed": true
      }
    ],
    "config": null,
    "expiresAt": "2024-01-16T10:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Draft not found"
  }
}
```

### Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Brand name cannot be empty"
  }
}
```

### Пример запроса

```bash
curl -X PATCH http://localhost:3001/api/drafts/clx1234567890abcdef \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Обновленное название",
    "industry": "retail"
  }'
```

---

## 3. Получение текущего состояния черновика

Возвращает текущее состояние черновика со всеми данными.

### Endpoint

```
GET /api/drafts/:draft_id
```

### Path Parameters

| Параметр | Тип | Описание |
|----------|-----|----------|
| `draft_id` | string | ID черновика |

### Request Headers

Не требуются.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890abcdef",
    "brandName": "Моя Компания",
    "industry": "tech",
    "logo": {
      "id": "clx9876543210fedcba",
      "filename": "clx9876543210fedcba.png",
      "originalName": "logo.png",
      "mimeType": "image/png",
      "size": 24560,
      "path": "./uploads/clx9876543210fedcba.png",
      "url": "/uploads/clx9876543210fedcba.png",
      "uploadedAt": "2024-01-15T10:15:00.000Z"
    },
    "steps": [
      {
        "stepNumber": 1,
        "stepType": "brand-name",
        "data": {
          "brandName": "Моя Компания"
        },
        "completed": true
      },
      {
        "stepNumber": 2,
        "stepType": "industry",
        "data": {
          "industry": "tech"
        },
        "completed": true
      },
      {
        "stepNumber": 3,
        "stepType": "logo",
        "data": {
          "logoId": "clx9876543210fedcba"
        },
        "completed": true
      }
    ],
    "config": null,
    "expiresAt": "2024-01-16T10:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:15:00.000Z"
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Draft not found"
  }
}
```

### Пример запроса

```bash
curl http://localhost:3001/api/drafts/clx1234567890abcdef
```

### Примечания

- При чтении черновика TTL автоматически продлевается (если `REDIS_TTL_EXTEND_ON_READ=true`)
- Поле `expiresAt` обновляется при продлении TTL

---

## 4. Получение preview сайта

Возвращает HTML preview сгенерированного сайта.

### Endpoint

```
GET /api/drafts/:draft_id/preview
```

### Path Parameters

| Параметр | Тип | Описание |
|----------|-----|----------|
| `draft_id` | string | ID черновика |

### Request Headers

Не требуются.

### Response (200 OK)

**Content-Type**: `text/html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Моя Компания</title>
  <style>
    /* CSS стили */
  </style>
</head>
<body>
  <header class="header">
    <!-- Header content -->
  </header>
  <main>
    <!-- Sections -->
  </main>
  <footer class="footer">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

### Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Draft not found"
  }
}
```

### Пример запроса

```bash
curl http://localhost:3001/api/drafts/clx1234567890abcdef/preview
```

### Примечания

- Preview генерируется на основе данных черновика
- Если `config` еще не сгенерирован, он создается автоматически
- HTML содержит встроенные стили и готов к отображению

---

## Дополнительные эндпоинты

### Загрузка логотипа

#### Endpoint

```
POST /api/drafts/:draft_id/logo
```

#### Request

**Content-Type**: `multipart/form-data`

**Body**: Файл в поле `file`

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clx9876543210fedcba",
    "filename": "clx9876543210fedcba.png",
    "originalName": "logo.png",
    "mimeType": "image/png",
    "size": 24560,
    "path": "./uploads/clx9876543210fedcba.png",
    "url": "/uploads/clx9876543210fedcba.png",
    "uploadedAt": "2024-01-15T10:15:00.000Z"
  }
}
```

#### Пример запроса

```bash
curl -X POST http://localhost:3001/api/drafts/clx1234567890abcdef/logo \
  -F "file=@logo.png"
```

### Получение site config

#### Endpoint

```
GET /api/drafts/:draft_id/config
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "brand": {
      "name": "Моя Компания",
      "industry": "tech",
      "logo": "/uploads/clx9876543210fedcba.png"
    },
    "theme": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#60A5FA"
    },
    "layout": {
      "header": {
        "showLogo": true,
        "logoUrl": "/uploads/clx9876543210fedcba.png",
        "navigation": [
          {
            "label": "Главная",
            "href": "/",
            "order": 1
          }
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
        }
      ],
      "footer": {
        "showBrand": true,
        "copyright": "© 2024 Моя Компания. All rights reserved.",
        "links": []
      }
    }
  }
}
```

### Health Check

#### Endpoint

```
GET /health
```

#### Response (200 OK)

```json
{
  "status": "ok",
  "service": "configurator-site"
}
```

---

## Типы данных

### Draft (Черновик)

```typescript
{
  id: string;                    // Уникальный ID (cuid2)
  brandName: string;            // Название бренда
  industry: string;              // Сфера деятельности
  logo?: Logo;                   // Логотип (опционально)
  steps: WizardStep[];          // Шаги мастера
  config?: SiteConfig;          // Сгенерированный config (опционально)
  expiresAt?: string;           // ISO 8601 дата истечения
  createdAt: string;            // ISO 8601 дата создания
  updatedAt: string;            // ISO 8601 дата обновления
}
```

### Logo (Логотип)

```typescript
{
  id: string;                   // ID файла
  filename: string;             // Имя файла
  originalName: string;         // Оригинальное имя
  mimeType: string;             // MIME тип
  size: number;                 // Размер в байтах
  path: string;                 // Путь к файлу
  url: string;                  // URL для доступа
  uploadedAt: string;           // ISO 8601 дата загрузки
}
```

### WizardStep (Шаг мастера)

```typescript
{
  stepNumber: number;           // Номер шага (1, 2, 3, ...)
  stepType: "brand-name" | "industry" | "logo" | "other";
  data: Record<string, unknown>; // Данные шага
  completed: boolean;           // Шаг завершен
}
```

---

## Примеры использования

### Полный цикл создания сайта

```bash
# 1. Создать черновик
DRAFT_ID=$(curl -X POST http://localhost:3001/api/drafts \
  -H "Content-Type: application/json" \
  -d '{"brandName":"Моя Компания","industry":"tech"}' \
  | jq -r '.data.id')

# 2. Обновить название
curl -X PATCH http://localhost:3001/api/drafts/$DRAFT_ID \
  -H "Content-Type: application/json" \
  -d '{"brandName":"Обновленное название"}'

# 3. Загрузить логотип
curl -X POST http://localhost:3001/api/drafts/$DRAFT_ID/logo \
  -F "file=@logo.png"

# 4. Получить текущее состояние
curl http://localhost:3001/api/drafts/$DRAFT_ID

# 5. Получить preview
curl http://localhost:3001/api/drafts/$DRAFT_ID/preview > preview.html

# 6. Мигрировать черновик в постоянный проект (после регистрации)
curl -X POST http://localhost:3001/api/drafts/$DRAFT_ID/migrate \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1234567890"}'
```

---

## Миграция черновика

### POST /api/drafts/:draft_id/migrate

Мигрирует черновик в постоянный проект пользователя после регистрации.

**Path Parameters:**
- `draft_id` (string) - ID черновика для миграции

**Request Body:**
```json
{
  "userId": "user_1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "siteId": "clx_new_site_id",
    "draftId": "clx_old_draft_id",
    "migratedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Draft not found"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Draft has expired"
  }
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "MIGRATION_ERROR",
    "message": "Failed to save site to database"
  }
}
```

**Процесс миграции:**
1. Валидация черновика (существование, срок действия, полнота данных)
2. Генерация site config (если еще не сгенерирован)
3. Сохранение в БД через внешний API
4. Удаление черновика из кеша (только при успешном сохранении)

**Примечания:**
- Миграция атомарна: если сохранение в БД не удалось, черновик остается в кеше
- После успешной миграции черновик удаляется и повторная миграция невозможна
- Подробная документация: `docs/migration/draft-migration.md`

---

## Ограничения и валидация

### Название бренда
- Минимум: 1 символ
- Максимум: 100 символов
- Обязательное поле при создании

### Сфера деятельности
- Минимум: 1 символ
- Обязательное поле при создании

### Логотип
- Максимальный размер: 5MB
- Разрешенные типы: `image/jpeg`, `image/png`, `image/svg+xml`, `image/webp`

### TTL
- По умолчанию: 24 часа
- Настраивается через `SITE_TTL_HOURS`
- Автоматически продлевается при активности (чтение/обновление)

