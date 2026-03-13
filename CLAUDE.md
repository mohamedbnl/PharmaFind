# PharmaFind — CLAUDE.md

## 1. PROJECT OVERVIEW

**App Name:** PharmaFind (فارمافايند)
**Tagline:** Find your medication. Find it now.

**Purpose:** A digital health platform connecting citizens in Morocco with nearby pharmacies to locate available medications in real-time. Citizens search without creating an account; pharmacists register to manage their stock visibility.

**Target Users:**
- **Citizens:** Any person in Morocco needing to find a specific medication quickly — parents, elderly caregivers, chronic patients, emergencies at 2am.
- **Pharmacists:** Licensed pharmacy owners/staff who maintain their stock status and gain visibility.

**Core Problem:** Finding whether a specific medication is available at a nearby pharmacy requires physically visiting or calling multiple pharmacies. During off-hours, locating the on-duty pharmacy ("pharmacie de garde") is especially difficult.

**Key Success Metrics (V1):**
- Number of successful searches (citizen found a pharmacy with the medication)
- Pharmacist onboarding rate (time to first stock update < 5 minutes)
- Stock data freshness (% of records updated within 24 hours)
- Citizen feedback accuracy rate
- On-duty pharmacy lookup usage

**Regulatory Context:**
- Pharmacy council: CNOP (Conseil National de l'Ordre des Pharmaciens du Maroc)
- Pharmacist license numbers issued by CNOP, used for verification
- Controlled substances flagged with badge, never hidden
- No prices displayed in V1 (pricing regulations are complex)

**Pilot City:** Tanger / طنجة (real data available — 158 pharmacies, 2,839 medications, 19,140 stock records)

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router) | SSR for SEO, RSC for performance |
| Styling | Tailwind CSS 3+ | Built-in RTL via `dir="rtl"` |
| i18n | next-intl | App Router support, RTL-aware |
| Maps | Leaflet 1.9+ / React-Leaflet 4+ | Free, no API key, OpenStreetMap tiles |
| Backend | Node.js 20+ / Express 4 | |
| Database | PostgreSQL 15+ with pg_trgm, PostGIS, uuid-ossp, unaccent | Fuzzy search + geospatial |
| ORM | Prisma 5+ | Type-safe, schema-as-code |
| Auth | JWT (access 15m + refresh 7d) | Pharmacist-only, stateless |
| Password | bcrypt | |
| Validation | Zod | Shared frontend/backend schemas |
| HTTP Client | Axios | Interceptors for token refresh |
| Testing | Jest + RTL (frontend), Jest + Supertest (backend) | |

---

## 3. ARCHITECTURE

### 3.1 Folder Structure

```
pharmafind/
├── CLAUDE.md
├── package.json                 # Root workspace config
├── .env.example
├── .eslintrc.js / .prettierrc
│
├── frontend/                    # Next.js 14 App
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── middleware.ts             # i18n locale detection
│   ├── messages/
│   │   ├── ar.json
│   │   └── fr.json
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── [locale]/
│       │   │   ├── layout.tsx   # Root layout (RTL/LTR, fonts)
│       │   │   ├── page.tsx     # Home — search hero
│       │   │   ├── search/page.tsx
│       │   │   ├── pharmacy/[id]/page.tsx
│       │   │   ├── on-duty/page.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   ├── stock/page.tsx
│       │   │   │   ├── profile/page.tsx
│       │   │   │   └── analytics/page.tsx
│       │   │   ├── auth/login/page.tsx
│       │   │   ├── auth/register/page.tsx
│       │   │   └── not-found.tsx
│       │   └── api/revalidate/route.ts
│       ├── components/
│       │   ├── ui/              # Button, Input, Select, Badge, Card, Modal, Spinner, EmptyState, ErrorState, Skeleton
│       │   ├── layout/          # Header, Footer, Sidebar, LanguageSwitcher, MobileNav
│       │   ├── search/          # SearchBar, SearchResults, PharmacyCard, StockBadge, FreshnessBadge, SearchFilters
│       │   ├── map/             # PharmacyMap, PharmacyMarker, MapPopup
│       │   ├── pharmacy/        # PharmacyDetail, OperatingHours, StockList, DirectionsButton
│       │   ├── dashboard/       # StockTable, StockUpdateForm, QuickUpdateModal, ProfileForm, AnalyticsChart
│       │   ├── on-duty/         # OnDutyList, OnDutyMap
│       │   └── feedback/        # AccuracyFeedback
│       ├── hooks/               # useGeolocation, useDebounce, useAuth, useMedications, usePharmacies, useStock, useOnDuty
│       ├── lib/                 # api.ts (Axios), auth.ts, constants.ts, freshness.ts, utils.ts
│       ├── providers/           # QueryProvider, AuthProvider
│       ├── styles/globals.css
│       └── types/               # pharmacy.ts, medication.ts, stock.ts, user.ts, api.ts
│
├── backend/                     # Express API
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts              # Reads CSV files from project root
│   └── src/
│       ├── index.ts
│       ├── config/              # database.ts, env.ts, cors.ts
│       ├── middleware/          # auth.ts, validate.ts, errorHandler.ts, rateLimiter.ts, logger.ts
│       ├── routes/              # index.ts, auth/pharmacy/medication/stock/search/onDuty/report/alert .routes.ts
│       ├── controllers/         # auth/pharmacy/medication/stock/search/onDuty/report/alert .controller.ts
│       ├── services/            # auth/pharmacy/medication/stock/search/onDuty/report/alert/freshness .service.ts
│       ├── validators/          # auth/pharmacy/medication/stock/search/report .validator.ts
│       ├── utils/               # jwt.ts, password.ts, pagination.ts, geo.ts, errors.ts
│       └── types/express.d.ts
│
└── shared/
    └── src/
        ├── types.ts
        ├── constants.ts         # StockStatus enum
        └── validators.ts        # Shared Zod schemas
```

### 3.2 Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| React components | PascalCase, named export | `export function PharmacyCard()` |
| Hooks | camelCase, `use` prefix | `useGeolocation.ts` |
| Route/Controller/Service files | camelCase with suffix | `onDuty.routes.ts`, `pharmacy.service.ts` |
| DB tables | snake_case, plural | `pharmacy_stock`, `on_duty_schedules` |
| DB columns | snake_case | `license_number`, `last_confirmed_at` |
| API endpoints | kebab-case, plural nouns | `/api/v1/pharmacies`, `/api/v1/on-duty` |
| Env vars | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |
| TS types | PascalCase, no `I` prefix | `Pharmacy`, `StockStatus` |
| Enums | PascalCase name, SCREAMING_SNAKE values | `StockStatus.AVAILABLE` |

### 3.3 API Endpoints

Base URL: `http://localhost:3001/api/v1`

**Auth**
| Method | Path | Auth |
|--------|------|------|
| POST | /auth/register | No |
| POST | /auth/login | No |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Yes |
| GET | /auth/me | Yes |

**Pharmacies**
| Method | Path | Auth |
|--------|------|------|
| GET | /pharmacies | No |
| GET | /pharmacies/:id | No |
| POST | /pharmacies | Yes |
| PUT | /pharmacies/:id | Yes (owner) |
| DELETE | /pharmacies/:id | Yes (owner) |
| GET | /pharmacies/:id/stock | No |
| GET | /pharmacies/nearby | No |

**Medications**
| Method | Path | Auth |
|--------|------|------|
| GET | /medications | No |
| GET | /medications/:id | No |
| POST | /medications | Yes |
| PUT | /medications/:id | Yes |
| GET | /medications/autocomplete?q= | No |

**Stock**
| Method | Path | Auth |
|--------|------|------|
| GET | /stock/:pharmacyId | No |
| POST | /stock | Yes (owner) |
| PUT | /stock/:id | Yes (owner) |
| DELETE | /stock/:id | Yes (owner) |
| PUT | /stock/bulk-update | Yes (owner) |

**Search**
| Method | Path | Auth |
|--------|------|------|
| GET | /search?q=&lat=&lng=&radius=&status= | No |
| GET | /search/suggestions?q= | No |

**On-Duty**
| Method | Path | Auth |
|--------|------|------|
| GET | /on-duty?city=&date= | No |
| GET | /on-duty/now?lat=&lng= | No |
| POST | /on-duty | Yes |
| PUT | /on-duty/:id | Yes |
| DELETE | /on-duty/:id | Yes |

**Reports & Alerts**
| Method | Path | Auth |
|--------|------|------|
| POST | /reports | No |
| GET | /reports?pharmacyId= | Yes (owner) |
| POST | /alerts | No |
| GET | /alerts/:id | No |
| DELETE | /alerts/:id | No |

**Standard Response Envelope:**
```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }
{ "success": false, "error": { "code": "PHARMACY_NOT_FOUND", "message": "..." } }
```

### 3.4 Database Schema

> All tables include: `id UUID PK DEFAULT uuid_generate_v4()`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`. Soft deletes via `deleted_at TIMESTAMPTZ` where noted.

#### users
| Column | Type | Constraints |
|--------|------|------------|
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL — format +212XXXXXXXXX |
| license_number | VARCHAR(50) | UNIQUE NOT NULL — CNOP |
| role | VARCHAR(20) | DEFAULT 'pharmacist' |
| is_verified | BOOLEAN | DEFAULT false |
| refresh_token | TEXT | NULLABLE |
| last_login_at | TIMESTAMPTZ | NULLABLE |

#### pharmacies
| Column | Type | Constraints |
|--------|------|------------|
| user_id | UUID | FK -> users.id NOT NULL |
| osm_id | VARCHAR(50) | NULLABLE — OpenStreetMap node ID |
| name_fr | VARCHAR(255) | NOT NULL |
| name_ar | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | UNIQUE NOT NULL |
| address_fr | TEXT | NOT NULL |
| address_ar | TEXT | NULLABLE |
| city | VARCHAR(100) | NOT NULL |
| region | VARCHAR(100) | NOT NULL |
| postcode | VARCHAR(10) | NULLABLE |
| latitude | DECIMAL(10,7) | NOT NULL |
| longitude | DECIMAL(10,7) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| whatsapp | VARCHAR(20) | NULLABLE |
| email | VARCHAR(255) | NULLABLE |
| operating_hours | JSONB | NOT NULL — see structure below |
| is_24h | BOOLEAN | DEFAULT false |
| license_number | VARCHAR(50) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| photo_url | VARCHAR(500) | NULLABLE |
| deleted_at | TIMESTAMPTZ | NULLABLE |

**operating_hours JSONB:**
```json
{
  "monday":    { "open": "08:30", "close": "20:00" },
  "friday":    { "open": "08:30", "close": "12:30", "open2": "14:30", "close2": "20:00" },
  "saturday":  { "open": "09:00", "close": "13:00" },
  "sunday":    null
}
```

#### medications
| Column | Type | Constraints |
|--------|------|------------|
| name_fr | VARCHAR(255) | NOT NULL |
| name_ar | VARCHAR(255) | NULLABLE |
| generic_name_fr | VARCHAR(255) | NULLABLE |
| generic_name_ar | VARCHAR(255) | NULLABLE |
| dci | VARCHAR(255) | NULLABLE — INN generic name |
| category | VARCHAR(100) | NULLABLE |
| form | VARCHAR(100) | NOT NULL — COMPRIME, GELULE, SIROP, etc. |
| dosage | VARCHAR(100) | NULLABLE |
| manufacturer | VARCHAR(255) | NULLABLE |
| requires_prescription | BOOLEAN | DEFAULT false |
| is_controlled | BOOLEAN | DEFAULT false |
| barcode | VARCHAR(13) | NULLABLE — EAN-13, Moroccan prefix 6118 |
| search_vector | TSVECTOR | GENERATED — GIN indexed |

**Indexes:** GIN on `search_vector`; GIN pg_trgm on `name_fr`, `name_ar`, `generic_name_fr`, `dci`.

#### pharmacy_stock
| Column | Type | Constraints |
|--------|------|------------|
| pharmacy_id | UUID | FK -> pharmacies.id NOT NULL |
| medication_id | UUID | FK -> medications.id NOT NULL |
| status | VARCHAR(20) | NOT NULL — AVAILABLE/LOW_STOCK/OUT_OF_STOCK/ARRIVING_SOON |
| quantite | INTEGER | DEFAULT 0 |
| estimated_restock_hours | INTEGER | DEFAULT 0 — values: 0,6,12,24,48,72 |
| notes | TEXT | NULLABLE |
| last_confirmed_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

**Constraint:** UNIQUE(pharmacy_id, medication_id)

#### on_duty_schedules
| Column | Type | Constraints |
|--------|------|------------|
| pharmacy_id | UUID | FK -> pharmacies.id NOT NULL |
| duty_date | DATE | NOT NULL |
| start_time | TIME | NOT NULL — usually 20:00 |
| end_time | TIME | NOT NULL — usually 08:00 next day |
| is_overnight | BOOLEAN | DEFAULT true |
| city | VARCHAR(100) | NOT NULL |
| source | VARCHAR(50) | DEFAULT 'manual' — manual/cnop_import/admin |

**Constraint:** UNIQUE(pharmacy_id, duty_date)

#### citizen_reports
| Column | Type | Constraints |
|--------|------|------------|
| pharmacy_id | UUID | FK -> pharmacies.id NOT NULL |
| medication_id | UUID | FK -> medications.id NULLABLE |
| stock_id | UUID | FK -> pharmacy_stock.id NULLABLE |
| report_type | VARCHAR(30) | NOT NULL — accuracy_confirm/accuracy_deny/pharmacy_closed/wrong_info |
| comment | TEXT | NULLABLE |
| reporter_ip | VARCHAR(45) | NULLABLE — hashed |

#### search_logs
| Column | Type | Constraints |
|--------|------|------------|
| query | VARCHAR(500) | NOT NULL |
| normalized_query | VARCHAR(500) | NULLABLE |
| latitude | DECIMAL(10,7) | NULLABLE |
| longitude | DECIMAL(10,7) | NULLABLE |
| city | VARCHAR(100) | NULLABLE |
| results_count | INTEGER | NOT NULL |
| selected_pharmacy_id | UUID | FK -> pharmacies.id NULLABLE |
| language | VARCHAR(5) | DEFAULT 'fr' |

#### alerts
| Column | Type | Constraints |
|--------|------|------------|
| medication_id | UUID | FK -> medications.id NOT NULL |
| city | VARCHAR(100) | NOT NULL |
| latitude | DECIMAL(10,7) | NULLABLE |
| longitude | DECIMAL(10,7) | NULLABLE |
| contact_type | VARCHAR(10) | NOT NULL — email/phone |
| contact_value | VARCHAR(255) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| notified_at | TIMESTAMPTZ | NULLABLE |
| expires_at | TIMESTAMPTZ | NOT NULL — 7 days from creation |

---

## 4. USER WORKFLOWS

### 4.1 Citizen Search Flow
1. Landing page — hero search bar in French and Arabic
2. Autocomplete fires after 2 characters; shows FR + AR matches with form/dosage
3. Browser requests geolocation; if denied, show city selector
4. Loading skeleton while API responds
5. Results page — list left / map right (mobile: toggle); cards show pharmacy name, distance, stock status badge, freshness indicator, open/closed, WhatsApp button; sorted by distance default
6. Pharmacy detail page — full stock list, operating hours, directions (Google Maps/Waze), WhatsApp button (`https://wa.me/212XXXXXXXXX`), feedback widget
7. Feedback — thumbs up/down + optional comment → POST /reports

### 4.2 Pharmacist Dashboard Flow
1. Login → JWT httpOnly cookie (access) + localStorage (refresh)
2. Dashboard overview — total medications listed, searches this week, pending updates
3. Stock management — quick-toggle status, add from catalog, bulk update, "Confirm all" refreshes last_confirmed_at
4. Profile management — edit name, hours, contact, photo
5. Analytics (V1) — top searched medications in area, pharmacy search impressions

### 4.3 Onboarding Flow
1. Register — email, password, full name, phone, CNOP license
2. Create pharmacy — name (FR+AR), address, city, GPS pin, phone, WhatsApp, hours
3. Add initial stock — search catalog, set statuses
4. Go live — target: under 5 minutes total

### 4.4 Edge Cases
- **Stale data:** Freshness badge on last_confirmed_at (see §6.2); stale results ranked lower
- **Zero results:** Suggest nearby cities, "Notify me" alert CTA, on-duty pharmacies as fallback
- **2am emergency:** Prominent on-duty button on homepage; on-duty results prioritized 20:00–08:00
- **Medication variants:** pg_trgm handles typos; DCI links brand equivalents; search_vector includes all name variants
- **Language:** Detect Arabic script input to prioritize ar columns; search always spans all columns

---

## 5. CODING RULES

### 5.1 React Component Patterns
- Functional components, named exports only (no default exports)
- One component per file; `'use client'` only when client interactivity needed
```tsx
export function PharmacyCard({ pharmacy, distance }: PharmacyCardProps) { ... }
```

### 5.2 State Management
- **Server state:** React Query (TanStack Query) — no Redux
- **Client state:** useState (local), useContext (auth, locale)
- **URL state:** Next.js searchParams for filters/pagination (shareable URLs)

### 5.3 Data Fetching Pattern
```tsx
export function useNearbyPharmacies(params: SearchParams) {
  return useQuery({
    queryKey: ['pharmacies', 'nearby', params],
    queryFn: () => api.get('/search', { params }),
    staleTime: 2 * 60 * 1000,
    enabled: !!params.lat && !!params.lng,
  });
}
```

### 5.4 Error Handling
```ts
// backend/src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown[]
  ) { super(message); }
}
// Usage: throw new AppError('PHARMACY_NOT_FOUND', 404, 'Pharmacy not found');
```
- Global error handler catches all thrown errors; never leak stack traces in production
- All controller methods wrapped in asyncHandler

### 5.5 Loading/Empty/Error State Pattern
Every list/data component must implement:
```tsx
if (isLoading) return <Skeleton variant="list" count={3} />;
if (error) return <ErrorState message={t('errors.loadFailed')} onRetry={refetch} />;
if (!data?.length) return <EmptyState icon={PillIcon} message={t('search.noResults')} />;
return <ResultsList data={data} />;
```

### 5.6 i18n / RTL
- next-intl with locale prefix routes: `/fr/search`, `/ar/search`
- Locale detection: Accept-Language → cookie → default `fr`
- Tailwind `rtl:` variant for RTL-specific styles
```tsx
// frontend/src/app/[locale]/layout.tsx
const dir = locale === 'ar' ? 'rtl' : 'ltr';
return <html lang={locale} dir={dir}><body className={cn('font-sans', locale === 'ar' && 'font-arabic')}>{children}</body></html>;
```

### 5.7 API Response Standardization
```ts
res.json({ success: true, data: pharmacy });
res.json({ success: true, data: pharmacies, meta: { page, limit, total, totalPages } });
res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '...' } });
```

### 5.8 File & Code Conventions
- `strict: true` in all tsconfigs; no `any` — use `unknown` and narrow
- Absolute imports via `@/` alias
- No barrel files — import directly from component file
- Max ~300 lines per file; comments for "why" only

---

## 6. DATA DECISIONS

### 6.1 Stock Status Enum

```ts
enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ARRIVING_SOON = 'ARRIVING_SOON',
}
```

| Status | FR Label | AR Label | Color | CSV value |
|--------|----------|----------|-------|-----------|
| AVAILABLE | Disponible | متوفر | green-500 | `Disponible` |
| LOW_STOCK | Stock faible | مخزون منخفض | yellow-500 | `Stock faible` |
| OUT_OF_STOCK | Indisponible | غير متوفر | red-500 | `Indisponible` |
| ARRIVING_SOON | Sur commande | قيد الطلب | blue-500 | `Sur commande` |

### 6.2 Freshness / Confidence Calculation

```ts
function getFreshnessLevel(lastConfirmedAt: Date): FreshnessLevel {
  const h = (Date.now() - lastConfirmedAt.getTime()) / 3600000;
  if (h < 6)  return { level: 'verified',          color: 'green',  label_fr: 'Verifié',           label_ar: 'مؤكد' };
  if (h < 24) return { level: 'recent',             color: 'yellow', label_fr: 'Récent',             label_ar: 'حديث' };
  if (h < 72) return { level: 'possibly_outdated',  color: 'orange', label_fr: 'Peut-être obsolète', label_ar: 'قد يكون قديماً' };
  return       { level: 'unverified',               color: 'red',    label_fr: 'Non vérifié',        label_ar: 'غير مؤكد' };
}
```

Search ranking applies a freshness penalty — stale results ranked lower even if geographically closer.

### 6.3 Medication Name Matching (pg_trgm)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
-- SET pg_trgm.similarity_threshold = 0.2;

CREATE INDEX idx_med_name_fr_trgm   ON medications USING GIN (name_fr gin_trgm_ops);
CREATE INDEX idx_med_name_ar_trgm   ON medications USING GIN (name_ar gin_trgm_ops);
CREATE INDEX idx_med_generic_trgm   ON medications USING GIN (generic_name_fr gin_trgm_ops);
CREATE INDEX idx_med_dci_trgm       ON medications USING GIN (dci gin_trgm_ops);

SELECT id, name_fr, name_ar, dci,
  GREATEST(
    similarity(unaccent(lower(name_fr)), unaccent(lower($1))),
    similarity(unaccent(lower(coalesce(name_ar,''))), unaccent(lower($1))),
    similarity(unaccent(lower(coalesce(dci,''))), unaccent(lower($1)))
  ) AS score
FROM medications
WHERE unaccent(lower(name_fr)) % unaccent(lower($1))
   OR unaccent(lower(coalesce(name_ar,''))) % unaccent(lower($1))
   OR unaccent(lower(coalesce(dci,''))) % unaccent(lower($1))
ORDER BY score DESC LIMIT 10;
```

### 6.4 Open/Closed Calculation

```ts
function isPharmacyOpen(operatingHours: OperatingHours, now = new Date()): boolean {
  if (/* is_24h */) return true;
  const moroccoNow = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
  const day = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][moroccoNow.getDay()];
  const s = operatingHours[day];
  if (!s) return false;
  const t = `${String(moroccoNow.getHours()).padStart(2,'0')}:${String(moroccoNow.getMinutes()).padStart(2,'0')}`;
  if (t >= s.open && t < s.close) return true;
  if (s.open2 && s.close2 && t >= s.open2 && t < s.close2) return true;
  return false;
}
```

### 6.5 Seed Data — CSV Import

Real data lives in the project root. The seed script (`backend/prisma/seed.ts`) reads these files directly:

**`dim_medicament.csv`** (2,839 rows) → `medications` table
```
columns: code(barcode), nom(name_fr), dci, forme(form), dosage
```

**`dim_pharmacie.csv`** (158 rows) → `pharmacies` table
```
columns: pharmacie_id(import key), osm_id, name(split FR+AR), address, postcode, lat, lon,
         type_garde(normal|garde_nuit|garde_24h), open_time, close_time
import logic:
  - garde_24h  → is_24h=true, operating_hours all days 00:00–23:59
  - garde_nuit → is_24h=false, create on_duty_schedules entry
  - normal     → expand open_time/close_time to JSONB for Mon–Fri+Sat
  - name split: text before first Arabic character = name_fr, remainder = name_ar
```

**`bridge_stock_pharmacie_rebuilt.csv`** (19,140 rows) → `pharmacy_stock` table
```
columns: pharmacie_id(FK), medicament_id(FK), disponible, quantite, stock_status, estimated_restock_hours, last_update
import after pharmacies + medications seeded; map pharmacie_id/medicament_id to UUID PKs via import lookup table
status mapping: Disponible→AVAILABLE, Stock faible→LOW_STOCK, Indisponible→OUT_OF_STOCK, Sur commande→ARRIVING_SOON
```

---

## 7. PROGRESS TRACKER

Progress tracked via task system (44 tasks across 5 phases). Use `TaskList` to view current status.

---

## 8. KNOWN CONSTRAINTS & DECISIONS

### V1 Exclusions
| Feature | Reason |
|---------|--------|
| In-app chat | WhatsApp is universal in Morocco |
| Medication prices | Pricing regulations complex; not core to "find availability" |
| POS integration | Requires vendor partnerships; Phase 2+ |
| Reservation system | Adds no-show/payment complexity; Phase 2+ |
| Native mobile apps | Responsive web + PWA sufficient for V1 |
| Pharmacy reviews | Perverse incentives; factual data only |
| Citizen accounts | Zero-friction search is the priority |
| Multi-country | Morocco only in V1 |
| Admin dashboard | Admin ops via Prisma Studio in V1 |
| Push notifications | Alerts are passive in V1 |

### Key Trade-offs
1. **Manual stock updates:** Avoids POS integration complexity; freshness decay makes staleness visible
2. **pg_trgm over Elasticsearch:** Simpler infra; sufficient for V1 (< 100K medications active). Migrate if > 500K
3. **No price display:** Pricing is regulated and uniform; adds complexity without value
4. **City-by-city launch:** On-duty schedules require manual entry per city; launch Tanger first (data ready)
5. **French default locale:** French dominates pharmacy/medical contexts in Morocco
6. **No email verification in V1:** CNOP license number used for identity instead
7. **PostGIS over Haversine:** DB-level geospatial is faster and more accurate

### Open Questions
- [ ] Can CNOP provide a digital API for license verification?
- [ ] Is there a public data source for pharmacie de garde schedules?
- [ ] Should Darija (Moroccan dialect) be a separate search input or folded into Arabic fuzzy matching?
- [ ] Default search radius: 5km urban, 20km rural?
- [ ] Controlled substances: hide or show with prescription badge?
- [ ] WhatsApp Business API vs simple `wa.me` deep links?

### Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/pharmafind
JWT_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
SEARCH_DEFAULT_RADIUS_KM=5
SEARCH_MAX_RADIUS_KM=50
TRGM_SIMILARITY_THRESHOLD=0.2
```

---

## 9. DATASETS

Three CSV files in project root (`D:\ramdanAI\`) provide real Moroccan data for immediate import.

### dim_medicament.csv
- **2,839 medications** from the Moroccan national catalog
- EAN-13 barcodes with prefix `6118` (Morocco)
- French names only in source; `name_ar` and `category` fields remain nullable for future enrichment
- `requires_prescription` and `is_controlled` not in source — default false, enrich manually

### dim_pharmacie.csv
- **158 pharmacies** in Tanger / طنجة (postcode 90000, lat ~35.78, lon ~-5.81)
- OSM-sourced: `osm_id` format `node/XXXXXXXXX`
- Bilingual names in one field (split on first Arabic character)
- Guard types: 125 `normal`, 20 `garde_nuit`, 12 `garde_24h`
- Hours are flat `open_time`/`close_time` — expand to JSONB on import (same hours Mon–Sat)

### bridge_stock_pharmacie_rebuilt.csv
- **19,140 stock records** covering 158 pharmacies × 2,657 unique medications (~121 entries/pharmacy)
- `estimated_restock_hours` values: 0, 6, 12, 24, 48, 72
- `last_update` range: 2026-03-07 to 2026-03-12 (current week — data is fresh)
- Import order: medications first → pharmacies → bridge (FK dependency)
- `pharmacie_id` and `medicament_id` are integer keys from CSVs; map to UUID PKs via in-memory lookup during seed
