# 🚀 Настройка Wave Studio

## Предварительные требования

### системные требования
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 14+ (https://www.postgresql.org/)
- npm или yarn
- Git

### Опционально
- Docker & Docker Compose для контейнеризации
- редис (аккеш высоколоадных операций)

---

## Быстрая установка (с Docker)

### 1. Клонирование репозитория
```bash
git clone https://github.com/AleksandrSotnikov/WaveWebSite.git
cd WaveWebSite
```

### 2. Окружение
```bash
# Скопируйте .env.example в .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Эдит backend/.env если нужно
```

### 3. Открытие Docker сервисов
```bash
docker-compose up -d
```

сервисы будут автоматически запущены:
- PostgreSQL: `localhost:5432`
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### 4. Проверка
```bash
# Проверить health check
curl http://localhost:5000/health

# Открыть frontend
open http://localhost:3000
```

---

## Ручная установка (без Docker)

### 1. Настройка PostgreSQL
```bash
# база данных
createdb wave_studio

# пользователь
psql -d wave_studio -c "CREATE USER wave_user WITH PASSWORD 'wave_password';"
psql -d wave_studio -c "GRANT ALL PRIVILEGES ON DATABASE wave_studio TO wave_user;"
```

### 2. Backend установка
```bash
cd backend

# Получить зависимости
npm install

# Настройка .env данных
cp .env.example .env

# редактируйте .env если нужно
nano .env

# Повторить базу и seed данные
npm run migrate
npm run seed

# Открытие сервера
npm start
```

### 3. Frontend установка
```bash
cd frontend

# Получить зависимости
npm install

# Настройка .env
cp .env.example .env

# Открытие dev сервера
npm run dev
```

---

## Вторая авторизация

### учетные данные админа по умолчанию
```
username: admin
password: Admin123456
```

> УМО:ЛЧАНО изменить данные в производстве!

---

## Миграция базы данных

### Новая миграция
```bash
cd backend
npm run migrate -- --create users
```

### Поселные данные
```bash
cd backend
npm run seed
```

---

## Видео проверки установки

### Проверить доступность
```bash
# Определить backend
curl http://localhost:5000/health

# Определить frontend
curl http://localhost:3000

# Определить базу данных
psql -U wave_user -d wave_studio -c "SELECT 1;"
```

### Посмотреть логи
```bash
# Backend логи (Docker)
docker logs wave_backend -f

# Frontend логи (Docker)
docker logs wave_frontend -f

# PostgreSQL логи (Docker)
docker logs wave_postgres -f
```

---

## Остановка и чистка

### Утре Docker контейнери
```bash
# Остановить сервисы
docker-compose down

# Остановить и удалить все данные
docker-compose down -v
```

### Перестройка
```bash
# Перестройка контейнеров
docker-compose build --no-cache
docker-compose up -d
```

---

## Файлы коннфигурации

### backend/.env
```env
DATABASE_URL=postgresql://wave_user:wave_password@localhost:5432/wave_studio
NODE_ENV=development
API_PORT=5000
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
TIMEZONE=UTC+6
```

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Wave Studio
VITE_TIMEZONE=UTC+6
```

---

## Порты по умолчанию

| Сервис | Порт | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| Health Check | 5000 | http://localhost:5000/health |
| API Docs | 5000 | http://localhost:5000/api |

---

## Кулинарная книга

### Ода даты
```bash
# Чищению данные
psql -U wave_user -d wave_studio -c "TRUNCATE TABLE sessions, subscriptions, clients, trainers CASCADE;"

# Определить номер следующего ID
psql -U wave_user -d wave_studio -c "ALTER SEQUENCE clients_id_seq RESTART WITH 1;"
```

### Новые лонир логи
```bash
# Backend
rm backend/logs/*.log 2>/dev/null || true

# Проверить если не отображаются
docker-compose logs --tail=50
```

---

## Нроблемоэрешение

### Порт уже занят
```bash
# Linux/Mac
lsof -i :5000
lsof -i :3000
lsof -i :5432

# Windows
netstat -ano | findstr :5000

# Остановить процесс
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### PostgreSQL не подключается
```bash
# Проверить что спопар запущен
docker ps | grep postgres

# Проверить бала снова
docker-compose down
docker-compose up -d postgres
sleep 5
# Проверить здоровье шапа
docker ps
```

### Неверные данные таблицы
```bash
# Пересоздать таблицы
cd backend
npm run migrate -- --reset
npm run seed
```

---

## Онлайн ресурсы

- [Node.js документация](https://nodejs.org/en/docs/)
- [PostgreSQL документация](https://www.postgresql.org/docs/)
- [React документация](https://react.dev/)
- [Express.js примеры](https://expressjs.com/)

