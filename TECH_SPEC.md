# 3D Printing Business Manager — Technical Specification

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft

---

## Table of Contents
1. [Overview](#1-overview)
2. [Feature Specification](#2-feature-specification)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [API Specification](#5-api-specification)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Authentication & Security](#7-authentication--security)
8. [File Storage](#8-file-storage)
9. [Testing Approach](#9-testing-approach)
10. [Milestones & Delivery](#10-milestones--delivery)

---

## 1. Overview

### 1.1 Purpose
A single-user web application for managing a 3D printing hobby and small business. Replaces scattered spreadsheets and notes with a centralized tool for tracking filament inventory, products, digital assets, marketplace listings, print jobs, and business analytics.

### 1.2 Users
- **Primary**: Single owner/operator of a small 3D printing business selling coasters, games, and future products on Etsy and other marketplaces.

### 1.3 Goals
- Track all filament spools with type, brand, color, weight, and cost data
- Manage a product catalog with variants, images, 3D model files, and Etsy listing metadata
- Track print jobs through a Kanban-style queue and automatically deduct filament usage
- Calculate accurate cost, pricing, and profit margin per product variant
- Visualize business performance with revenue and profit analytics
- Work well on both desktop and mobile browsers

### 1.4 Non-Goals
- Multi-user / team collaboration (single account only)
- Real-time Etsy API integration (listings are tracked manually)
- Inventory fulfillment / shipping label generation
- Customer-facing storefront

---

## 2. Feature Specification

### 2.1 Filament Inventory

**Purpose:** Track all filament spools so the user knows what they have, how much is left, and when to reorder.

**Fields per filament entry:**
| Field | Type | Notes |
|---|---|---|
| Brand / Company | Text | e.g., "Hatchbox", "eSUN" |
| Type | Enum | PLA, PETG, ABS, ASA, TPU, Nylon, Resin, PLA+, Silk PLA, Wood Fill, Metal Fill, Other |
| Color Name | Text | e.g., "Galaxy Black" |
| Color Hex | String | e.g., `#1a1a2e` — paired with a color picker |
| Total Weight (g) | Integer | Total grams across all spools at purchase |
| Remaining Weight (g) | Integer | Current grams remaining |
| Spool Count | Integer | Number of spools (full or partial) |
| Purchase Price Total | Float | Total paid for the batch |
| Low Stock Threshold (g) | Integer | Optional override; falls back to global setting |
| Notes | Text | Free text |

**Derived / computed (not stored):**
- **Remaining %**: `(remainingWeightG / totalWeightG) × 100`
- **Cost per gram**: `purchasePriceTotal / totalWeightG`

**Behaviors:**
- List view shows a color swatch circle, brand, type badge, remaining weight, and a color-coded progress bar (red when below threshold)
- Filament detail page shows full info, derived fields, and a paginated usage log
- On print job completion, remaining weight is automatically decremented by `gramsUsed`
- Low-stock badge in topbar shows count of filaments below threshold
- Manual usage log entry allows logging usage outside of tracked print jobs

**Filters / Search:**
- Filter by type (PLA, PETG, etc.)
- Filter by low-stock only
- Sort by brand, type, remaining weight, color

---

### 2.2 Product Catalog

**Purpose:** Maintain a catalog of all products with their variants, assets, and listing details.

**Product fields:**
| Field | Type | Notes |
|---|---|---|
| Name | Text | e.g., "Hexagon Coaster Set" |
| Description | Long Text | Marketing description |
| Category | Text | e.g., "Coasters", "Board Games", "Miniatures" |
| Status | Enum | DRAFT, ACTIVE, ARCHIVED |

**Product Variant fields:**
| Field | Type | Notes |
|---|---|---|
| Name | Text | e.g., "4-inch, Black" |
| SKU | Text | Unique identifier |
| Selling Price | Float | Internal selling price |
| Material Cost (g) | Float | Filament grams used |
| Print Time (hours) | Float | Estimated print hours |
| Notes | Text | Optional |

**Behaviors:**
- Product detail page is tab-based: Overview, Variants, Assets, Listings
- Multiple variants per product (e.g., different sizes and colors)
- "Open in Calculator" button on each variant pre-fills the cost calculator
- Products without a primary image show a placeholder thumbnail
- Category is free-text with autocomplete from existing categories
- Archiving a product hides it from active lists but preserves all data

---

### 2.3 Asset Management

**Purpose:** Store and organize product images and 3D model files.

**Image assets:**
- Multiple images per product
- One image designated as primary (shown as thumbnail in product list)
- Drag-to-reorder display order
- Supported formats: JPG, PNG, WebP, GIF
- Max file size: 10 MB per image

**3D Model files:**
- Multiple model files per product
- Supported formats: `.stl`, `.3mf`, `.obj`
- Optional version string (e.g., "v1.0", "v2.1") and version note per file
- Files are listed chronologically with version info shown inline
- Max file size: 50 MB per model file

**Upload behavior:**
- Drag-and-drop zone or click-to-browse
- Multiple files can be uploaded in one action
- Files stored locally under `public/uploads/images/` and `public/uploads/models/`
- File served directly by Next.js as static assets

---

### 2.4 Marketplace Listings

**Purpose:** Track where each product is listed and its current status on each marketplace.

**Listing fields:**
| Field | Type | Notes |
|---|---|---|
| Marketplace | Text | "Etsy", "Amazon", "Shopify", etc. — free text, extensible |
| Listing ID | Text | Platform's own listing ID (optional) |
| Listing URL | URL | Direct link to live listing |
| Listed Price | Float | Price on the platform (may differ from variant selling price) |
| Platform Fee % | Float | Override per listing; defaults to app setting |
| Status | Enum | DRAFT, ACTIVE, INACTIVE, SOLD_OUT |
| Date Listed | Date | When the listing went live |
| Notes | Text | Optional |

**Behaviors:**
- Multiple listings per product (one product can be listed on multiple platforms)
- Status badges color-coded: ACTIVE (green), DRAFT (gray), INACTIVE (yellow), SOLD_OUT (red)
- Clicking listing URL opens the platform page in a new tab
- Listing price is used in analytics revenue calculations when print jobs are linked to products

---

### 2.5 Print Cost Calculator

**Purpose:** Calculate profit margin for any combination of product, filament, and pricing inputs.

**Inputs:**
| Input | Notes |
|---|---|
| Filament | Dropdown (auto-fills cost/g from inventory) |
| Grams used | Numeric |
| Print time (hours) | Numeric |
| Electricity rate ($/kWh) | Pre-filled from settings, editable |
| Printer wattage (W) | Pre-filled from settings, editable |
| Labor rate ($/hr) | Pre-filled from settings, editable |
| Platform fee (%) | Pre-filled from settings, editable |
| Selling price | Numeric |

**Outputs (computed instantly on input change):**
| Output | Formula |
|---|---|
| Filament cost | `grams × (purchasePrice / totalGrams)` |
| Electricity cost | `hours × (wattage / 1000) × electricityRate` |
| Labor cost | `hours × laborRate` |
| Platform fee | `sellingPrice × (feePercent / 100)` |
| Total cost | Sum of all costs |
| Net profit | `sellingPrice - totalCost` |
| Margin % | `(netProfit / sellingPrice) × 100` |

**Behaviors:**
- All calculations run client-side (pure function, no API call) for instant feedback
- Pre-fill from variant: variant table rows have "Open in Calculator" button
- Results panel highlights net profit green (positive) or red (negative)
- No data is saved — calculator is a stateless tool

---

### 2.6 Print Queue / Job Tracker

**Purpose:** Track print jobs from planning through completion, and automatically update filament inventory on completion.

**Print job fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text | Description of the job |
| Linked Product | Relation | Optional link to a product |
| Linked Variant | Relation | Optional link to a variant |
| Linked Filament | Relation | Optional link to a filament spool |
| Status | Enum | QUEUED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED |
| Estimated Hours | Float | Pre-print estimate |
| Actual Hours | Float | Filled in on completion |
| Grams Used | Float | Filled in on completion |
| Scheduled At | DateTime | When the print is planned |
| Started At | DateTime | Auto-set when moved to IN_PROGRESS |
| Completed At | DateTime | Auto-set when moved to COMPLETED |
| Notes | Text | Optional |

**Behaviors:**
- Kanban board with 3 visible columns: Queued, In Progress, Completed (Failed/Cancelled accessible via filter)
- Status change via dropdown on card or via detail page
- On status → COMPLETED: prompt for actual hours and grams used; auto-deduct grams from linked filament's remaining weight; create a `FilamentUsageLog` entry
- On status → FAILED/CANCELLED: optionally log partial grams used
- Cards show: product thumbnail (if linked), title, filament color swatch, estimated hours

---

### 2.7 Dashboard

**Purpose:** At-a-glance overview of the business state.

**Widgets:**
| Widget | Data |
|---|---|
| Total Filaments | Count of filament entries |
| Low Stock Alert | Count + list of filaments below threshold |
| Active Listings | Count of ACTIVE marketplace listings |
| Products | Count by status (Active / Draft / Archived) |
| Print Jobs | Count by status (Queued / In Progress / Completed this month) |
| Quick Actions | Buttons: Add Filament, Add Product, New Print Job, Open Calculator |
| Recent Print Jobs | Last 5 print jobs with status |

---

### 2.8 Analytics

**Purpose:** Understand business performance over time.

**Charts:**
| Chart | Type | Notes |
|---|---|---|
| Monthly Revenue | Bar chart | Sum of selling prices of completed print jobs per month |
| Monthly Profit | Line overlay | Net profit per month |
| Top Products by Margin | Table | Top 5 products ranked by average margin % |
| Filament Consumption | Pie chart | Grams used per filament brand/type |

**Filters:**
- Date range picker (default: current year)
- All charts respond to the same date range filter

**Note:** Revenue/profit are derived from completed print jobs linked to products with variants. Jobs not linked to a variant are excluded from financial analytics but still counted in job stats.

---

### 2.9 App Settings

**Purpose:** Configure app-wide defaults used by the calculator and alerts.

**Settings:**
| Setting | Default | Notes |
|---|---|---|
| Electricity rate | $0.12/kWh | Used in cost calculator |
| Printer wattage | 200W | Used in cost calculator |
| Labor rate | $15.00/hr | Used in cost calculator |
| Default platform fee | 6.5% | Used in cost calculator and listings |
| Currency symbol | $ | Display only |
| Low stock threshold | 100g | Global default; overridable per filament |

---

## 3. Architecture

### 3.1 System Overview

```
Browser (React / Next.js)
    │
    ├── /app/(auth)/login          → NextAuth credentials login
    │
    └── /app/(dashboard)/...       → Protected pages (sidebar shell)
            │
            ├── API Routes (/api/...)    → Next.js Route Handlers
            │       │
            │       └── Prisma Client   → SQLite (dev) / PostgreSQL (prod)
            │
            └── /public/uploads/...     → Static file serving (images, models)
```

### 3.2 Request Flow

**Page load (authenticated):**
1. Browser requests a protected route
2. `middleware.ts` checks session via NextAuth → passes or redirects to `/login`
3. Page component renders server-side shell; client components mount and fire `useQuery` hooks
4. TanStack Query sends `fetch` to `/api/...` route handlers
5. Route handlers authenticate via `getServerSession`, query Prisma, return JSON
6. UI renders data

**Mutation flow (e.g., create filament):**
1. User submits form (React Hook Form + Zod validation)
2. `useMutation` hook sends `POST /api/filaments`
3. Route handler validates body with Zod, writes to DB via Prisma
4. Returns created record; TanStack Query invalidates `filaments` query key
5. List re-fetches and updates

**File upload flow:**
1. User drops file onto `FileUploadZone`
2. `POST /api/uploads` receives `multipart/form-data`
3. Server writes file to `public/uploads/{images|models}/` with a UUID filename
4. Returns `{ storagePath, fileName, fileSize, mimeType }`
5. Client calls `POST /api/products/[id]/assets` with the returned path to create the DB record

### 3.3 Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 14 (App Router) |
| Language | TypeScript | 5.x |
| Database (dev) | SQLite | via Prisma |
| Database (prod) | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Auth | NextAuth.js | v5 (beta) |
| Password hashing | bcryptjs | latest |
| UI components | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.x |
| Theming | next-themes | latest |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| Data fetching | TanStack Query | 5.x |
| Charts | Recharts | 2.x |
| File upload | react-dropzone | latest |
| Icons | lucide-react | latest |
| Date utilities | date-fns | 3.x |

### 3.4 Directory Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Protected shell (sidebar + topbar + bottom-nav)
│   │   ├── page.tsx                 # Dashboard
│   │   ├── filaments/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── usage/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx        # Tabs: Overview, Variants, Assets, Listings
│   │   ├── print-queue/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── calculator/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── filaments/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── usage/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── variants/
│   │   │       │   ├── route.ts
│   │   │       │   └── [variantId]/route.ts
│   │   │       ├── assets/
│   │   │       │   ├── route.ts
│   │   │       │   └── [assetId]/route.ts
│   │   │       └── listings/
│   │   │           ├── route.ts
│   │   │           └── [listingId]/route.ts
│   │   ├── print-jobs/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── uploads/route.ts
│   │   ├── calculator/route.ts
│   │   ├── analytics/route.ts
│   │   └── settings/route.ts
│   ├── layout.tsx                   # Root layout: providers
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui generated components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── topbar.tsx
│   │   └── nav-items.ts
│   ├── filaments/
│   │   ├── filament-form.tsx
│   │   ├── filament-card.tsx
│   │   ├── filament-table.tsx
│   │   ├── color-swatch.tsx
│   │   └── usage-log-table.tsx
│   ├── products/
│   │   ├── product-form.tsx
│   │   ├── product-card.tsx
│   │   ├── variant-form.tsx
│   │   ├── variant-table.tsx
│   │   ├── asset-uploader.tsx
│   │   ├── image-gallery.tsx
│   │   └── model-file-list.tsx
│   ├── listings/
│   │   ├── listing-form.tsx
│   │   └── listing-badge.tsx
│   ├── print-queue/
│   │   ├── job-card.tsx
│   │   ├── job-form.tsx
│   │   └── kanban-column.tsx
│   ├── calculator/
│   │   ├── calculator-form.tsx
│   │   └── result-card.tsx
│   ├── analytics/
│   │   ├── revenue-chart.tsx
│   │   ├── margin-chart.tsx
│   │   └── top-products-table.tsx
│   └── shared/
│       ├── page-header.tsx
│       ├── data-table.tsx
│       ├── empty-state.tsx
│       ├── confirm-dialog.tsx
│       ├── theme-toggle.tsx
│       └── file-upload-zone.tsx
├── lib/
│   ├── prisma.ts                    # PrismaClient singleton
│   ├── auth.ts                      # NextAuth config
│   ├── validations/
│   │   ├── filament.ts
│   │   ├── product.ts
│   │   ├── variant.ts
│   │   ├── listing.ts
│   │   ├── print-job.ts
│   │   └── settings.ts
│   ├── utils/
│   │   ├── cost-calculator.ts       # Pure calculation function
│   │   ├── file-storage.ts          # File read/write helpers
│   │   ├── format.ts                # Currency, weight, date formatters
│   │   └── cn.ts                    # Tailwind class merge
│   └── hooks/
│       ├── use-filaments.ts
│       ├── use-products.ts
│       ├── use-print-jobs.ts
│       ├── use-analytics.ts
│       └── use-settings.ts
├── providers/
│   ├── query-provider.tsx
│   ├── session-provider.tsx
│   └── theme-provider.tsx
└── types/
    ├── index.ts
    └── next-auth.d.ts
```

---

## 4. Database Schema

### 4.1 Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"   // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

// ─── Auth ────────────────────────────────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ─── App Settings ─────────────────────────────────────────────────────────────

model AppSettings {
  id                 String   @id @default(cuid())
  electricityRateKwh Float    @default(0.12)
  printerWattage     Float    @default(200)
  laborRatePerHour   Float    @default(15.00)
  defaultPlatformFee Float    @default(6.5)
  currencySymbol     String   @default("$")
  lowStockThresholdG Int      @default(100)
  updatedAt          DateTime @updatedAt
}

// ─── Filament Inventory ───────────────────────────────────────────────────────

model Filament {
  id                 String             @id @default(cuid())
  brand              String
  type               String             // "PLA" | "PETG" | etc. (string for SQLite compat)
  colorName          String
  colorHex           String
  totalWeightG       Int
  remainingWeightG   Int
  spoolCount         Int                @default(1)
  purchasePriceTotal Float
  lowStockThresholdG Int?
  notes              String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  usageLogs          FilamentUsageLog[]
  printJobs          PrintJob[]

  @@index([type])
  @@index([brand])
}

model FilamentUsageLog {
  id         String    @id @default(cuid())
  filamentId String
  filament   Filament  @relation(fields: [filamentId], references: [id], onDelete: Cascade)
  printJobId String?
  printJob   PrintJob? @relation(fields: [printJobId], references: [id])
  gramsUsed  Float
  note       String?
  loggedAt   DateTime  @default(now())

  @@index([filamentId])
  @@index([loggedAt])
}

// ─── Product Catalog ──────────────────────────────────────────────────────────

model Product {
  id          String               @id @default(cuid())
  name        String
  description String?
  category    String
  status      String               @default("DRAFT") // "DRAFT" | "ACTIVE" | "ARCHIVED"
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  variants    ProductVariant[]
  assets      ProductAsset[]
  listings    MarketplaceListing[]
  printJobs   PrintJob[]

  @@index([status])
  @@index([category])
}

model ProductVariant {
  id             String    @id @default(cuid())
  productId      String
  product        Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku            String    @unique
  name           String
  sellingPrice   Float
  materialCostG  Float
  printTimeHours Float
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  printJobs      PrintJob[]

  @@index([productId])
}

// ─── Assets ───────────────────────────────────────────────────────────────────

model ProductAsset {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  assetType   String   // "IMAGE" | "MODEL_STL" | "MODEL_3MF" | "OTHER"
  fileName    String
  storagePath String
  fileSize    Int
  mimeType    String
  isPrimary   Boolean  @default(false)
  sortOrder   Int      @default(0)
  version     String?
  versionNote String?
  createdAt   DateTime @default(now())

  @@index([productId, assetType])
}

// ─── Marketplace Listings ─────────────────────────────────────────────────────

model MarketplaceListing {
  id           String    @id @default(cuid())
  productId    String
  product      Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  marketplace  String
  listingId    String?
  listingUrl   String?
  price        Float
  status       String    @default("DRAFT") // "DRAFT" | "ACTIVE" | "INACTIVE" | "SOLD_OUT"
  platformFeeP Float?
  dateListedAt DateTime?
  notes        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([productId])
  @@index([marketplace, status])
}

// ─── Print Queue ──────────────────────────────────────────────────────────────

model PrintJob {
  id             String    @id @default(cuid())
  title          String
  productId      String?
  product        Product?        @relation(fields: [productId], references: [id])
  variantId      String?
  variant        ProductVariant? @relation(fields: [variantId], references: [id])
  filamentId     String?
  filament       Filament?       @relation(fields: [filamentId], references: [id])
  status         String    @default("QUEUED") // "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED"
  estimatedHours Float?
  actualHours    Float?
  gramsUsed      Float?
  notes          String?
  scheduledAt    DateTime?
  startedAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  usageLogs      FilamentUsageLog[]

  @@index([status])
  @@index([scheduledAt])
}
```

> **SQLite note:** Enum types are represented as `String` fields with string literal unions. This avoids SQLite's lack of native enum support and makes migration to PostgreSQL straightforward — Prisma enums can be added when switching providers without data loss.

### 4.2 Key Relations

```
User                     (standalone — no foreign keys in single-user app)
AppSettings              (singleton row — created on first access if absent)
Filament ──< FilamentUsageLog
Filament ──< PrintJob (optional)
Product ──< ProductVariant
Product ──< ProductAsset
Product ──< MarketplaceListing
Product ──< PrintJob (optional)
ProductVariant ──< PrintJob (optional)
PrintJob ──< FilamentUsageLog
```

---

## 5. API Specification

### 5.1 Auth Convention
All routes except `/api/auth/[...nextauth]` call `getServerSession(authOptions)` and return `401 { error: "Unauthorized" }` if no session exists.

### 5.2 Response Format
```json
// Success (list)
{ "data": [...], "total": 42 }

// Success (single)
{ "data": { ... } }

// Error
{ "error": "Human-readable message", "details": { ... } }
```

### 5.3 Filaments

| Method | Path | Description | Body / Query |
|---|---|---|---|
| GET | `/api/filaments` | List all filaments | `?type=PLA&lowStock=true` |
| POST | `/api/filaments` | Create filament | FilamentCreateInput |
| GET | `/api/filaments/:id` | Get single filament | — |
| PATCH | `/api/filaments/:id` | Update filament | Partial FilamentCreateInput |
| DELETE | `/api/filaments/:id` | Delete filament (cascades logs) | — |
| GET | `/api/filaments/:id/usage` | Paginated usage log | `?page=1&limit=20` |
| POST | `/api/filaments/:id/usage` | Manual log entry | `{ gramsUsed, note }` |

**FilamentCreateInput (Zod):**
```ts
z.object({
  brand: z.string().min(1),
  type: z.enum(["PLA","PETG","ABS","ASA","TPU","NYLON","RESIN","PLA_PLUS","SILK_PLA","WOOD_FILL","METAL_FILL","OTHER"]),
  colorName: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  totalWeightG: z.number().int().positive(),
  remainingWeightG: z.number().int().nonnegative(),
  spoolCount: z.number().int().positive().default(1),
  purchasePriceTotal: z.number().positive(),
  lowStockThresholdG: z.number().int().positive().optional(),
  notes: z.string().optional(),
})
```

### 5.4 Products

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products. Query: `?status=ACTIVE&category=Coasters&search=hex` |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product with variants, asset count, listing count |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product + cascade all children |

### 5.5 Variants

| Method | Path | Description |
|---|---|---|
| GET | `/api/products/:id/variants` | List variants for product |
| POST | `/api/products/:id/variants` | Create variant |
| PATCH | `/api/products/:id/variants/:variantId` | Update variant |
| DELETE | `/api/products/:id/variants/:variantId` | Delete variant |

### 5.6 Assets

| Method | Path | Description |
|---|---|---|
| GET | `/api/products/:id/assets` | List assets. Query: `?type=IMAGE` |
| POST | `/api/products/:id/assets` | Create asset record after upload |
| PATCH | `/api/products/:id/assets/:assetId` | Update isPrimary, sortOrder, version, versionNote |
| DELETE | `/api/products/:id/assets/:assetId` | Delete record + file from disk |

### 5.7 Listings

| Method | Path | Description |
|---|---|---|
| GET | `/api/products/:id/listings` | List marketplace listings |
| POST | `/api/products/:id/listings` | Create listing |
| PATCH | `/api/products/:id/listings/:listingId` | Update listing |
| DELETE | `/api/products/:id/listings/:listingId` | Delete listing |

### 5.8 Print Jobs

| Method | Path | Description |
|---|---|---|
| GET | `/api/print-jobs` | List jobs. Query: `?status=QUEUED` |
| POST | `/api/print-jobs` | Create job |
| GET | `/api/print-jobs/:id` | Get job detail |
| PATCH | `/api/print-jobs/:id` | Update job (including status transition) |
| DELETE | `/api/print-jobs/:id` | Delete job |

**Status transition side effects (handled in PATCH handler):**
- `→ IN_PROGRESS`: set `startedAt = now()`
- `→ COMPLETED`: set `completedAt = now()`; if `gramsUsed` provided and `filamentId` set → decrement `filament.remainingWeightG`; create `FilamentUsageLog` entry
- `→ FAILED / CANCELLED`: if partial `gramsUsed` provided → same deduction and log

### 5.9 Upload

| Method | Path | Description |
|---|---|---|
| POST | `/api/uploads` | Upload file. `multipart/form-data` with field `file` and query `?type=image\|model` |

Response: `{ storagePath, fileName, fileSize, mimeType }`

### 5.10 Calculator

| Method | Path | Description |
|---|---|---|
| POST | `/api/calculator` | Stateless calculation. Body: all calculator inputs. Returns full cost breakdown. |

### 5.11 Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/api/analytics` | All analytics data. Query: `?from=2025-01-01&to=2025-12-31` |

Response shape:
```json
{
  "data": {
    "monthlyRevenue": [{ "month": "2025-01", "revenue": 430.00, "profit": 180.00 }],
    "topProducts": [{ "productName": "...", "totalRevenue": 0, "avgMarginPct": 0 }],
    "filamentUsage": [{ "brand": "...", "colorName": "...", "colorHex": "...", "totalGrams": 0 }],
    "summary": { "totalRevenue": 0, "totalProfit": 0, "overallMarginPct": 0, "jobsCompleted": 0 }
  }
}
```

### 5.12 Settings

| Method | Path | Description |
|---|---|---|
| GET | `/api/settings` | Get settings (auto-creates default row if absent) |
| PATCH | `/api/settings` | Update settings |

---

## 6. Frontend Architecture

### 6.1 Layout System

**Desktop (≥768px):**
- Left sidebar (240px expanded, 64px icon-only collapsed)
- Main content area fills remaining width
- Topbar shows page title + breadcrumbs + notification badge + theme toggle

**Mobile (<768px):**
- No sidebar (hidden via Tailwind `md:flex`)
- Fixed bottom navigation bar with top 5 nav items (icon + label)
- Topbar shows page title only

**Nav items (in order):**
1. Dashboard — `/`
2. Filaments — `/filaments`
3. Products — `/products`
4. Print Queue — `/print-queue`
5. Calculator — `/calculator`
6. Analytics — `/analytics` (desktop sidebar only)
7. Settings — `/settings` (desktop sidebar only, at bottom)

### 6.2 State Management

| Concern | Solution |
|---|---|
| Server data (lists, detail) | TanStack Query `useQuery` |
| Mutations | TanStack Query `useMutation` with `onSuccess` cache invalidation |
| Forms | React Hook Form with Zod resolver |
| UI state (sidebar open/closed) | React `useState` in layout component |
| Theme (dark/light) | `next-themes` — persisted to `localStorage` |
| Auth session | NextAuth `useSession` / `getServerSession` |

### 6.3 Key Shared Components

**`data-table.tsx`**
Generic table built on TanStack Table v8. Accepts `columns` config and `data` array. Provides sorting, column visibility, and pagination out of the box. Used for filament table, variant table, listings table, usage log.

**`confirm-dialog.tsx`**
Wraps shadcn `AlertDialog`. Used for all delete actions. Props: `trigger`, `title`, `description`, `onConfirm`, `isPending`.

**`file-upload-zone.tsx`**
Wraps `react-dropzone`. Props: `accept` (mime map), `maxSize`, `onUpload` (callback with `File[]`), `multiple`. Shows image previews for image uploads. Used by `asset-uploader.tsx`.

**`page-header.tsx`**
Renders page title (h1), optional subtitle, and an optional right-aligned action slot (e.g., "New Filament" button).

**`empty-state.tsx`**
Centered icon + message + optional CTA. Shown when lists have no items.

### 6.4 Cost Calculator — Client-Side Logic

`src/lib/utils/cost-calculator.ts` is a pure function with no side effects:

```ts
interface CalculatorInputs {
  filamentCostPerGram: number
  gramsUsed: number
  printTimeHours: number
  electricityRateKwh: number
  printerWattageW: number
  laborRatePerHour: number
  platformFeePercent: number
  sellingPrice: number
}

interface CalculatorResult {
  filamentCost: number
  electricityCost: number
  laborCost: number
  platformFee: number
  totalCost: number
  netProfit: number
  marginPercent: number
}

export function calculate(inputs: CalculatorInputs): CalculatorResult { ... }
```

The calculator page calls `calculate()` in a `useEffect` or `watch` callback (React Hook Form) — no debounce needed since it's synchronous and cheap. Results re-render instantly on any input change.

---

## 7. Authentication & Security

### 7.1 NextAuth v5 Setup
- **Provider**: Credentials (email + password)
- **Password storage**: bcrypt hash with salt rounds = 12
- **Session strategy**: JWT (stored in httpOnly cookie)
- **Session duration**: 30 days (configurable in `auth.ts`)

### 7.2 Route Protection
`middleware.ts` uses NextAuth's `auth` middleware to intercept all requests:
- Routes under `/(dashboard)` require a valid session → redirect to `/login` if absent
- `/login` redirects to `/` if a session already exists

### 7.3 API Route Protection
Every route handler calls `getServerSession(authOptions)`:
```ts
const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

### 7.4 Input Validation
All POST/PATCH bodies are validated with Zod schemas before any DB operation. Invalid input returns `400` with Zod error details. This prevents malformed data and basic injection attempts.

### 7.5 File Upload Security
- Allowed MIME types are whitelisted (images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`; models: `application/octet-stream` with extension check)
- File extension is validated server-side, not just client-side
- Uploaded files are saved with a UUID filename (not the original name) to prevent path traversal
- Max file size enforced server-side (10 MB images, 50 MB models)

### 7.6 Initial User Setup
A seed script (`prisma/seed.ts`) creates the initial user account with a hashed password. Credentials are set via environment variables at seed time:
```bash
SEED_EMAIL=admin@example.com SEED_PASSWORD=yourpassword npx tsx prisma/seed.ts
```

---

## 8. File Storage

### 8.1 Storage Layout
```
public/
└── uploads/
    ├── images/          # Product images
    │   └── {uuid}.{ext}
    └── models/          # 3D model files
        └── {uuid}.{ext}
```

Files in `public/` are served directly by Next.js at `/uploads/images/{uuid}.ext`.

### 8.2 Upload Handler (`/api/uploads`)
1. Parse `multipart/form-data` using the Web Streams API (Next.js 14 native, no `multer`)
2. Validate file type and size
3. Generate UUID filename preserving extension
4. Write to `public/uploads/{type}/` using Node.js `fs.writeFile`
5. Return `{ storagePath: "/uploads/images/{uuid}.ext", fileName, fileSize, mimeType }`

### 8.3 File Deletion
When an asset record is deleted via `DELETE /api/products/:id/assets/:assetId`:
1. Retrieve `storagePath` from DB record
2. Delete record from DB
3. Delete file from disk using `fs.unlink`
If file deletion fails (e.g., already deleted), log the error but still return success — DB record is the source of truth.

### 8.4 PostgreSQL Migration Note
When moving to cloud PostgreSQL (production), file storage should be migrated to an object store (e.g., AWS S3, Cloudflare R2). Only `src/lib/utils/file-storage.ts` and `src/app/api/uploads/route.ts` need changes — the rest of the app uses `storagePath` URLs opaquely.

---

## 9. Testing Approach

### 9.1 Testing Stack
| Layer | Tool |
|---|---|
| Unit tests | Vitest |
| Component tests | React Testing Library + Vitest |
| API/integration tests | Vitest + Prisma test database (separate SQLite file) |
| E2E tests | Playwright |

### 9.2 Unit Tests — `src/lib/utils/cost-calculator.ts`
Priority: **High** — pure function, easy to test, critical to business accuracy.

Test cases:
- Zero margin (selling price = total cost)
- Negative margin (selling price < total cost)
- Zero platform fee
- Zero electricity / zero labor (filament-only job)
- Edge: zero grams used
- Edge: very high wattage printer

```ts
// Example
it("calculates correct margin", () => {
  const result = calculate({
    filamentCostPerGram: 0.02,
    gramsUsed: 50,
    printTimeHours: 2,
    electricityRateKwh: 0.12,
    printerWattageW: 200,
    laborRatePerHour: 0,
    platformFeePercent: 6.5,
    sellingPrice: 15.00,
  })
  expect(result.filamentCost).toBeCloseTo(1.00)
  expect(result.electricityCost).toBeCloseTo(0.048)
  expect(result.platformFee).toBeCloseTo(0.975)
  expect(result.netProfit).toBeGreaterThan(0)
})
```

### 9.3 Unit Tests — Zod Validation Schemas
Test valid and invalid inputs for each Zod schema (filament, product, variant, listing, print job, settings). Focus on boundary conditions (negative weights, invalid hex colors, future dates on `dateListedAt`).

### 9.4 Component Tests
Priority: **Medium** — focus on components with non-trivial logic.

Key components to test:
- `color-swatch.tsx` — hex input and color picker stay in sync
- `result-card.tsx` — renders green for positive profit, red for negative
- `listing-badge.tsx` — correct color per status
- `filament-card.tsx` — progress bar is red below threshold
- `data-table.tsx` — sorting and pagination work correctly

### 9.5 API Integration Tests
Use a separate test SQLite DB (`test.db`). Run each test in a transaction that is rolled back after the test.

Priority tests:
- **Filament CRUD**: create, read, update, delete
- **Filament usage log**: POST usage decrements `remainingWeightG`
- **Print job completion**: status → COMPLETED triggers filament deduction + usage log creation
- **Asset deletion**: file is deleted from disk alongside DB record
- **Settings auto-create**: GET settings on empty DB returns defaults without error
- **Auth guard**: all routes return 401 without session

### 9.6 E2E Tests (Playwright)
Priority: **Low** for initial build, **Medium** before production.

Happy-path flows to cover:
1. Login → land on dashboard
2. Add a filament → appears in list with correct color and progress bar
3. Create a product → add a variant → open in calculator → check margin is non-zero
4. Upload a product image → set as primary → appears as thumbnail in product list
5. Add a marketplace listing → status badge shows ACTIVE
6. Create a print job → move to IN_PROGRESS → move to COMPLETED with grams → check filament remaining weight decreased
7. Navigate all pages on mobile viewport (375px) — no horizontal scroll

### 9.7 Test File Structure
```
tests/
├── unit/
│   ├── cost-calculator.test.ts
│   └── validations/
│       ├── filament.test.ts
│       ├── product.test.ts
│       └── ...
├── components/
│   ├── color-swatch.test.tsx
│   ├── result-card.test.tsx
│   └── ...
├── api/
│   ├── filaments.test.ts
│   ├── print-jobs.test.ts
│   └── ...
└── e2e/
    ├── auth.spec.ts
    ├── filaments.spec.ts
    ├── products.spec.ts
    └── print-queue.spec.ts
```

---

## 10. Milestones & Delivery

Each milestone is independently deployable and demo-able.

---

### Milestone 0 — Project Foundation
**Goal:** Running Next.js app with auth, database, and navigation shell. No features yet.

**Deliverables:**
- [ ] Next.js 14 project initialized with TypeScript, Tailwind, ESLint
- [ ] All dependencies installed
- [ ] Prisma schema created and `db push` applied (SQLite)
- [ ] NextAuth configured (credentials provider)
- [ ] Seed script creates initial user account
- [ ] Login page functional — redirects to dashboard on success
- [ ] Protected route middleware working
- [ ] App shell layout: sidebar (desktop) + bottom nav (mobile) + topbar
- [ ] Dark / light mode toggle working and persisted
- [ ] shadcn/ui initialized with base components added
- [ ] TanStack Query and theme providers wired into root layout
- [ ] `/` dashboard page renders (placeholder content)

**Acceptance criteria:**
- Navigating to `http://localhost:3000` redirects to `/login`
- Logging in with seeded credentials lands on the dashboard
- All nav links render without errors
- Dark/light toggle persists on page reload
- App is usable on a 375px viewport

---

### Milestone 1 — Filament Inventory
**Goal:** Complete filament tracking with inventory management and usage logging.

**Deliverables:**
- [ ] `GET/POST /api/filaments` and `GET/PATCH/DELETE /api/filaments/:id`
- [ ] `GET/POST /api/filaments/:id/usage`
- [ ] Filament list page: card grid with color swatch, brand, type, progress bar
- [ ] Filter by type, filter low-stock, sort controls
- [ ] Filament create form (with color picker)
- [ ] Filament detail / edit page (inline edit)
- [ ] Filament usage log page with manual entry
- [ ] Low-stock badge in topbar (count of filaments below threshold)
- [ ] Dashboard low-stock widget
- [ ] Zod validation for all filament endpoints
- [ ] Unit tests for filament Zod schemas
- [ ] API integration tests for filament CRUD and usage log

**Acceptance criteria:**
- Can add a filament with a custom hex color and see the color swatch immediately
- Progress bar turns red when remaining weight < threshold
- Topbar badge updates when a filament drops below threshold
- Manual usage log entry reduces remaining weight
- Deleting a filament cascades its usage logs

---

### Milestone 2 — Product Catalog & Variants
**Goal:** Full product management with variants and cost data.

**Deliverables:**
- [ ] `GET/POST /api/products` and `GET/PATCH/DELETE /api/products/:id`
- [ ] `GET/POST /api/products/:id/variants` and variant PATCH/DELETE
- [ ] Product list page: cards with name, category, status badge, variant count
- [ ] Filter by status, category tabs, search by name
- [ ] Product create form
- [ ] Product detail page: tabbed (Overview, Variants, Assets placeholder, Listings placeholder)
- [ ] Variant inline table with add/edit/delete per row
- [ ] "Open in Calculator" button per variant (links to `/calculator?variantId=...`)
- [ ] Zod validation for products and variants
- [ ] Unit tests for product/variant Zod schemas

**Acceptance criteria:**
- Can create a product with 3 variants
- Status filter shows only matching products
- Editing a variant inline updates the table without page reload
- Archiving a product hides it from the Active tab

---

### Milestone 3 — Asset Management
**Goal:** Upload, manage, and display product images and 3D model files.

**Deliverables:**
- [ ] `POST /api/uploads` (multipart handler, UUID filenames, type/size validation)
- [ ] `GET/POST /api/products/:id/assets` and asset PATCH/DELETE
- [ ] Image upload zone (drag-drop + click-to-browse)
- [ ] Image gallery: reorderable, primary flag toggle, delete with confirm dialog
- [ ] Model file list: upload, version + note input, delete
- [ ] Primary image appears as thumbnail in product list cards
- [ ] File deletion removes from disk + DB
- [ ] File type and size validation on client and server
- [ ] API integration tests for upload and asset deletion

**Acceptance criteria:**
- Uploading 3 images and setting one as primary — it appears as the product card thumbnail
- Drag-and-drop works; shows preview before confirming upload
- Deleting an asset removes the file from `public/uploads/`
- Uploading a `.stl` file with version "v1.0" displays correctly in model list

---

### Milestone 4 — Marketplace Listings
**Goal:** Track product listings on external marketplaces.

**Deliverables:**
- [ ] `GET/POST /api/products/:id/listings` and listing PATCH/DELETE
- [ ] Listings tab on product detail page (previously placeholder)
- [ ] Listing form: marketplace, URL, listing ID, price, fee %, status, date
- [ ] Status badges color-coded
- [ ] Listing URL opens in new tab
- [ ] Zod validation for listings
- [ ] Listings count shown in product card

**Acceptance criteria:**
- Can add an Etsy listing to a product with a URL and ACTIVE status
- Status badge color matches status
- Can change status to SOLD_OUT — badge updates

---

### Milestone 5 — Print Queue
**Goal:** Track print jobs through a Kanban board with automatic filament deduction.

**Deliverables:**
- [ ] `GET/POST /api/print-jobs` and `GET/PATCH/DELETE /api/print-jobs/:id`
- [ ] Print queue Kanban page: 3 columns (Queued, In Progress, Completed)
- [ ] Job card: title, product thumbnail (if linked), filament swatch, estimated hours, status chip
- [ ] Job create/edit form (link to product, variant, filament optionally)
- [ ] Status change via dropdown on card; confirmation prompt on COMPLETED asking for actual hours + grams
- [ ] On COMPLETED: auto-deduct `gramsUsed` from filament `remainingWeightG` + create usage log entry
- [ ] Job detail page
- [ ] Dashboard recent jobs widget wired up
- [ ] API integration tests for status transition + filament deduction

**Acceptance criteria:**
- Creating a job linked to a filament, completing it with 50g used → filament remaining decreases by 50g
- Usage log entry is created automatically
- Kanban columns show correct jobs per status
- Failed jobs don't deduct from filament (unless partial grams entered)

---

### Milestone 6 — Cost Calculator
**Goal:** Interactive print cost and margin calculator.

**Deliverables:**
- [ ] `src/lib/utils/cost-calculator.ts` pure function
- [ ] `POST /api/calculator` wrapper route
- [ ] Calculator page: all inputs, instant result panel
- [ ] Pre-fill from settings (electricity rate, wattage, labor, platform fee)
- [ ] Pre-fill from variant via URL query param `?variantId=...`
- [ ] Result panel: cost breakdown, net profit (green/red), margin %
- [ ] Unit tests for `cost-calculator.ts` (all edge cases)

**Acceptance criteria:**
- Changing any input updates results instantly (no loading state)
- Results turn red when selling price < total cost
- Navigating from a variant row pre-fills grams and print time correctly

---

### Milestone 7 — Dashboard
**Goal:** Populated, actionable dashboard overview.

**Deliverables:**
- [ ] Stat cards: total filaments, low stock count, active listings, products by status, jobs this month
- [ ] Low-stock alert list (filament name, color swatch, remaining g, threshold)
- [ ] Quick action buttons: Add Filament, Add Product, New Print Job, Open Calculator
- [ ] Recent print jobs list (last 5, with status badges)
- [ ] All data fetched with TanStack Query; loading skeletons during fetch

**Acceptance criteria:**
- Dashboard reflects real data from DB
- Quick action buttons navigate to the correct pages
- Skeletons show during initial load

---

### Milestone 8 — Analytics
**Goal:** Revenue and profit charts with date range filtering.

**Deliverables:**
- [x] `GET /api/analytics` with monthly aggregation
- [x] Monthly revenue bar chart (Recharts)
- [x] Monthly profit line overlay
- [x] Top 5 products by margin table
- [x] Filament consumption pie chart
- [x] Date range picker filter (default: current calendar year)
- [x] Summary stat row (total revenue, total profit, overall margin %, jobs completed)

**Acceptance criteria:**
- Charts render correctly after completing print jobs in Milestone 5
- Date range filter changes all charts simultaneously
- Empty state shown gracefully when no data exists in range

---

### Milestone 9 — Settings & Polish
**Goal:** Settings page, all defaults wired up, responsive + UX polish.

**Deliverables:**
- [x] `GET/PATCH /api/settings`
- [x] Settings page form: all configurable fields
- [x] Calculator reads defaults from settings API on load
- [x] Global low-stock threshold respected by topbar badge and dashboard widget
- [x] Loading skeletons on all list/detail pages
- [x] Toast notifications on all create/update/delete mutations
- [x] Error boundaries on all pages
- [ ] Responsive testing pass at 375px, 768px, 1280px
- [ ] Accessibility: all form fields have labels, buttons have aria labels, focus ring visible

**Acceptance criteria:**
- Changing electricity rate in settings updates the calculator's pre-filled value
- Changing global low-stock threshold updates which filaments show as low-stock
- All mutations show a success or error toast
- No horizontal scroll on 375px viewport on any page
- Dark and light modes look correct on every page

---

### Post-Launch / Future Work (Not in Scope)
- Etsy API integration (automatic listing sync)
- Order tracking (manual or API-sourced)
- Printer management (maintenance log, multiple printers)
- Export to CSV / PDF
- PostgreSQL migration + cloud deployment (Vercel + PlanetScale / Supabase)
- Mobile app (React Native) using the same API

---

## Appendix A: Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="file:./prisma/dev.db"          # SQLite (dev)
# DATABASE_URL="postgresql://..."            # PostgreSQL (prod)

# NextAuth
NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Seed credentials (only used by seed script)
SEED_EMAIL="admin@example.com"
SEED_PASSWORD="yourpassword"
```

## Appendix B: Bootstrap Commands

```bash
# In D:\Projects\3D_Printing_Assistant

# 1. Initialize project
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install dependencies
npm install prisma @prisma/client next-auth@beta bcryptjs \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-query @tanstack/react-query-devtools \
  class-variance-authority clsx tailwind-merge \
  lucide-react tailwindcss-animate next-themes \
  recharts react-dropzone date-fns @radix-ui/react-icons
npm install -D @types/bcryptjs @types/node vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom playwright

# 3. Initialize shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select \
  table badge progress tabs toast skeleton alert-dialog \
  dropdown-menu separator sheet avatar breadcrumb

# 4. Initialize Prisma (SQLite)
npx prisma init --datasource-provider sqlite
# → fill in prisma/schema.prisma
npx prisma db push
npx prisma generate

# 5. Seed initial user
npx tsx prisma/seed.ts

# 6. Run development server
npm run dev
```
