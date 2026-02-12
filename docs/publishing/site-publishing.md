# Pipeline публикации статического сайта

## Обзор

Pipeline публикации преобразует site config в статический сайт (HTML + CSS) и делает его доступным по URL `/p/{siteId}`.

## Процесс публикации

### Шаг 1: Валидация входных данных

```typescript
// Проверка наличия site config
const config = await getSiteConfig(siteId);
if (!config) {
  throw new Error('Site config not found');
}

// Валидация config
validateSiteConfig(config);
```

### Шаг 2: Генерация HTML

HTML генерируется с ссылкой на внешний CSS файл для оптимизации кеширования:

```typescript
const html = publishService.generateHTML(config, {
  inlineCSS: false,
  cssPath: `/p/${siteId}/styles.css`,
});
```

### Шаг 3: Генерация CSS

CSS извлекается из конфигурации и оптимизируется (минифицируется):

```typescript
const css = publishService.extractCSS(config);
const optimizedCSS = publishService.optimizeCSS(css);
```

### Шаг 4: Сохранение файлов

Файлы сохраняются в файловую систему:

```
published/
  {siteId}/
    index.html      # HTML с ссылкой на внешний CSS
    styles.css      # Отдельный CSS файл
    assets/         # Статические ресурсы (логотипы и т.д.)
      logo.png
```

### Шаг 5: Копирование статических ресурсов

Логотипы и другие ресурсы копируются в папку `assets/`:

```typescript
if (config.brand.logo) {
  await copyAsset(config.brand.logo, siteDir);
}
```

### Шаг 6: Доступ по URL

Опубликованный сайт доступен по URL:
- HTML: `/p/{siteId}`
- CSS: `/p/{siteId}/styles.css`
- Assets: `/p/{siteId}/assets/{filename}`

## API Endpoint

### POST /api/sites/:siteId/publish

Публикует сайт по siteId.

**Path Parameters:**
- `siteId` (string) - ID сайта для публикации

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "siteId": "clx_site_id",
    "url": "http://localhost:3001/p/clx_site_id",
    "publishedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Site not found"
  }
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "PUBLISH_ERROR",
    "message": "Site config is invalid: Brand name is required"
  }
}
```

## Структура опубликованного сайта

### HTML структура

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{brand.name}</title>
  <link rel="stylesheet" href="/p/{siteId}/styles.css">
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

### CSS структура

CSS генерируется на основе темы сайта и включает:
- Reset styles
- Typography
- Layout (header, footer, sections)
- Components (hero, services grid, etc.)
- Theme colors

CSS минифицируется для оптимизации размера.

## Конфигурация

### Переменные окружения

```env
# Директория для опубликованных сайтов
PUBLISH_DIR=./published

# Базовый URL для опубликованных сайтов
PUBLISH_BASE_URL=http://localhost:3001

# Оптимизация CSS (минификация)
CSS_MINIFY=true
```

## Оптимизация

### CSS минификация

CSS автоматически минифицируется для уменьшения размера:
- Удаление комментариев
- Удаление лишних пробелов
- Оптимизация селекторов

### Кеширование

- CSS вынесен в отдельный файл для кеширования браузером
- HTML содержит ссылку на внешний CSS
- Статические ресурсы (логотипы) кешируются отдельно

## Безопасность

### Защита от directory traversal

При доступе к assets проверяется, что путь находится внутри директории публикации:

```typescript
const resolvedPath = path.resolve(fullPath);
const resolvedPublishDir = path.resolve(this.publishDir);

if (!resolvedPath.startsWith(resolvedPublishDir)) {
  throw new Error('Invalid asset path');
}
```

### Санитизация HTML

HTML санитизируется для предотвращения XSS атак:
- Экранирование HTML сущностей
- Валидация URL
- Удаление опасных тегов и атрибутов

## Примеры использования

### Публикация сайта

```bash
curl -X POST http://localhost:3001/api/sites/clx_site_id/publish
```

### Доступ к опубликованному сайту

```bash
# HTML
curl http://localhost:3001/p/clx_site_id

# CSS
curl http://localhost:3001/p/clx_site_id/styles.css

# Asset
curl http://localhost:3001/p/clx_site_id/assets/logo.png
```

### Из фронтенда

```typescript
const publishSite = async (siteId: string) => {
  const response = await fetch(`/api/sites/${siteId}/publish`, {
    method: 'POST',
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Site published at:', result.data.url);
    window.open(result.data.url, '_blank');
  }
};
```

## Расширяемость

### Поддержка внешнего хранилища

Для будущего расширения до S3/CDN можно создать интерфейс:

```typescript
interface IStaticSiteStorage {
  saveSite(siteId: string, files: StaticSiteFiles): Promise<void>;
  getSiteHTML(siteId: string): Promise<string>;
  // ...
}

class LocalStorage implements IStaticSiteStorage { ... }
class S3Storage implements IStaticSiteStorage { ... }
```

## Мониторинг

Рекомендуется отслеживать:
- Количество публикаций
- Размер опубликованных сайтов
- Время генерации HTML/CSS
- Ошибки публикации

## Логирование

Все операции публикации логируются:
- Успешные публикации: `INFO` уровень
- Ошибки: `ERROR` уровень
- Детали процесса: `DEBUG` уровень (в development)

