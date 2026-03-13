# RUN — Running PharmaFind Locally

## Prerequisites

| Tool    | Version | Check             |
| ------- | ------- | ----------------- |
| Node.js | 20+     | `node -v`       |
| npm     | 9+      | `npm -v`        |
| Git     | any     | `git --version` |

No external database required — PharmaFind uses **SQLite** via Prisma.

---

## Step 1 — Install dependencies

```bash
# From project root
cd D:/ramdanAI

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## Step 2 — Configure environment

```bash
# Copy the example file
cp .env.example backend/.env
```

Edit `backend/.env` with your values:

```env
DATABASE_URL=file:./prisma/pharmafind.db
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## Step 3 — Set up the database

```bash
cd backend

# Run migrations (creates the SQLite file automatically)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Step 4 — Seed data

```bash
cd backend

npm run db:seed
```

Expected output:

```
Seeding medications...   ✓ 2,839 inserted
Seeding pharmacies...    ✓ 158 inserted
Seeding stock...         ✓ 19,140 inserted
Seed complete.
```

Verify with Prisma Studio:

```bash
npx prisma studio
# Open http://localhost:5555 and check table row counts
```

---

## Step 5 — Start the backend

```bash
cd backend
npm run dev
```

Server starts on **http://localhost:3001**

Health check:

```bash
curl http://localhost:3001/health
# → { "status": "ok" }
```

---

## Step 6 — Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Frontend starts on **http://localhost:3000**

| URL                                         | Page                    |
| ------------------------------------------- | ----------------------- |
| http://localhost:3000/fr                    | Home (French)           |
| http://localhost:3000/ar                    | Home (Arabic)           |
| http://localhost:3000/fr/search?q=doliprane | Search results          |
| http://localhost:3000/fr/on-duty            | On-duty pharmacies      |
| http://localhost:3000/fr/auth/login         | Pharmacist login        |
| http://localhost:3000/fr/auth/register      | Pharmacist registration |
| http://localhost:3000/fr/dashboard          | Pharmacist dashboard    |

---

## Quick smoke tests

```bash
# Search endpoint
curl "http://localhost:3001/api/v1/search?q=doliprane&lat=35.76&lng=-5.83"

# Autocomplete
curl "http://localhost:3001/api/v1/medications/autocomplete?q=doli"

# On-duty pharmacies
curl "http://localhost:3001/api/v1/on-duty?city=Tanger"
```

---

## Running tests

```bash
cd backend

# Unit + integration tests
npm test

# Load test (backend must be running on port 3001)
npx ts-node tests/load/search-load.ts
```

---

## Production build

```bash
# Backend
cd backend
npm run build       # outputs to dist/
npm start           # runs dist/index.js

# Frontend
cd frontend
npm run build       # outputs to .next/
npm start           # serves built app
```

---

## Common issues

| Problem                   | Fix                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL` missing  | Make sure `backend/.env` exists with `DATABASE_URL=file:./prisma/pharmafind.db`       |
| `JWT_SECRET missing`    | Make sure `backend/.env` exists and contains `JWT_SECRET`                             |
| `CORS error in browser` | Check that `FRONTEND_URL=http://localhost:3000` in `backend/.env` (no trailing slash) |
| Prisma client out of date | Run `cd backend && npx prisma generate`                                                 |
| Port already in use       | Change `PORT=3001` in `backend/.env` and update `NEXT_PUBLIC_API_URL` accordingly   |

---

*See `LAUNCH_CHECKLIST.md` for the production deployment checklist.*
