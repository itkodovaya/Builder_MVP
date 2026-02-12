# Механизм Preview сайта

## Обзор

Механизм preview позволяет просматривать сгенерированный сайт на основе site config без авторизации. Preview строится динамически из config и автоматически обновляется при изменениях.

## Формирование Preview

### Процесс генерации

1. **Получение draft по ID**
   ```typescript
   const draft = await storage.getDraft(draftId);
   ```

2. **Генерация site config** (если не сгенерирован или инвалидирован)
   ```typescript
   const config = await siteService.generateSiteConfig(draftId);
   ```

3. **Генерация HTML из config**
   ```typescript
   const html = previewService.generatePreview(config);
   ```

4. **Санитизация HTML** (безопасность)
   ```typescript
   const sanitizedHtml = previewService.sanitizeHtml(html);
   ```

5. **Возврат HTML** с правильными заголовками

### Алгоритм

```
GET /api/drafts/:draft_id/preview
  ↓
1. Получить draft по ID
  ↓
2. Проверить существование draft
  ↓
3. Сгенерировать site config (если нужно)
  ↓
4. Валидировать URLs в config
  ↓
5. Сгенерировать HTML из config
  ↓
6. Санитизировать HTML (удалить опасные теги/атрибуты)
  ↓
7. Сгенерировать ETag для кеширования
  ↓
8. Проверить If-None-Match (304 Not Modified)
  ↓
9. Установить заголовки безопасности
  ↓
10. Вернуть HTML с Content-Type: text/html
```

## URL структура

### Формат URL

```
GET /api/drafts/:draft_id/preview
```

**Примеры:**
- `http://localhost:3001/api/drafts/clx1234567890/preview`
- `http://localhost:3001/api/drafts/clx9876543210/preview`

### Полный URL

```typescript
const previewUrl = `${API_BASE_URL}/api/drafts/${draftId}/preview`;
```

**Пример:**
```
http://localhost:3001/api/drafts/clx1234567890abcdef/preview
```

### Использование в iframe

```html
<iframe 
  src="http://localhost:3001/api/drafts/clx1234567890/preview"
  title="Site Preview"
  className="w-full h-screen"
/>
```

### Использование в браузере

Preview можно открыть напрямую в браузере:
```
http://localhost:3001/api/drafts/clx1234567890/preview
```

## Обновление при изменениях

### Стратегия обновления

1. **Инвалидация config при обновлении draft**
   - При обновлении draft поле `config` устанавливается в `undefined`
   - Это заставляет регенерировать config при следующем запросе preview

2. **Регенерация config**
   - При запросе preview проверяется наличие config
   - Если config отсутствует или инвалидирован, генерируется новый
   - Новый config используется для генерации HTML

3. **ETag для кеширования**
   - ETag генерируется на основе hash config
   - Браузер кеширует preview, но обновляется при изменениях
   - При изменении config меняется hash, меняется ETag, preview обновляется

### Процесс обновления

```
1. Пользователь обновляет draft
   ↓
2. Draft сохраняется в storage
   ↓
3. Config инвалидируется (устанавливается в undefined)
   ↓
4. При следующем запросе preview:
   - Config отсутствует → генерируется новый
   - HTML генерируется из нового config
   - Новый ETag генерируется из нового config
   - Preview обновляется
```

### Пример

```typescript
// Обновление draft
await siteService.updateDraft(draftId, {
  brandName: "Новое название"
});
// Config автоматически инвалидируется

// При следующем запросе preview
GET /api/drafts/{draftId}/preview
// → Config регенерируется
// → HTML генерируется заново
// → Preview обновляется
```

## Безопасность

### Санитизация HTML

Preview не исполняет пользовательский JS/HTML благодаря санитизации:

1. **Удаление script тегов**
   - Все `<script>` теги удаляются
   - Содержимое script тегов не выполняется

2. **Удаление event handlers**
   - Все атрибуты `onclick`, `onerror`, `onload` и т.д. удаляются
   - JavaScript не может быть выполнен через event handlers

3. **Экранирование опасных протоколов**
   - `javascript:` протокол удаляется из href/src
   - `data:text/html` удаляется

4. **Удаление опасных элементов**
   - `<iframe>`, `<object>`, `<embed>` теги удаляются
   - `<style>` теги удаляются (стили генерируются сервером)

5. **Экранирование HTML сущностей**
   - Специальные символы экранируются (`<`, `>`, `&`, `"`, `'`)
   - Предотвращает XSS атаки

### Content Security Policy

Устанавливаются строгие CSP заголовки:

```
Content-Security-Policy: 
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  script-src 'none';
  object-src 'none';
  frame-ancestors 'self';
```

**Ограничения:**
- ❌ JavaScript полностью запрещен (`script-src 'none'`)
- ✅ Встроенные стили разрешены (`style-src 'unsafe-inline'`)
- ✅ Изображения разрешены (`img-src 'self' data: https:`)
- ✅ Шрифты разрешены (`font-src 'self' data:`)

### Дополнительные заголовки безопасности

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

## Кеширование

### ETag

ETag генерируется на основе hash config:

```typescript
const configHash = crypto.createHash('md5')
  .update(JSON.stringify(config))
  .digest('hex');
const etag = `"${configHash}"`;
```

### Проверка If-None-Match

Если браузер отправляет заголовок `If-None-Match` с тем же ETag:
- Сервер возвращает `304 Not Modified`
- Браузер использует кешированную версию
- Экономия трафика и времени

### Cache-Control

```
Cache-Control: public, max-age=300
```

- `public` - может кешироваться прокси
- `max-age=300` - кеш действителен 5 минут

### Инвалидация кеша

При обновлении draft:
1. Config инвалидируется (удаляется)
2. При следующем запросе генерируется новый config
3. Новый config → новый hash → новый ETag
4. Браузер получает новый ETag → обновляет preview

## Типы секций

### Hero секция

```typescript
{
  type: 'hero',
  content: {
    title: string,
    subtitle: string,
    ctaText?: string,
    ctaHref?: string
  }
}
```

### About секция

```typescript
{
  type: 'about',
  content: {
    title: string,
    description: string
  }
}
```

### Services секция

```typescript
{
  type: 'services',
  content: {
    title: string,
    description?: string,
    items: Array<{
      title: string,
      description: string
    }>
  }
}
```

### Contact секция

```typescript
{
  type: 'contact',
  content: {
    title: string,
    email?: string,
    phone?: string
  }
}
```

### Custom секция

```typescript
{
  type: 'custom',
  content: Record<string, unknown>
}
```

## Примеры использования

### Получение preview URL

```typescript
const previewUrl = `${API_BASE_URL}/api/drafts/${draftId}/preview`;
```

### Открытие preview в iframe

```tsx
<iframe 
  src={previewUrl}
  title="Site Preview"
  className="w-full h-screen border rounded-lg"
/>
```

### Проверка обновления preview

```typescript
// После обновления draft
await siteService.updateDraft(draftId, { brandName: "Новое название" });

// При следующем запросе preview автоматически обновится
// благодаря инвалидации config и новому ETag
```

## Ограничения

### Что НЕ поддерживается

- ❌ Пользовательский JavaScript
- ❌ Пользовательский HTML (только через config)
- ❌ Внешние скрипты
- ❌ iframe, object, embed
- ❌ Инлайн стили (кроме генерируемых сервером)

### Что поддерживается

- ✅ Текст и изображения
- ✅ Ссылки (безопасные)
- ✅ Стили (генерируемые сервером)
- ✅ Структурированный контент
- ✅ Адаптивная верстка

## Производительность

### Оптимизации

1. **Кеширование через ETag**
   - Браузер кеширует preview
   - Обновляется только при изменениях

2. **Ленивая генерация config**
   - Config генерируется только при необходимости
   - Кешируется в draft до инвалидации

3. **Санитизация на сервере**
   - HTML санитизируется один раз
   - Браузер получает готовый безопасный HTML

### Метрики

- Генерация config: ~10-50ms
- Генерация HTML: ~5-20ms
- Санитизация: ~1-5ms
- **Общее время**: ~20-75ms

## Отладка

### Проверка ETag

```bash
curl -I http://localhost:3001/api/drafts/{draftId}/preview
# Смотрим заголовок ETag
```

### Проверка обновления

```bash
# Первый запрос
curl http://localhost:3001/api/drafts/{draftId}/preview > preview1.html

# Обновляем draft
curl -X PATCH http://localhost:3001/api/drafts/{draftId} \
  -H "Content-Type: application/json" \
  -d '{"brandName":"Новое название"}'

# Второй запрос (должен вернуть новый ETag)
curl -I http://localhost:3001/api/drafts/{draftId}/preview
```

