# PharmaFind — Beta Launch Checklist (Tanger Pilot)

## Pre-Launch Infrastructure

- [ ] PostgreSQL 15+ deployed with extensions enabled (pg_trgm, PostGIS, uuid-ossp, unaccent)
- [ ] Run migrations: `cd backend && npx prisma migrate deploy`
- [ ] Run seed: `cd backend && npx ts-node prisma/seed.ts`
  - Verify: 2,839 medications, 158 Tanger pharmacies, 19,140 stock records
- [ ] Backend deployed on server, health check passing: `GET /health → { status: "ok" }`
- [ ] Frontend deployed (Vercel / VPS), environment variables set
- [ ] SSL certificate configured for both frontend and API domains

## Environment Variables — Production

```bash
# backend/.env
DATABASE_URL=postgresql://...
JWT_SECRET=<64+ char random string>
NODE_ENV=production
FRONTEND_URL=https://pharmafind.ma
PORT=3001

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.pharmafind.ma/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=fr
```

## CORS Verification

- [ ] `FRONTEND_URL` in backend matches exact production domain
- [ ] Test cross-origin requests from frontend to API succeed
- [ ] Preflight OPTIONS requests return 200

## Data Verification

- [ ] `SELECT COUNT(*) FROM medications;` → 2839
- [ ] `SELECT COUNT(*) FROM pharmacies WHERE is_active = true;` → 158
- [ ] `SELECT COUNT(*) FROM pharmacy_stock;` → 19140
- [ ] Search test: `GET /api/v1/search?q=doliprane` returns results
- [ ] Autocomplete test: `GET /api/v1/medications/autocomplete?q=doli` returns results

## Smoke Tests

- [ ] Homepage loads in FR and AR
- [ ] Search for "Doliprane" returns pharmacy cards
- [ ] Pharmacy detail page shows stock list
- [ ] On-duty page loads
- [ ] Pharmacist can register, login, and access dashboard
- [ ] Stock quick-toggle works

## Performance

- [ ] Run load test: `npx ts-node tests/load/search-load.ts` (server must be running)
  - Target: < 200ms average latency, < 500ms p99, 0 errors
- [ ] Lighthouse score > 90 on homepage (run from Chrome DevTools)

## Monitoring

- [ ] Backend logs are being collected (stdout → log aggregator)
- [ ] Set up uptime monitoring (UptimeRobot or similar) for `/health`
- [ ] Database connection pool configured (max 20 connections for production)

## Communication

- [ ] Onboarding guide distributed to first pharmacists: `ONBOARDING.md`
- [ ] Support email configured: `support@pharmafind.ma`

## Go/No-Go Criteria

| Check | Status |
|-------|--------|
| All critical API endpoints respond with correct data | ⬜ |
| Auth flow works end-to-end (register → login → stock update) | ⬜ |
| Search returns results for top 5 medications in Tanger | ⬜ |
| At least 10 pharmacies with fresh stock data (< 24h) | ⬜ |
| Error rate < 1% under normal load | ⬜ |

---
*PharmaFind Beta Launch — Tanger (Pilot City) — Target: Q1 2026*
