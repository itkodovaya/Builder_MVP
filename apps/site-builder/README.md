# Site Builder - Frontend Application

Frontend приложение для MVP конструктора сайтов.

## Описание

Это Next.js приложение предоставляет пользовательский интерфейс для создания сайтов через мастер из 3 шагов:
1. Название бренда
2. Сфера деятельности
3. Загрузка логотипа

## Запуск

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Структура

- `src/app/` - Next.js App Router страницы
- `src/components/` - React компоненты
- `src/lib/` - Утилиты и API клиент
- `src/config/` - Конфигурация приложения
- `src/types/` - TypeScript типы
- `src/hooks/` - React хуки

## Интеграция с Backend

Приложение взаимодействует с `services/configurator_site` через REST API.

