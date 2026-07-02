# TransitIQ – Installation Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18.x | https://nodejs.org |
| npm | ≥ 9.x | Bundled with Node.js |
| PostgreSQL | ≥ 14.x | https://postgresql.org |
| Expo CLI | latest | `npm install -g expo-cli` |
| Expo Go (phone) | latest | App Store / Play Store |

---

## 1. Clone / Download the Project

```bash
# If using git:
git clone <your-repo-url>
cd transitiq

# Or extract the zip and cd into the folder
cd transitiq
```

---

## 2. Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

```bash
# Copy the example env file
copy .env.example .env   # Windows
# OR
cp .env.example .env      # macOS / Linux
```

Open `.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000

# Replace with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/transitiq_db?schema=public"

JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000,exp://localhost:8081
```

> **Tip:** Generate a strong secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 2.3 Create the PostgreSQL Database

Open `psql` or any PostgreSQL client:

```sql
CREATE DATABASE transitiq_db;
```

### 2.4 Run Prisma Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate
```

When prompted for migration name, enter something like: `init_schema`

### 2.5 Start the Backend

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

**Expected output:**
```
✅  Database connected successfully.
🚌  TransitIQ API running on http://localhost:5000
📋  Environment: development
📖  Health check: http://localhost:5000/health
```

> **Verify:** Visit `http://localhost:5000/health` in your browser.

---

## 3. Driver App Setup

### 3.1 Install Dependencies

```bash
cd driver-app
npm install
```

### 3.2 Configure API URL

Open `src/services/api.service.js` and update `BASE_URL`:

```js
// For Android emulator connecting to localhost backend:
const BASE_URL = 'http://10.0.2.2:5000/api/v1';

// For physical device (replace with your machine's local IP):
const BASE_URL = 'http://192.168.x.x:5000/api/v1';

// For iOS simulator:
const BASE_URL = 'http://localhost:5000/api/v1';
```

> **Find your local IP:**
> - Windows: `ipconfig` (look for IPv4 Address)
> - macOS/Linux: `ifconfig | grep inet`

### 3.3 Start the App

```bash
npm start
# or
expo start
```

Scan the QR code with **Expo Go** on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

---

## 4. Passenger App Setup

### 4.1 Install Dependencies

```bash
cd passenger-app
npm install
```

### 4.2 Configure API URL

Same as Driver App – update `src/services/api.service.js`:

```js
const BASE_URL = 'http://192.168.x.x:5000/api/v1';
```

### 4.3 Start the App

```bash
npm start
```

---

## 5. Create Your First Admin User

After the backend is running, register an admin account:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@transitiq.com",
    "password": "AdminPass1",
    "role": "ADMIN"
  }'
```

> **Note:** In production, restrict the `ADMIN` role registration to internal tooling.

---

## 6. Verify the Setup

### Backend API Tests

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test1234","role":"PASSENGER"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Get routes (use token from login)
curl http://localhost:5000/api/v1/routes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 7. Prisma Studio (Database UI)

```bash
cd backend
npm run db:studio
```

Opens `http://localhost:5555` – a visual interface to browse and edit database records.

---

## 8. Project Structure Reference

```
transitiq/
├── backend/          # Express + Prisma API
├── driver-app/       # Expo React Native – Driver
├── passenger-app/    # Expo React Native – Passenger
└── docs/             # This file + API.md
```

---

## 9. Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL` error on start | Verify PostgreSQL is running and credentials are correct |
| Prisma migration fails | Check if `transitiq_db` database exists in PostgreSQL |
| App can't connect to API | Update `BASE_URL` in api.service.js to your machine's LAN IP |
| `expo-linear-gradient` not found | Run `npm install` again in the app folder |
| Port 5000 already in use | Change `PORT` in `.env` |

---

## 10. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ❌ | `development` | Runtime environment |
| `PORT` | ❌ | `5000` | HTTP server port |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Token expiry duration |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | CORS allowed origins (comma-separated) |
