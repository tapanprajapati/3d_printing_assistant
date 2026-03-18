# 3D Printing Business Manager — Implementation Plan

## Context
Build a full-stack web app from scratch for a 3D printing enthusiast/small business owner. The app manages filament inventory, products (coasters, games, etc.), digital assets (images, 3D models), marketplace listings (Etsy-first), print job tracking, cost calculation, and analytics. Single-user, auth-protected, mobile-friendly with a modern aesthetic.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router, `src/` dir, TypeScript)
- **Database**: SQLite (default, zero-setup) → PostgreSQL 16 (production upgrade path) via Prisma ORM
- **Auth**: NextAuth.js v5 (credentials provider, bcryptjs)
- **UI**: shadcn/ui + Tailwind CSS + next-themes (dark/light)
- **Forms**: React Hook Form + Zod
- **Data fetching**: TanStack Query v5
- **Charts**: Recharts
- **File uploads**: react-dropzone → local `public/uploads/`
- **Icons**: lucide-react

---

## Suggested Features to Include
Beyond the requested core, include these additional features:
1. **Print Cost Calculator** — inline margin calculator (filament cost + electricity + labor + platform fee → profit %)
2. **Print Queue / Job Tracker** — Kanban board (Queued → In Progress → Completed)
3. **Filament Usage Log** — auto-deduct grams on job completion; manual log entries
4. **Low Stock Alerts** — per-filament threshold (falls back to global setting); badge in topbar + dashboard widget
5. **Revenue & Profit Analytics** — monthly bar chart, top products by margin, filament usage pie chart
6. **App Settings** — electricity rate ($/kWh), labor rate ($/hr), default platform fee %, currency symbol, global low-stock threshold

---

## Database Strategy: SQLite → PostgreSQL

Prisma abstracts the database engine — switching requires only 2 changes:
1. `schema.prisma` datasource: change `provider = "sqlite"` → `provider = "postgresql"` and update `url`
2. `DATABASE_URL` env var: change from `file:./dev.db` → a PostgreSQL connection string

**Schema portability rules (follow these to keep migration painless):**
- Use `Float` instead of `Decimal` for monetary/weight fields — SQLite maps `Decimal` to `Real`, which can cause subtle precision issues; `Float` is explicit and consistent across both
- Avoid `@db.*` type annotations (e.g. `@db.Text`) — these are database-specific; omit them and let Prisma use defaults
- All other Prisma features (enums, relations, indexes) work identically on both

**SQLite setup (default — zero install):**
```
DATABASE_URL="file:./prisma/dev.db"
```
Run `npx prisma db push` and the `.db` file is created automatically.

**PostgreSQL upgrade path (when ready for production):**
```
DATABASE_URL="postgresql://user:password@host:5432/printing_assistant"
```
Change `provider` in schema.prisma, run `npx prisma migrate dev --name init` to generate a proper migration.

---

## Database Schema (Prisma)

**Models:** `User`, `AppSettings`, `Filament`, `FilamentUsageLog`, `Product`, `ProductVariant`, `ProductAsset`, `MarketplaceListing`, `PrintJob`

Key design decisions:
- `Filament.purchasePriceTotal / totalWeightG` = cost-per-gram (computed, not stored)
- `ProductAsset` handles both images (isPrimary, sortOrder) and model files (version, versionNote) via `assetType` enum
- `MarketplaceListing.price` is independent from `ProductVariant.sellingPrice` (platform promos can differ)
- `PrintJob` loosely links to product/variant/filament (all optional — supports standalone test prints)
- All price/weight fields use `Float` (not `Decimal`) for SQLite→PostgreSQL portability
- Enums: `FilamentType` (PLA, PETG, ABS, ASA, TPU, NYLON, RESIN, PLA_PLUS, SILK_PLA, WOOD_FILL, METAL_FILL, OTHER), `ProductStatus`, `AssetType`, `ListingStatus`, `PrintJobStatus`

---

## Page Routes

| Route | Purpose |
|---|---|
| `/login` | Credentials login |
| `/` | Dashboard: KPI cards, low-stock alerts, quick actions, recent jobs |
| `/filaments` | Filterable card grid with color swatches + progress bars |
| `/filaments/new` | Create filament |
| `/filaments/[id]` | Edit filament detail |
| `/filaments/[id]/usage` | Paginated usage log + manual entry |
| `/products` | Product list with category tabs, status filter, search |
| `/products/new` | Create product |
| `/products/[id]` | Tabbed detail: Overview, Variants, Assets, Listings |
| `/print-queue` | Kanban board (3 status columns) |
| `/print-queue/[id]` | Job detail + completion form |
| `/calculator` | Interactive cost/margin calculator |
| `/analytics` | Revenue, profit, filament usage charts |
| `/settings` | App-wide configuration form |

---

## Layout Architecture

- **Desktop**: Collapsible sidebar (icon-only → icon+label)
- **Mobile**: Fixed bottom navigation bar (top 5 nav items)
- **Route groups**: `(auth)` for login (clean layout), `(dashboard)` for all protected pages (sidebar shell)
- **Middleware**: NextAuth middleware protects all `/(dashboard)` routes

---

## Key API Routes

All routes check `getServerSession`; return 401 if unauthenticated.

- `CRUD /api/filaments`, `/api/filaments/[id]/usage`
- `CRUD /api/products`, `/api/products/[id]/variants`, `/api/products/[id]/assets`, `/api/products/[id]/listings`
- `CRUD /api/print-jobs`
- `POST /api/uploads` — multipart handler, saves to `public/uploads/{images|models}/`, returns path
- `POST /api/calculator` — stateless, wraps pure `cost-calculator.ts` function
- `GET /api/analytics` — aggregated monthly revenue/profit, top products, filament usage
- `GET/PATCH /api/settings`

---

## Critical Files

| File | Why Critical |
|---|---|
| `prisma/schema.prisma` | Foundation — every route/form derives from it; build and validate first |
| `src/lib/auth.ts` | NextAuth config; every protected route depends on it |
| `src/app/(dashboard)/layout.tsx` | Shell layout all protected pages inherit |
| `src/lib/utils/cost-calculator.ts` | Core business logic; pure function used client-side + API |
| `src/app/api/uploads/route.ts` | File upload handler; needed by all asset management features |

---

## Implementation Order (10 Phases)

| Phase | Focus | Key Deliverables |
|---|---|---|
| 1 | Foundation | `create-next-app`, deps install, SQLite + Prisma schema + `db push`, shadcn init, providers, NextAuth, app shell layout |
| 2 | Filament Inventory | Zod schemas, API routes, hooks, color swatch component, filament card/table/form, all 3 filament pages + usage log |
| 3 | Products & Variants | Product + variant API, hooks, product card/form, variant inline table, product pages with tabs |
| 4 | Assets & Upload | Upload API route, `react-dropzone` zone, image gallery (reorderable, primary flag), model file list with versioning |
| 5 | Marketplace Listings | Listing API, listing form + status badge, wire into Products tab |
| 6 | Print Queue | PrintJob API + hook, Kanban board UI, job detail page, auto-deduct filament on completion |
| 7 | Calculator | Pure `cost-calculator.ts`, calculator form + result card, link from variant table |
| 8 | Dashboard | Aggregate queries, stat cards, low-stock widget, quick actions |
| 9 | Analytics | Monthly aggregation query, Recharts charts (revenue bar, profit line, filament pie), date range filter |
| 10 | Settings & Polish | Settings page, wire electricity/labor rates into calculator defaults, responsive polish, skeletons, toasts, error boundaries |

---

## Bootstrap Commands

```bash
# 1. Init project (run in D:\Projects\3D_Printing_Assistant)
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install all dependencies
npm install prisma @prisma/client next-auth@beta bcryptjs react-hook-form @hookform/resolvers zod @tanstack/react-query @tanstack/react-query-devtools class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate next-themes recharts react-dropzone date-fns @radix-ui/react-icons
npm install -D @types/bcryptjs @types/node

# 3. Init shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select table badge progress tabs toast skeleton alert-dialog dropdown-menu separator sheet avatar breadcrumb

# 4. Init Prisma with SQLite (zero setup — no install required)
npx prisma init --datasource-provider sqlite
# Fill in schema.prisma, then:
npx prisma db push      # creates prisma/dev.db automatically
npx prisma generate
```

---

## Database Setup

**SQLite (default — works out of the box, no installation):**
```
DATABASE_URL="file:./prisma/dev.db"
```
Run `npx prisma db push` — the `.db` file is created automatically. No server, no credentials.

**To upgrade to PostgreSQL later:**
1. Install PostgreSQL 16 (native installer or Docker)
2. Change `schema.prisma` datasource: `provider = "postgresql"`
3. Update `DATABASE_URL` to a PostgreSQL connection string
4. Run `npx prisma migrate dev --name init`

**Prisma Studio** (visual DB browser at any time):
```bash
npx prisma studio  # opens at http://localhost:5555
```

---

## Environment Variables (.env.local)

```
# SQLite (default)
DATABASE_URL="file:./prisma/dev.db"

# PostgreSQL (future production)
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/printing_assistant"

NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Verification / Testing

1. `npm run dev` → app loads at `http://localhost:3000`
2. Unauthenticated visit to `/` redirects to `/login` ✓
3. Login with seeded credentials → lands on dashboard ✓
4. Add a filament → appears in list with color swatch and progress bar ✓
5. Create a product with variants + upload an image + add an Etsy listing ✓
6. Create a print job → move through Kanban statuses → on Complete, filament remaining weight decreases ✓
7. `/calculator` — change inputs → profit margin updates instantly (no page reload) ✓
8. `/analytics` — charts render with data after completing print jobs ✓
9. Resize browser to 375px → bottom nav visible, sidebar hidden, all pages usable ✓
10. Toggle dark/light mode → persists across reload ✓
