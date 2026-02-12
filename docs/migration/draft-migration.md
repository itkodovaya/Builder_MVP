# Миграция черновика в постоянный проект

## Обзор

После регистрации пользователь может перенести временный черновик сайта в постоянный проект. Процесс миграции включает:

1. Получение черновика из кеша (Redis)
2. Генерацию site config (если еще не сгенерирован)
3. Сохранение данных в БД через внешний API
4. Удаление черновика из кеша

## Процесс миграции

### Шаг 1: Пользователь регистрируется

Пользователь проходит процесс регистрации в сервисе авторизации и получает `user_id`.

### Шаг 2: Вызов API миграции

Сервис авторизации вызывает endpoint миграции в `configurator_site`:

```bash
POST /api/drafts/:draft_id/migrate
Content-Type: application/json

{
  "userId": "user_1234567890"
}
```

### Шаг 3: Валидация черновика

`configurator_site` проверяет:
- Существование черновика
- Не истек ли срок действия (TTL)
- Наличие обязательных данных (brandName, industry)

### Шаг 4: Генерация site config

Если site config еще не сгенерирован, он создается на основе данных черновика с использованием шаблонов.

### Шаг 5: Сохранение в БД

Данные отправляются во внешний API для сохранения в постоянной БД:

```typescript
POST {SITES_API_URL}/api/sites
Authorization: Bearer {SITES_API_TOKEN}
Content-Type: application/json

{
  "id": "new_site_id",
  "userId": "user_1234567890",
  "brandName": "Моя Компания",
  "industry": "tech",
  "logo": { ... },
  "config": { ... },
  "isTemporary": false,
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### Шаг 6: Удаление из кеша

После успешного сохранения в БД черновик удаляется из кеша (Redis).

### Шаг 7: Возврат результата

API возвращает результат миграции:

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

## API Endpoint

### POST /api/drafts/:draft_id/migrate

Мигрирует черновик в постоянный проект пользователя.

**Path Parameters:**
- `draft_id` (string, required) - ID черновика для миграции

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

## Конфигурация

### Переменные окружения

```env
# External API для сохранения сайтов
SITES_API_URL=http://localhost:3002
SITES_API_TOKEN=your_api_token_here

# Таймаут для внешнего API (в миллисекундах)
SITES_API_TIMEOUT=5000
```

## Обработка ошибок

### Сценарии ошибок

1. **Draft не найден**
   - Код: 404
   - Сообщение: "Draft not found"
   - Действие: Черновик уже удален или не существует

2. **Draft истек**
   - Код: 400
   - Сообщение: "Draft has expired"
   - Действие: Черновик истек по TTL, миграция невозможна

3. **Draft неполный**
   - Код: 400
   - Сообщение: "Draft is incomplete"
   - Действие: Отсутствуют обязательные данные (brandName, industry)

4. **Ошибка сохранения в БД**
   - Код: 500
   - Сообщение: "Failed to save site to database"
   - Действие: Внешний API недоступен или вернул ошибку

5. **Таймаут внешнего API**
   - Код: 500
   - Сообщение: "Request timeout after {timeout}ms"
   - Действие: Внешний API не ответил в течение заданного времени

### Транзакционность

Миграция должна быть атомарной:

1. **Успешная миграция:**
   - Сохранение в БД успешно → удаление из кеша
   - Возврат успешного результата

2. **Неудачная миграция:**
   - Сохранение в БД не удалось → НЕ удалять из кеша
   - Черновик остается доступным для повторной попытки
   - Возврат ошибки

3. **Частичная ошибка:**
   - Если удаление из кеша не удалось после успешного сохранения в БД:
     - Ошибка логируется, но не блокирует миграцию
     - Миграция считается успешной
     - Черновик может остаться в кеше до истечения TTL

## Пример использования

### Из сервиса авторизации

```typescript
// После успешной регистрации пользователя
const userId = newUser.id;
const draftId = registrationData.draftId;

try {
  const response = await fetch(
    `${CONFIGURATOR_API_URL}/api/drafts/${draftId}/migrate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    throw new Error('Migration failed');
  }

  const result = await response.json();
  console.log('Site migrated:', result.data.siteId);
} catch (error) {
  console.error('Migration error:', error);
  // Обработка ошибки
}
```

### Из фронтенда (через сервис авторизации)

```typescript
// После регистрации пользователя
const migrateDraft = async (draftId: string, userId: string) => {
  const response = await fetch('/api/auth/migrate-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ draftId, userId }),
  });

  return response.json();
};
```

## Безопасность

1. **Валидация userId:**
   - userId должен быть валидирован сервисом авторизации
   - configurator_site не проверяет существование пользователя

2. **Авторизация внешнего API:**
   - Используется Bearer token для аутентификации
   - Token должен быть защищен и не передаваться клиенту

3. **Защита от повторной миграции:**
   - После успешной миграции черновик удаляется из кеша
   - Повторная миграция того же черновика невозможна

## Мониторинг

Рекомендуется отслеживать:
- Количество успешных миграций
- Количество ошибок миграции
- Время выполнения миграции
- Ошибки внешнего API

## Логирование

Все операции миграции логируются:
- Успешные миграции: `INFO` уровень
- Ошибки: `ERROR` уровень
- Детали процесса: `DEBUG` уровень (в development)

