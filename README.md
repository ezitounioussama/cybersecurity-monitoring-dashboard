# Sentinel — SOC Monitoring Dashboard

A production-style Security Operations Center dashboard for tracking alerts,
incidents, assets, vulnerabilities, and threat intelligence — with role-based
access, audit logging, and real-time-style notifications.

Built to the specs in [`agent.md`](./agent.md) (*how to build*) and
[`design.md`](./design.md) (*what to build*).

## Stack

Next.js 16 (App Router) · TypeScript (strict) · TailwindCSS v4 · shadcn/ui ·
Prisma 7 + PostgreSQL · Clerk (Organizations + Roles) · TanStack Table &
Query · React Hook Form + Zod · Recharts · @tabler/icons-react · Biome.

## Architecture

Clean, feature-based layering — dependencies point downward only:

```
UI (app/, components/, features/)
  → Server Actions (actions/) / Route Handlers (app/api/**)
    → Services (services/)      — business rules + authorization
      → Repositories (repositories/) — the only layer that touches Prisma
        → Prisma Client (lib/prisma.ts)
```

- **Services** own authorization (`services/authorization.service.ts`) and write
  audit entries on every mutation.
- **Route handlers** are thin controllers wrapped by `apiRoute()` (auth + rate
  limit + typed error envelope).
- Three roles: `ADMIN`, `ANALYST`, `VIEWER`, enforced server-side.

## Getting started

1. **Install** (Node 20.19+/22.12+/24+):

   ```bash
   pnpm install
   ```

2. **Environment** — copy `.env.example` to `.env` and fill in:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a PostgreSQL connection string.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from the
     [Clerk dashboard](https://dashboard.clerk.com).
   - `CLERK_WEBHOOK_SIGNING_SECRET` — for the `/api/webhooks/clerk` user sync
     (optional in local dev).

3. **Database** — push the schema and seed realistic demo data:

   ```bash
   pnpm db:push      # or: pnpm db:migrate
   pnpm db:seed      # ~20 users, 300 assets, 500 vulns, 200 alerts, 100 incidents, 50 threats
   ```

   The seed populates a shared default organization so a fresh Clerk sign-in
   immediately sees data. The first user to sign in becomes `ADMIN`.

4. **Run**:

   ```bash
   pnpm dev
   ```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm format` | Biome check / format |
| `pnpm db:push` / `pnpm db:migrate` | Sync the Prisma schema |
| `pnpm db:seed` | Seed demo data (idempotent) |
| `pnpm db:studio` | Open Prisma Studio |

## Features

Dashboard (stat cards + Recharts) · Alerts · Incidents (detail tabs, timeline,
alert linking) · Assets (detail with linked vulns/alerts) · Vulnerabilities
(CVSS-scored) · Threat Intelligence · Audit Logs · Notifications · Users
(admin) · Settings. Every list is built on one shared, URL-driven `DataTable`
with sorting, faceted filters, column visibility, pagination, bulk actions, and
CSV export.
