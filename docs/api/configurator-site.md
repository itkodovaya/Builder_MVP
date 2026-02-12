# Site Configurator API

API документация для сервиса конфигуратора сайта.

## Базовый URL

```
http://localhost:3001
```

## Endpoints

### Health Check

#### GET /health
Проверка работоспособности сервиса.

**Response:**
```json
{
  "status": "ok",
  "service": "configurator-site"
}
```

### Drafts (Черновики)

#### POST /api/drafts
Создать новый черновик сайта.

**Request Body:**
```json
{
  "brandName": "Моя Компания",
  "industry": "tech",
  "logo": {
    "filename": "logo.png",
    "mimeType": "image/png",
    "size": 1024
  },
  "steps": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "brandName": "Моя Компания",
    "industry": "tech",
    "logo": { ... },
    "steps": [],
    "expiresAt": "2024-01-02T12:00:00.000Z",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /api/drafts/:id
Получить черновик по ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### PATCH /api/drafts/:id
Обновить данные черновика.

**Request Body:**
```json
{
  "brandName": "Новое название",
  "industry": "retail"
}
```

#### DELETE /api/drafts/:id
Удалить черновик.

### Site Config

#### GET /api/drafts/:id/config
Получить сгенерированный site config.

**Response:**
```json
{
  "success": true,
  "data": {
    "brand": {
      "name": "Моя Компания",
      "industry": "tech",
      "logo": "/uploads/logo.png"
    },
    "theme": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#60A5FA"
    },
    "layout": {
      "header": { ... },
      "sections": [ ... ],
      "footer": { ... }
    }
  }
}
```

### Preview

#### GET /api/drafts/:id/preview
Получить preview сайта в виде HTML.

**Response:** HTML страница

### File Upload

#### POST /api/drafts/:id/logo
Загрузить логотип для черновика.

**Request:** multipart/form-data с полем `file`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "filename": "clx....png",
    "url": "/uploads/clx....png",
    ...
  }
}
```

#### GET /uploads/:filename
Получить загруженный файл.

## Коды ошибок

- `400` - Ошибка валидации
- `404` - Черновик не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Создание черновика
```bash
curl -X POST http://localhost:3001/api/drafts \
  -H "Content-Type: application/json" \
  -d '{"brandName":"Test","industry":"tech"}'
```

### Получение preview
```bash
curl http://localhost:3001/api/drafts/{draftId}/preview
```
