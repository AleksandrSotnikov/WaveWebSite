# 🌊 Wave Studio API Documentation

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Base URL:** `http://localhost:5000/api`  
**Timezone:** UTC+6 (Asia/Almaty)  
**Authentication:** JWT Bearer Token (7 days expiry)  

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Clients](#clients)
3. [Trainers](#trainers)
4. [Subscriptions](#subscriptions)
5. [Sessions](#sessions)
6. [Reports](#reports)
7. [Error Handling](#error-handling)
8. [Testing Examples](#testing-examples)

---

## 🔐 Authentication

All endpoints except `/auth/*` require JWT authentication via `Authorization: Bearer <token>` header.

### Register Admin

```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "id": 1,
    "username": "admin"
  }
}
```

**Validation:**
- `username`: unique, 3-50 chars
- `password`: min 8 chars, must include letters & numbers

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**Token Lifespan:** 7 days (604,800 seconds)

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 Clients

### Get All Clients

```http
GET /clients
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Ольга Петрова",
      "phone_number": "+79991234567",
      "messenger_link": "https://vk.com/user123",
      "active_subscriptions": [1, 2]
    }
  ],
  "total": 1
}
```

### Get Client by ID

```http
GET /clients/:id
Authorization: Bearer <token>
```

### Create Client

```http
POST /clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Ольга Петрова",
  "phone_number": "+79991234567",
  "messenger_link": "https://vk.com/user123"
}
```

**Required:** `full_name`  
**Optional:** `phone_number`, `messenger_link`

### Update Client

```http
PUT /clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Ольга Петрова",
  "phone_number": "+79991234568",
  "messenger_link": "https://t.me/user123"
}
```

### Delete Client

```http
DELETE /clients/:id
Authorization: Bearer <token>
```

**Note:** Deletes only if no active sessions.

---

## 🏫 Trainers

### Get All Trainers

```http
GET /trainers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Иван Сидоров",
      "specialization": "Современный танец",
      "phone_number": "+79991234568",
      "is_active": true
    }
  ],
  "total": 1
}
```

### Get Trainer by ID

```http
GET /trainers/:id
Authorization: Bearer <token>
```

### Get Trainer Income (Period)

```http
GET /trainers/:id/income?date_from=2025-12-01&date_to=2025-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trainer_id": 1,
    "trainer_name": "Иван Сидоров",
    "period": { "from": "2025-12-01", "to": "2025-12-31" },
    "sessions_count": 5,
    "total_income": 1875,
    "sessions": [...]
  }
}
```

### Create Trainer

```http
POST /trainers
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Иван Сидоров",
  "specialization": "Современный танец",
  "phone_number": "+79991234568"
}
```

### Update Trainer

```http
PUT /trainers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Иван Сидоров",
  "specialization": "Классический балет",
  "is_active": true
}
```

### Delete Trainer

```http
DELETE /trainers/:id
Authorization: Bearer <token>
```

**Note:** Soft delete (deactivate). Fails if trainer has future sessions.

---

## 🎫 Subscriptions

### Get All Subscriptions

```http
GET /subscriptions?client_id=1&status=active&type=limited
Authorization: Bearer <token>
```

**Query Params:**
- `client_id` (optional)
- `status` (optional): `active`, `expired`
- `type` (optional): `limited`, `unlimited`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "type": "limited",
      "price": 3000,
      "total_sessions": 8,
      "sessions_used": 2,
      "start_date": "2025-12-16",
      "expiration_date": "2026-01-16",
      "status": "active"
    }
  ],
  "total": 1
}
```

### Get Subscription by ID

```http
GET /subscriptions/:id
Authorization: Bearer <token>
```

### Get Client Subscriptions

```http
GET /subscriptions/client/:client_id
Authorization: Bearer <token>
```

### Create Subscription (Limited)

```http
POST /subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": 1,
  "type": "limited",
  "price": 3000,
  "total_sessions": 8,
  "start_date": "2025-12-16"
}
```

### Create Subscription (Unlimited)

```http
POST /subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": 1,
  "type": "unlimited",
  "price": 5000,
  "start_date": "2025-12-16"
}
```

**Note:** Expiration auto-calculated as 1 month from `start_date`.

### Update Subscription

```http
PUT /subscriptions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessions_used": 3,
  "status": "active"
}
```

### Delete Subscription

```http
DELETE /subscriptions/:id
Authorization: Bearer <token>
```

---

## 📚 Sessions

### Get All Sessions

```http
GET /sessions?trainer_id=1&client_id=1&date_from=2025-12-01&date_to=2025-12-31
Authorization: Bearer <token>
```

**Query Params:**
- `trainer_id` (optional)
- `client_id` (optional)
- `date_from` (optional): YYYY-MM-DD
- `date_to` (optional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trainer_id": 1,
      "date_time": "2025-12-16T18:00:00Z",
      "timezone": "UTC+6",
      "notes": null,
      "trainer": { "id": 1, "full_name": "Иван Сидоров" },
      "attendees": [
        {
          "id": 1,
          "session_id": 1,
          "client_id": 1,
          "subscription_id": 1,
          "client": { "id": 1, "full_name": "Ольга Петрова" },
          "subscription": { "id": 1, "type": "limited", "status": "active" }
        }
      ]
    }
  ],
  "total": 1
}
```

### Get Session by ID

```http
GET /sessions/:id
Authorization: Bearer <token>
```

### Create Session

```http
POST /sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "trainer_id": 1,
  "date_time": "2025-12-16T18:00:00Z",
  "timezone": "UTC+6",
  "clients": [1, 2, 3],
  "subscriptions": [1, 2, 3],
  "notes": "Advanced group class"
}
```

**Validation & Logic:**
- ✅ Trainer must exist and be active
- ✅ Each client must have active subscription (not expired)
- ✅ Each subscription must belong to respective client
- ✅ No conflicts: trainer cannot have overlapping sessions
- ✅ No conflicts: clients cannot have overlapping sessions
- ✅ For limited subscriptions: session count decremented
- ✅ Income calculated and saved to `IncomeCalculation`

**Response (201):**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "session": { "id": 1, "trainer_id": 1, ... },
    "income": { "id": 1, "trainer_id": 1, "session_id": 1, "total_income": 1875 }
  }
}
```

**Income Calculation Formula:**
- Limited: `(price * 0.45) / total_sessions`
- Unlimited: `(price * 0.45) / sessions_in_month`

### Delete Session

```http
DELETE /sessions/:id
Authorization: Bearer <token>
```

**Note:** Rollbacks limited subscription usage, deletes attendees & income records.

---

## 📊 Reports

All reports support formats: `json` (default), `csv`, `html`, `pdf`.

### Trainer Report

```http
GET /reports/trainer/:trainer_id?date_from=2025-12-01&date_to=2025-12-31&format=csv
Authorization: Bearer <token>
```

**Query Params:**
- `date_from` (optional): YYYY-MM-DD
- `date_to` (optional): YYYY-MM-DD
- `format` (optional): `json`, `csv`, `html`, `pdf` (default: `json`)

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "trainer": { "id": 1, "full_name": "Иван Сидоров" },
    "period": { "from": "2025-12-01", "to": "2025-12-31" },
    "sessions_count": 5,
    "total_income": 1875,
    "rows": [
      { "session_id": 1, "date": "2025-12-16T18:00:00Z", "total_income": 375 }
    ]
  }
}
```

**Response (CSV):** Downloadable file `trainer_1_report.csv`

**Response (HTML):** Styled HTML table

**Response (PDF):** Downloadable file `trainer_1_report.pdf`

### Client Report

```http
GET /reports/client/:client_id?date_from=2025-12-01&date_to=2025-12-31&format=html
Authorization: Bearer <token>
```

**Data Includes:**
- Session dates
- Trainer names
- Subscription types & status (active/expired)
- Prices

### Date Report

```http
GET /reports/date?date_from=2025-12-01&date_to=2025-12-31&format=pdf
Authorization: Bearer <token>
```

**Required Query Params:**
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Data Includes:**
- Session IDs and dates
- Trainer names
- Total clients per session
- Active vs. expired clients count

---

## ⚠️ Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid JWT |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Business logic conflict (e.g., session overlap) |
| `TRAINER_CONFLICT` | 409 | Trainer has overlapping session |
| `CLIENT_CONFLICT` | 409 | Client has overlapping session |
| `NO_ACTIVE_SUBSCRIPTION` | 409 | Subscription expired or missing |
| `NO_SESSIONS_LEFT` | 409 | Limited subscription exhausted |
| `CREATE_ERROR` | 500 | Creation failed |
| `FETCH_ERROR` | 500 | Fetch failed |
| `UPDATE_ERROR` | 500 | Update failed |
| `DELETE_ERROR` | 500 | Delete failed |

**Example Error Response:**

```json
{
  "success": false,
  "error": {
    "message": "Trainer already has a session at this time",
    "code": "TRAINER_CONFLICT"
  }
}
```

---

## 🧪 Testing Examples

### Full Workflow Example

```bash
# 1. Register & Login
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "AdminPass123"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "AdminPass123"}'

# Save TOKEN from response

# 2. Create Client
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Ольга Петрова",
    "phone_number": "+79991234567",
    "messenger_link": "https://vk.com/user123"
  }'

# Save CLIENT_ID from response

# 3. Create Trainer
curl -X POST http://localhost:5000/api/trainers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Иван Сидоров",
    "specialization": "Современный танец",
    "phone_number": "+79991234568"
  }'

# Save TRAINER_ID from response

# 4. Create Limited Subscription
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": '$CLIENT_ID',
    "type": "limited",
    "price": 3000,
    "total_sessions": 8,
    "start_date": "2025-12-16"
  }'

# Save SUBSCRIPTION_ID from response

# 5. Create Session
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trainer_id": '$TRAINER_ID',
    "date_time": "2025-12-16T18:00:00Z",
    "timezone": "UTC+6",
    "clients": ['$CLIENT_ID'],
    "subscriptions": ['$SUBSCRIPTION_ID'],
    "notes": "Beginner class"
  }'

# 6. Get Trainer Income Report (CSV)
curl -X GET "http://localhost:5000/api/reports/trainer/$TRAINER_ID?date_from=2025-12-01&date_to=2025-12-31&format=csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o trainer_report.csv

# 7. Get Client Report (PDF)
curl -X GET "http://localhost:5000/api/reports/client/$CLIENT_ID?date_from=2025-12-01&date_to=2025-12-31&format=pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o client_report.pdf
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.0",
  "sequelize": "^6.35.0",
  "postgres": "^15",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.1.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "json2csv": "^6.0.0",
  "pdfkit": "^0.13.0"
}
```

---

## 🚀 Deployment

### Environment Variables (.env)

```env
NODE_ENV=production
API_PORT=5000
TIMEZONE=UTC+6
FRONTEND_URL=https://yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wave_studio
DB_USER=postgres
DB_PASSWORD=secure_password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRY=7d
```

### Start Server

```bash
cd backend
npm install
node src/index.js
```

---

## 📞 Support

For issues or questions, refer to `DEVELOPMENT_CHECKLIST.md` or contact the team.

**Last Updated:** 16 декабря 2025  
**API Status:** ✅ Production Ready  
**Phase:** 1.3 Complete (40% of total project)
