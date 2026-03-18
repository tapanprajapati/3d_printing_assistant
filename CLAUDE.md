# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev            # Start dev server at http://localhost:3000
npm run lint           # ESLint check

# Database
npm run db:push        # Sync Prisma schema to SQLite (dev.db)
npm run db:seed        # Create seed user (admin@local.dev / changeme) + AppSettings
npm run db:studio      # Visual DB browser at http://localhost:5555

# Production
npm run build
npm run start
```

No test framework is configured yet.

## Architecture

**Next.js 14 App Router** single-user app for managing a 3D printing small business (filament inventory, product catalog, print job queue, cost calculator, analytics).

### Route Groups
- `src/app/(auth)/` — Unauthenticated routes (login page + server actions)
- `src/app/(dashboard)/` — Protected routes; `layout.tsx` provides the full shell (collapsible sidebar on desktop, fixed bottom nav on mobile)
- `src/app/api/auth/[...nextauth]/` — NextAuth handler

### Auth Flow
`src/middleware.ts` protects all `/(dashboard)` routes via JWT session check. `src/lib/auth.ts` configures NextAuth credentials provider (bcryptjs, 12 rounds). Default credentials: `admin@local.dev` / `changeme`.

### Database
Prisma + SQLite (`prisma/dev.db`). Key models: `User`, `AppSettings` (singleton, id="default"), `Filament`, `FilamentUsageLog`, `Product`, `ProductVariant`, `ProductAsset`, `MarketplaceListing`, `PrintJob`. All prices/weights use `Float` for SQLite↔PostgreSQL portability.

To migrate to PostgreSQL: change `provider` in `prisma/schema.prisma`, update `DATABASE_URL` in `.env.local`, run `npx prisma migrate dev`.

### UI System
shadcn/ui components live in `src/components/ui/`. Shared layout components in `src/components/layout/` (sidebar, topbar, bottom-nav, nav-items). Page-level shared components in `src/components/shared/`. Use `cn()` from `src/lib/utils.ts` for conditional classnames.

### Data Fetching
- **Server Components**: Direct Prisma queries
- **Client Components**: TanStack Query v5 (wrapped by `src/providers/query-provider.tsx`)
- Forms: React Hook Form + Zod + `@hookform/resolvers`

### Path Alias
`@/*` resolves to `src/*`.

## Implementation Status

| Milestone | Feature | Status |
|---|---|---|
| M0 | Auth, shell layout, DB schema, providers, dashboard | ✅ Complete |
| M1 | Filament inventory (CRUD, usage logs, low-stock badge) | ✅ Complete |
| M2 | Product catalog | ⬜ Not started |
| M3 | Print job queue | ⬜ Not started |
| M4 | Cost calculator | ⬜ Not started |
| M5 | Analytics | ⬜ Not started |
| M6 | Settings | ⬜ Not started |

### M1 — Filament Inventory (complete)
- `src/lib/validations/filament.ts` — Zod schemas (FilamentSchema, FilamentUpdateSchema, UsageLogSchema)
- `src/app/api/filaments/` — REST API (list/create, get/update/delete, usage log list/post with `$transaction`)
- `src/lib/hooks/use-filaments.ts` — TanStack Query hooks
- `src/components/filaments/` — ColorSwatch, FilamentCard, FilamentForm, UsageLogTable
- `src/components/shared/` — EmptyState, ConfirmDialog
- Pages: `/filaments`, `/filaments/new`, `/filaments/[id]`, `/filaments/[id]/usage`
- Dashboard layout queries low-stock count → Topbar bell badge
- Toaster (Sonner) added to root layout

See `PLAN.md` and `TECH_SPEC.md` for the full implementation roadmap.
