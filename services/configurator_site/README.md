# Site Configurator Service

Микросервис для генерации конфигурации сайта в MVP конструкторе.

## Назначение

Конфигуратор сайта — отдельный сервис, который:
- Работает с черновиками сайтов (draft)
- Генерирует site config на основе шагов мастера
- Отдаёт preview сайта
- Управляет временным хранением черновиков (TTL)
- **НЕ знает про пользователей и авторизацию**

## API Endpoints

### Health Check
- `GET /health` - Проверка работоспособности сервиса

### Drafts (Черновики)
- `POST /api/drafts` - Создать черновик сайта
- `GET /api/drafts/:id` - Получить черновик по ID
- `PATCH /api/drafts/:id` - Обновить данные черновика
- `DELETE /api/drafts/:id` - Удалить черновик

### Site Config
- `GET /api/drafts/:id/config` - Получить сгенерированный site config

### Preview
- `GET /api/drafts/:id/preview` - Получить preview сайта (HTML)

### File Upload
- `POST /api/drafts/:id/logo` - Загрузить логотип для черновика
- `GET /uploads/:filename` - Получить загруженный файл

### Migration
- `POST /api/drafts/:id/migrate` - Мигрировать черновик в постоянный проект пользователя

### Publishing
- `POST /api/sites/:siteId/publish` - Опубликовать сайт
- `GET /p/:siteId` - Получить опубликованный сайт (HTML)
- `GET /p/:siteId/styles.css` - Получить CSS сайта
- `GET /p/:siteId/assets/*` - Получить статические ресурсы

## Примеры использования

### Создание черновика
```bash
POST /api/drafts
Content-Type: application/json

{
  "brandName": "Моя Компания",
  "industry": "tech"
}
```

### Получение site config
```bash
GET /api/drafts/{draftId}/config
```

### Получение preview
```bash
GET /api/drafts/{draftId}/preview
```

## Структура

```
src/
├── api/         # REST маршруты
├── controllers/ # Контроллеры (связь API и бизнес-логики)
├── services/    # Бизнес-логика
├── models/      # Модели данных
├── schemas/     # Схемы валидации (Zod)
└── utils/       # Утилиты
```

## Запуск

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Конфигурация

Скопируйте `env.example` в `.env` и настройте переменные окружения.

### Redis (рекомендуется)

```env
STORAGE_TYPE=redis
REDIS_URL=redis://localhost:6379
REDIS_TTL_EXTEND_ON_READ=true
SITE_TTL_HOURS=24
```

### In-Memory (fallback)

```env
STORAGE_TYPE=memory
SITE_TTL_HOURS=24
```

При недоступности Redis сервис автоматически переключается на in-memory хранилище.

### Publishing (для публикации)

```env
PUBLISH_DIR=./published
PUBLISH_BASE_URL=http://localhost:3001
CSS_MINIFY=true
```

## Основные модули

### Storage Service
- Хранение черновиков в Redis (по умолчанию) или in-memory (fallback)
- Управление TTL
- Автоматическая очистка истекших черновиков
- Продление TTL при активности (чтение/обновление)

### Site Service
- Создание и обновление черновиков
- Валидация данных
- Координация между сервисами

### Config Service
- Генерация site config из черновика
- Преобразование данных мастера в структурированный config

### Preview Service
- Генерация HTML preview
- Рендеринг шаблонов
- Санитизация HTML для безопасности
- Генерация ETag для кеширования
- Валидация URL в config

### Migration Service
- Миграция черновиков в постоянные проекты
- Валидация черновиков для миграции
- Сохранение в БД через внешний API
- Удаление из кеша после успешной миграции

### Publish Service
- Генерация статического HTML из site config
- Извлечение и оптимизация CSS
- Минификация CSS для оптимизации
- Генерация полного статического сайта

### Static Site Storage
- Сохранение опубликованных сайтов в файловую систему
- Управление статическими ресурсами (логотипы)
- Предоставление доступа к опубликованным сайтам
- Защита от directory traversal

### File Upload Service
- Обработка загрузки файлов
- Валидация файлов
- Сохранение в файловую систему
