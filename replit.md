# Da Bao Restaurant Website

A full-stack restaurant website for Da Bao — an upscale Asian/Chinese restaurant in Jeddah, Saudi Arabia. Features a dark-gold luxury design, dynamic menu, WhatsApp checkout, and a protected admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/da-bao run dev` — run the frontend (port 23694)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, Framer Motion, Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM table definitions (categories, menuItems, orders, settings)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers (categories, menuItems, orders, settings, analytics)
- `artifacts/da-bao/src/` — React frontend (pages: Home, Menu, Cart, Admin)

## Architecture decisions

- Dark-gold luxury theme (#121212 background, #EAB308 gold) — enforced globally as permanent dark mode
- Admin passphrase is client-side only ("dabao2024") — no backend auth needed for MVP
- Cart state persisted in localStorage via useContext + useEffect
- WhatsApp order: formats an emoji receipt and opens `wa.me/966565161760?text=...`
- Settings row is auto-created on first `/api/settings` GET — no seed required
- Analytics use raw SQL aggregations (JSONB array unnesting for top-items)

## Product

- **Home**: Hero with generated restaurant background, Call/WhatsApp/Order CTAs, customer review, map embed, hours
- **Menu**: Category tabs with API-loaded items, Add to Cart
- **Cart**: Quantity adjusters, delivery/pickup toggle, VAT calculation, WhatsApp order button
- **Admin** (passphrase: dabao2024): Menu CRUD, Category CRUD, Settings editor, Order management, Analytics charts

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Google Fonts `@import url(...)` must be the very first line in `index.css` — before `@import "tailwindcss"`
- Analytics `/top-items` uses raw `db.execute(sql...)` with JSONB unnesting — not a standard Drizzle query
- `deliveryFee` and `taxRate` come from DB as strings (numeric type) — always `parseFloat()` before arithmetic

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
