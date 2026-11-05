# BUTELLA — Developer Guidelines & Architecture Reference

## Overview
**BUTELLA** is a production-ready, full-stack e-commerce web platform for a premium women's clothing boutique in Kyzylorda, Kazakhstan.
Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL / Supabase, and Telegram Bot API.

---

## Quick Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run automated domain & security verification test suite
npm test

# Build optimized production bundle
npm run build

# Start production server
npm start

# Run ESLint checks
npm run lint
```

---

## Tech Stack & Architecture

- **Frontend & Server Framework**: Next.js 16.4.5 (App Router, Turbopack, Partial Prerendering)
- **UI & Styling**: Tailwind CSS v4 (`@import "tailwindcss";`, `@theme` luxury boutique palette, `Playfair Display` serif, `Inter` sans-serif)
- **Icons**: `lucide-react`
- **Validation**: `zod`
- **Database & Storage**: Supabase PostgreSQL + Supabase Storage (`products` bucket)
- **Remote Order Operations**: Telegram Bot API (`sendMessage`, inline buttons, webhook callback updates)
- **Deployment**: Vercel

---

## Directory Structure

```text
butella/
├── .env.example                     # Environment variables template
├── .env.local                       # Local development overrides (git-ignored)
├── BRIEF.md                         # Product requirements brief
├── DOCS_OWNER_RU.md                 # Non-technical store owner manual in Russian
├── README.md                        # Project documentation & deployment guide
├── next.config.ts                   # Next.js configuration (images, security headers)
├── package.json
├── scripts/
│   └── test-suite.ts                # Automated test runner (npm test)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # PostgreSQL tables, indexes & RLS policies
│       └── 002_seed_initial_data.sql# Initial boutique dresses, variants & photos
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── checkout/order/      # Server-side stock & price validation API
    │   │   ├── checkout/status/     # Real-time customer polling endpoint
    │   │   ├── manage/auth/         # Owner login & session cookie management
    │   │   ├── manage/products/     # Product CRUD API
    │   │   ├── manage/upload/       # Photo upload to Supabase Storage
    │   │   ├── payments/kaspi/      # Kaspi Pay webhook
    │   │   └── telegram/            # Telegram webhook & setup route
    │   ├── cart/                    # Dedicated cart page
    │   ├── catalog/                 # Filterable product catalog
    │   ├── checkout/                # Checkout form & /success order confirmation
    │   ├── manage/                  # Protected store owner panel
    │   ├── product/[slug]/          # Product detail page
    │   ├── globals.css              # Theme tokens & luxury styles
    │   ├── layout.tsx               # Root layout, CartProvider, fonts, Header/Footer
    │   └── page.tsx                 # Boutique homepage
    ├── components/
    │   ├── cart/CartDrawer.tsx      # Slide-over cart panel
    │   ├── checkout/CheckoutForm.tsx# Checkout stepper & summary
    │   ├── layout/                  # AnnouncementBar, Header, Footer
    │   ├── manage/                  # AdminLogin, ManageDashboard, ProductModal
    │   ├── product/                 # ProductCard, ProductView
    │   └── ui/                      # Reusable UI icons and components
    ├── context/
    │   └── CartContext.tsx          # Client-persisted shopping cart
    ├── data/
    │   └── mock-products.ts         # High-fidelity mock catalog fallback
    ├── lib/
    │   ├── auth.ts                  # Owner session & password validation
    │   ├── delivery.ts              # Configurable shipping fees
    │   ├── rate-limit.ts            # Sliding-window anti-spam rate limiter
    │   ├── utils.ts                 # formatPrice (₸), formatPhoneNumber, cn
    │   ├── payments/                # Extensible payment provider pattern & Kaspi
    │   ├── supabase/                # Browser, server, and privileged admin clients
    │   ├── telegram/                # Telegram message formatting & remote buttons
    │   └── validations/             # Zod checkout validation schema
    └── types/
        ├── database.ts              # PostgreSQL schema types
        └── ecommerce.ts             # Domain models (Product, Variant, Order, Cart)
```

---

## Security Invariants

1. **Server-Side Price Recalculation**: Prices submitted by the browser are *never* trusted. The backend always queries the database to calculate line totals and shipping fees.
2. **Stock Verification**: Inventory is validated and reserved atomically upon order creation.
3. **Privileged Keys**: `SUPABASE_SERVICE_ROLE_KEY` and `TELEGRAM_BOT_TOKEN` must *never* be exposed in client bundles (`NEXT_PUBLIC_` prefixes are forbidden for secrets).
4. **Row Level Security (RLS)**: Public users can only read active products. Orders, customer phone numbers, and addresses are completely hidden behind authenticated/service roles.
5. **Rate Limiting**: Public order submission and admin login are protected by sliding-window rate limiters.
