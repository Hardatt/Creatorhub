# Creator Dashboard — Feed Aggregator & Credit System

A full-stack web application for creators to aggregate content from multiple sources, earn credits through engagement, and manage their content experience.

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18 + Vite + Tailwind CSS |
| Backend    | Node.js + Express 4 |
| Database   | MySQL 8 + Sequelize ORM |
| Auth       | JWT (jsonwebtoken + bcrypt) |
| Cache      | Redis (ioredis) with in-memory fallback |
| Feed APIs  | Reddit public API + mock Twitter/LinkedIn |

---

## Project Structure

```
creator-dashboard/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route handlers (auth, user, credit, feed, post, report, admin)
│   ├── middlewares/     # Auth, role, validation
│   ├── models/          # Sequelize models (User, CreditHistory, SavedPost, Report, ActivityLog)
│   ├── routes/          # Express routers
│   ├── services/        # Cache, Credit, Feed logic
│   ├── utils/           # Token generator
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/  # PostCard, StatCard, ActivityFeed, Layout, Sidebar, Topbar
        ├── context/     # AuthContext (JWT state + refresh)
        ├── pages/       # Login, Register, Dashboard, Feed, SavedPosts, Admin
        └── services/    # Axios API client with interceptors
```

---

## Prerequisites

- Node.js 18+
- MySQL 8 running locally
- Redis (optional — falls back to in-memory cache automatically)

---

## Setup

### 1. Create the MySQL database

```sql
CREATE DATABASE creator_dashboard_dev;
```

### 2. Backend

```bash
cd backend
npm install
npm run dev       # nodemon (development)
# npm start       # node (production)
```

The server runs on **http://localhost:3005**.
All tables are auto-created via `sequelize.sync({ alter: true })` on first boot.

Edit `backend/.env` if your MySQL credentials differ from the defaults:

```env
DB_USER=
DB_PASS=
DB_NAME=
DB_HOST=
JWT_SECRET=
PORT=3005
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on **http://localhost:5173** and proxies `/api` to the backend.

---

## API Reference

### Auth
| Method | Endpoint            | Auth | Description            |
|--------|---------------------|------|------------------------|
| POST   | /api/auth/register  | No   | Register new user      |
| POST   | /api/auth/login     | No   | Login + daily credit   |
| GET    | /api/auth/me        | Yes  | Current user info      |

### Users
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | /api/users/profile    | Get own profile        |
| PUT    | /api/users/profile    | Update profile         |
| GET    | /api/users/activity   | Recent activity log    |

### Credits
| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| GET    | /api/credits/balance   | Current balance        |
| GET    | /api/credits/history   | Paginated history      |

### Feed
| Method | Endpoint            | Description                    |
|--------|---------------------|--------------------------------|
| GET    | /api/feed           | Aggregated feed (page, limit, source) |
| POST   | /api/feed/refresh   | Bust cache & re-fetch          |

### Posts
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| POST   | /api/posts/save         | Save a post (+2 cr) |
| DELETE | /api/posts/save/:postId | Unsave a post       |
| GET    | /api/posts/saved        | List saved posts    |
| POST   | /api/posts/share        | Log share (+2 cr)   |

### Reports
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | /api/reports      | Report a post (+2 cr)|
| GET    | /api/reports/mine | Own reports         |

### Admin (admin role required)
| Method | Endpoint                         | Description             |
|--------|----------------------------------|-------------------------|
| GET    | /api/admin/users                 | All users + balances    |
| PATCH  | /api/admin/users/:id/credits     | Manually adjust credits |
| GET    | /api/admin/reports               | All reports (filterable)|
| PATCH  | /api/admin/reports/:id           | Review / dismiss report |
| GET    | /api/admin/logs                  | All activity logs       |
| GET    | /api/admin/analytics             | Stats + top users       |

---

## Credit Rules

| Action             | Credits   |
|--------------------|-----------|
| Daily login        | +10       |
| Profile completion | +20 (once)|
| Save a post        | +2        |
| Share a post       | +2        |
| Report a post      | +2        |
| Admin adjustment   | ±custom   |

---

## Promoting a User to Admin

Register via the UI, then run in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Environment Variables (backend/.env)

| Variable          | Default                   | Description               |
|-------------------|---------------------------|---------------------------|
| PORT              | 3005                      | HTTP port                 |
| JWT_SECRET        | (set in .env)             | JWT signing secret        |
| DB_NAME           |                           | MySQL database name       |
| DB_USER           |                           | MySQL username            |
| DB_PASS           |                           | MySQL password            |
| DB_HOST           |                           | MySQL host                |
| REDIS_HOST        |                           | Redis host (optional)     |
| REDIS_PORT        |                           | Redis port (optional)     |
| FEED_CACHE_TTL    |                           | Feed cache TTL (seconds)  |
| REDDIT_SUBREDDITS | programming,webdev,javascript | Subreddits to pull    |
