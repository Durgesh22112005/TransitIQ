# 🚌 TransitIQ – Intelligent Public Transit Optimization Platform

> **Phase 1 Foundation (Semester 7) – v1.0.0**

TransitIQ is a full-stack public transit management system built with Node.js, PostgreSQL, and React Native (Expo). This repository contains the foundational 20% of Phase 1.

---

## 🗂️ Project Structure

```
transitiq/
├── backend/                    # Node.js + Express + Prisma API
│   ├── prisma/
│   │   └── schema.prisma       # 6-model DB schema
│   ├── src/
│   │   ├── config/             # DB & env configuration
│   │   ├── controllers/        # Business logic (MVC)
│   │   ├── middleware/         # Auth, error, validation
│   │   ├── routes/             # Express route definitions
│   │   ├── validators/         # Input validation rules
│   │   └── utils/              # JWT & response helpers
│   ├── server.js
│   └── .env.example
│
├── driver-app/                 # React Native (Expo) – Driver App
│   ├── src/
│   │   ├── screens/            # 5 screens
│   │   ├── components/         # Reusable UI components
│   │   ├── navigation/         # Stack navigator
│   │   ├── context/            # Auth context
│   │   ├── services/           # Axios API client
│   │   └── constants/          # Design tokens
│   └── App.js
│
├── passenger-app/              # React Native (Expo) – Passenger App
│   ├── src/
│   │   ├── screens/            # 5 screens
│   │   ├── components/         # Reusable UI components
│   │   ├── navigation/         # Stack navigator
│   │   ├── context/            # Auth context
│   │   ├── services/           # Axios API client
│   │   └── constants/          # Design tokens
│   └── App.js
│
└── docs/
    ├── API.md                  # Full API reference
    └── INSTALLATION.md         # Setup guide
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Mobile | React Native (Expo) |
| Navigation | React Navigation v6 |
| HTTP Client | Axios |

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| **User** | Base authentication entity (ADMIN / DRIVER / PASSENGER) |
| **Driver** | Linked 1:1 to User, holds license and experience |
| **Bus** | Physical vehicle with capacity and status |
| **Route** | Transit route with start/end locations |
| **Stop** | Individual stops along a route (sequenced) |
| **Trip** | A journey instance linking Route + Driver + Bus |

---

## 🔌 API Endpoints (v1)

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /register`, `POST /login`, `GET /me` |
| Drivers | Full CRUD `/api/v1/drivers` |
| Buses | Full CRUD `/api/v1/buses` |
| Routes | Full CRUD + search `/api/v1/routes` |
| Stops | Full CRUD `/api/v1/stops` |

---

## 📱 App Screens

### Driver App
| Screen | Description |
|--------|-------------|
| Splash | Animated intro with auto-redirect |
| Login | Email/password authentication |
| Dashboard | Trip stats, quick actions, upcoming trip |
| Assigned Route | Stop timeline, route details, Start Trip button (UI) |
| Profile | Driver info, license, assigned bus |

### Passenger App
| Screen | Description |
|--------|-------------|
| Splash | Animated intro with auto-redirect |
| Login | Email/password authentication |
| Register | New account creation with validation |
| Home | Featured routes, quick destinations, search |
| Route Search | Debounced live search with filter chips |

---

## 🚀 Quick Start

```bash
# 1. Backend
cd backend && npm install
cp .env.example .env   # fill in DB credentials
npm run db:generate && npm run db:migrate
npm run dev

# 2. Driver App
cd driver-app && npm install && npm start

# 3. Passenger App
cd passenger-app && npm install && npm start
```

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for the full setup guide.

---

## 📖 Documentation

- [API Reference](docs/API.md) – All endpoints with request/response schemas
- [Installation Guide](docs/INSTALLATION.md) – Step-by-step setup

---

## 🚧 Phase 2 (Semester 8) – Coming Next

- Route Optimization (Google OR-Tools)
- Real-time GPS Tracking (Socket.IO)
- Analytics Dashboard
- ETA Prediction
- Offline Synchronization

---

## 🏗️ Architecture

```
MVC Pattern
├── Models    →  Prisma ORM (PostgreSQL)
├── Views     →  React Native screens
└── Controllers → Express route handlers

Security
├── Passwords  →  bcryptjs (salt rounds: 12)
├── Sessions   →  JWT (7-day expiry)
└── Roles      →  ADMIN / DRIVER / PASSENGER
```

---

*TransitIQ – Making public transit intelligent, one route at a time.* 🚌
