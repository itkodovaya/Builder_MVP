# Механизм Preview сайта

## Краткое описание

Preview позволяет просматривать сгенерированный сайт на основе site config без авторизации. Preview строится динамически, безопасен и автоматически обновляется при изменениях.

## Формирование Preview

### Процесс

1. **Получение draft** по `draft_id`
2. **Генерация site config** (если не сгенерирован)
3. **Генерация HTML** из config через шаблоны
4. **Санитизация HTML** (удаление опасных элементов)
5. **Возврат HTML** с заголовками безопасности

### Алгоритм

```
GET /api/drafts/:draft_id/preview
  ↓
Получить draft
  ↓
Сгенерировать config (если нужно)
  ↓
Валидировать URLs
  ↓
Сгенерировать HTML
  ↓
Санитизировать HTML
  ↓
Сгенерировать ETag
  ↓
Проверить If-None-Match (304)
  ↓
Установить заголовки безопасности
  ↓
Вернуть HTML
```

## URL структура

### Формат

```
GET /api/drafts/:draft_id/preview
```

**Пример:**
```
http://localhost:3001/api/drafts/clx1234567890/preview
```

### Использование

```html
<!-- В iframe -->
<iframe src="http://localhost:3001/api/drafts/clx1234567890/preview" />

<!-- Прямой доступ -->
<a href="http://localhost:3001/api/drafts/clx1234567890/preview">Preview</a>
```

## Обновление при изменениях

### Механизм

1. **При обновлении draft:**
   - Config инвалидируется (устанавливается в `undefined`)
   - При следующем запросе preview config регенерируется

2. **При запросе preview:**
   - Проверяется наличие config
   - Если отсутствует → генерируется новый
   - HTML генерируется из нового config
   - Новый ETag генерируется из нового config

3. **Кеширование:**
   - ETag на основе hash config
   - Браузер кеширует preview
   - При изменении config меняется ETag → preview обновляется

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
// → Preview обновляется
```

## Безопасность

### Санитизация

- ❌ Удаление `<script>` тегов
- ❌ Удаление event handlers (`onclick`, `onerror`, etc.)
- ❌ Удаление `javascript:` протокола
- ❌ Удаление `<iframe>`, `<object>`, `<embed>`
- ✅ Экранирование HTML сущностей

### Content Security Policy

```
script-src 'none';        # JavaScript запрещен
style-src 'self' 'unsafe-inline';  # Только встроенные стили
img-src 'self' data: https:;       # Безопасные изображения
```

### Заголовки безопасности

- `Content-Security-Policy` - строгие правила
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

## Кеширование

### ETag

- Генерируется на основе hash config
- При изменении config меняется ETag
- Браузер обновляет preview при новом ETag

### Cache-Control

```
Cache-Control: public, max-age=300
```

- Кеш действителен 5 минут
- Обновляется при изменении config

## Особенности

- ✅ **Без авторизации** - preview доступен публично
- ✅ **Безопасный** - не исполняет пользовательский JS/HTML
- ✅ **Автообновление** - обновляется при изменениях draft
- ✅ **Кеширование** - эффективное использование ETag
- ✅ **Работает по draft_id** - все операции привязаны к ID черновика

Полная документация: [preview-mechanism.md](./preview-mechanism.md)

