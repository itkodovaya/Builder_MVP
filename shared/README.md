# Shared Package

Общие типы, модели и утилиты для всех сервисов Builder MVP.

## Назначение

Пакет содержит:
- Общие TypeScript типы и интерфейсы
- Общие модели данных (пользователь, сайт, файл)
- Общие утилиты (логирование, работа с БД)

## Использование

```typescript
import { User, Site } from '@builder-mvp/shared';
import type { ApiResponse } from '@builder-mvp/shared';
```

## Структура

```
src/
├── types/    # Общие типы
├── models/   # Общие модели
└── utils/    # Общие утилиты
```

