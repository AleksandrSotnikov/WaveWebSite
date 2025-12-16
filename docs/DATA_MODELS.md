# 📊 Модели данных Wave Studio

Полное описание всех моделей данных приложения в формате JSON Schema.

## 1. Client (Клиент)

### Описание
Модель представляет клиента танцевальной студии с информацией о контактах и активных абонементах.

### JSON Schema
```json
{
  "type": "object",
  "required": ["id", "full_name", "phone_number"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор клиента"
    },
    "full_name": {
      "type": "string",
      "description": "ФИО клиента",
      "minLength": 3,
      "maxLength": 150
    },
    "phone_number": {
      "type": "string",
      "description": "Номер телефона в формате +7XXXXXXXXXX",
      "pattern": "^\\+7\\d{10}$"
    },
    "messenger_link": {
      "type": "string",
      "description": "Ссылка на VK или Telegram профиль (опционально)"
    },
    "active_subscriptions": {
      "type": "array",
      "description": "Массив ID активных абонементов",
      "items": {
        "type": "integer"
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания записи (ISO 8601)"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата последнего обновления (ISO 8601)"
    }
  }
}
```

### Пример
```json
{
  "id": 1,
  "full_name": "Александра Петрова",
  "phone_number": "+79991234567",
  "messenger_link": "https://vk.com/alexandra.petrova",
  "active_subscriptions": [5, 7],
  "created_at": "2025-12-16T10:30:00+06:00",
  "updated_at": "2025-12-16T10:30:00+06:00"
}
```

---

## 2. Trainer (Тренер)

### Описание
Модель представляет тренера танцевальной студии.

### JSON Schema
```json
{
  "type": "object",
  "required": ["id", "full_name"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор тренера"
    },
    "full_name": {
      "type": "string",
      "description": "ФИО тренера",
      "minLength": 3,
      "maxLength": 150
    },
    "specialization": {
      "type": "string",
      "description": "Специализация (например: 'Классический танец', 'Хип-хоп')"
    },
    "phone_number": {
      "type": "string",
      "description": "Номер телефона тренера"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания записи (ISO 8601)"
    }
  }
}
```

### Пример
```json
{
  "id": 1,
  "full_name": "Иван Сидоров",
  "specialization": "Современный танец",
  "phone_number": "+79991234568",
  "created_at": "2025-12-01T09:00:00+06:00"
}
```

---

## 3. Subscription (Абонемент)

### Описание
Модель представляет абонемент клиента на занятия (лимитированный или безлимитный).

### JSON Schema
```json
{
  "type": "object",
  "required": ["id", "client_id", "type", "price", "start_date", "expiration_date"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор абонемента"
    },
    "client_id": {
      "type": "integer",
      "description": "ID клиента, владельца абонемента"
    },
    "type": {
      "type": "string",
      "enum": ["limited", "unlimited"],
      "description": "Тип абонемента: лимитированный или безлимитный"
    },
    "price": {
      "type": "number",
      "description": "Стоимость абонемента (x)",
      "minimum": 0
    },
    "total_sessions": {
      "type": "integer",
      "description": "Количество занятий (n) для лимитированного абонемента, null для безлимитного",
      "minimum": 1,
      "nullable": true
    },
    "sessions_used": {
      "type": "integer",
      "description": "Количество использованных занятий",
      "minimum": 0
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Дата начала абонемента (YYYY-MM-DD)"
    },
    "expiration_date": {
      "type": "string",
      "format": "date",
      "description": "Дата истечения абонемента (YYYY-MM-DD)"
    },
    "status": {
      "type": "string",
      "enum": ["active", "expired"],
      "description": "Статус абонемента"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания записи (ISO 8601)"
    }
  }
}
```

### Примеры

**Лимитированный абонемент (8 занятий по 3000 руб)**
```json
{
  "id": 5,
  "client_id": 1,
  "type": "limited",
  "price": 3000,
  "total_sessions": 8,
  "sessions_used": 3,
  "start_date": "2025-12-16",
  "expiration_date": "2026-01-16",
  "status": "active",
  "created_at": "2025-12-16T10:30:00+06:00"
}
```

**Безлимитный абонемент (5000 руб в месяц)**
```json
{
  "id": 7,
  "client_id": 1,
  "type": "unlimited",
  "price": 5000,
  "total_sessions": null,
  "sessions_used": 0,
  "start_date": "2025-12-01",
  "expiration_date": "2026-01-01",
  "status": "active",
  "created_at": "2025-12-01T14:00:00+06:00"
}
```

---

## 4. Session (Тренировка)

### Описание
Модель представляет одну тренировку с информацией о тренере, времени, и посетивших клиентах.

### JSON Schema
```json
{
  "type": "object",
  "required": ["id", "trainer_id", "date_time"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор тренировки"
    },
    "trainer_id": {
      "type": "integer",
      "description": "ID тренера, проводящего тренировку"
    },
    "date_time": {
      "type": "string",
      "format": "date-time",
      "description": "Дата и время тренировки (ISO 8601 с указанием timezone)"
    },
    "timezone": {
      "type": "string",
      "description": "Часовой пояс для тренировки (например: UTC+6)"
    },
    "clients": {
      "type": "array",
      "description": "Массив ID клиентов, посетивших тренировку",
      "items": {
        "type": "integer"
      }
    },
    "subscription_used": {
      "type": "array",
      "description": "Массив ID абонементов, использованных для каждого клиента (соответствие с clients)",
      "items": {
        "type": "integer"
      }
    },
    "notes": {
      "type": "string",
      "description": "Заметки о тренировке (опционально)"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания записи (ISO 8601)"
    }
  }
}
```

### Пример
```json
{
  "id": 1,
  "trainer_id": 1,
  "date_time": "2025-12-16T19:00:00+06:00",
  "timezone": "UTC+6",
  "clients": [1, 2, 3],
  "subscription_used": [5, 5, 7],
  "notes": "Хорошее настроение, все выполняли задания",
  "created_at": "2025-12-16T19:10:00+06:00"
}
```

---

## 5. Admin User (Администратор)

### Описание
Модель представляет администратора с правами управления системой.

### JSON Schema
```json
{
  "type": "object",
  "required": ["id", "username", "password_hash"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор администратора"
    },
    "username": {
      "type": "string",
      "description": "Уникальное имя пользователя",
      "minLength": 3,
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9_-]+$"
    },
    "password_hash": {
      "type": "string",
      "description": "Хеш пароля (bcrypt)"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email для восстановления пароля (опционально)"
    },
    "role": {
      "type": "string",
      "enum": ["admin", "manager"],
      "description": "Роль администратора"
    },
    "is_active": {
      "type": "boolean",
      "description": "Активен ли пользователь"
    },
    "last_login": {
      "type": "string",
      "format": "date-time",
      "description": "Последний вход в систему (ISO 8601)",
      "nullable": true
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания записи (ISO 8601)"
    }
  }
}
```

### Пример
```json
{
  "id": 1,
  "username": "admin",
  "password_hash": "$2a$10$...",
  "email": "admin@wavestudio.ru",
  "role": "admin",
  "is_active": true,
  "last_login": "2025-12-16T10:30:00+06:00",
  "created_at": "2025-12-01T09:00:00+06:00"
}
```

---

## Связи между моделями

```
Client (1) ---> (Many) Subscription
         |
         |---> (Many) Session (через subscription_used)

Trainer (1) ---> (Many) Session

Subscription (1) ---> (Many) Session

AdminUser (управляет) все модели
```

---

## Примечания

- **Дата и время**: Все даты передаются в формате ISO 8601 с указанием timezone (например: `2025-12-16T19:00:00+06:00`)
- **Статус абонемента**: Рассчитывается автоматически на основе `expiration_date`
- **Хеширование паролей**: Используется bcrypt с salt из 10 раундов
- **Телефонные номера**: Должны быть в формате +7XXXXXXXXXX для России
