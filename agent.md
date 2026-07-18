# AGENT.md — Cybersecurity Monitoring Dashboard

This file is the operating manual for any AI coding agent (Claude Code, Copilot Workspace, Cursor, etc.) working on this repository. Read this in full before writing any code. When in doubt, prefer the constraint that keeps the codebase consistent over the one that is locally convenient.

---

## 1. Mission

Build and maintain a production-ready **Cybersecurity Monitoring / SOC (Security Operations Center) Dashboard** on top of an already-initialized Next.js project. The agent's job is to extend this codebase feature by feature without deviating from the stack, architecture, or conventions defined here.

---

## 2. Non-Negotiable Tech Stack

Do **not** introduce alternative libraries for problems already solved by this list. Do not add a new state manager, a new table library, a new form library, a new ORM, or a competing UI kit.

| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router only — no Pages Router) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS |
| Components | shadcn/ui |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Clerk (Organizations + Roles) |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | @tabler/icons-react |
| Server cache/client data | TanStack Query (only where Server Components are insufficient) |

If a task seems to require a new dependency, stop and flag it instead of silently adding one.

---

## 3. Architecture Rules

This project follows **Clean Architecture** adapted for Next.js App Router, feature-based organization.

**Layering (data flows top to bottom, dependencies point downward only):**

```
UI (app/, components/)
   → Server Actions (actions/)
      → Services (services/)  — business logic, authorization checks
         → Repositories (repositories/) — Prisma queries only, no business logic
            → Prisma Client (lib/prisma.ts)
```

Rules:
- **Route Handlers** (`app/api/**/route.ts`) are thin controllers: parse/validate input with Zod, call a service, return a typed response. No Prisma calls directly in route handlers.
- **Server Actions** (`actions/*.ts`) are the preferred mutation path for forms; Route Handlers exist for the documented REST API surface and for any external/programmatic consumers.
- **Services** own business rules and authorization decisions (e.g., "only Admin can delete a user"). Services never talk to Prisma directly — they call repositories.
- **Repositories** are the only layer allowed to import the Prisma client. One repository per model/aggregate (e.g., `alert.repository.ts`).
- Never call `prisma` from a React component, page, or Route Handler directly. Always go through a repository.
- Server Components fetch data directly via services (no client-side fetch waterfalls) unless interactivity requires client state.
- Client Components are used only for interactivity: forms, tables with client sort/filter state, dialogs, dropdowns, real-time widgets, theme toggles.

---

## 4. Folder Structure (authoritative)

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (dashboard)/
    layout.tsx                # sidebar + topbar shell, server component
    dashboard/page.tsx
    alerts/page.tsx
    alerts/[id]/page.tsx
    incidents/page.tsx
    incidents/[id]/page.tsx
    assets/page.tsx
    assets/[id]/page.tsx
    vulnerabilities/page.tsx
    threat-intelligence/page.tsx
    audit-logs/page.tsx
    notifications/page.tsx
    users/page.tsx
    settings/page.tsx
  api/
    alerts/route.ts
    alerts/[id]/route.ts
    incidents/route.ts
    incidents/[id]/route.ts
    assets/route.ts
    assets/[id]/route.ts
    vulnerabilities/route.ts
    vulnerabilities/[id]/route.ts
    threats/route.ts
    threats/[id]/route.ts
    users/route.ts
    users/[id]/route.ts
    audit/route.ts
  layout.tsx
  globals.css
  middleware.ts (co-located at project root per Next.js convention)

components/
  ui/                         # shadcn primitives (generated, don't hand-edit unless necessary)
  shared/
    data-table/
      data-table.tsx
      data-table-toolbar.tsx
      data-table-pagination.tsx
      data-table-column-header.tsx
      data-table-faceted-filter.tsx
      data-table-bulk-actions.tsx
      data-table-export-csv.ts
    dashboard-card.tsx
    stats-card.tsx
    metric-card.tsx
    page-header.tsx
    search-bar.tsx
    status-badge.tsx
    severity-badge.tsx
    empty-state.tsx
    loading-state.tsx
    delete-dialog.tsx
    confirm-dialog.tsx
    form-field.tsx
  layout/
    sidebar.tsx
    topbar.tsx
    theme-toggle.tsx
    notification-bell.tsx
    global-search.tsx (Command palette)

features/
  alerts/
    components/               # feature-specific UI (columns.tsx, alert-form.tsx, alert-filters.tsx)
    hooks/
    types.ts
  incidents/
  assets/
  vulnerabilities/
  threat-intelligence/
  audit-logs/
  notifications/
  users/
  dashboard/
    components/               # charts, cards specific to the dashboard

actions/
  alert.actions.ts
  incident.actions.ts
  asset.actions.ts
  vulnerability.actions.ts
  threat.actions.ts
  user.actions.ts
  audit.actions.ts
  notification.actions.ts

services/
  alert.service.ts
  incident.service.ts
  asset.service.ts
  vulnerability.service.ts
  threat.service.ts
  user.service.ts
  audit.service.ts
  notification.service.ts
  authorization.service.ts    # role/permission checks shared across services

repositories/
  alert.repository.ts
  incident.repository.ts
  asset.repository.ts
  vulnerability.repository.ts
  threat.repository.ts
  user.repository.ts
  audit.repository.ts
  notification.repository.ts

schemas/
  alert.schema.ts              # Zod schemas, shared by forms + API + actions
  incident.schema.ts
  asset.schema.ts
  vulnerability.schema.ts
  threat.schema.ts
  user.schema.ts

types/
  alert.ts
  incident.ts
  asset.ts
  vulnerability.ts
  threat.ts
  user.ts
  audit.ts
  notification.ts
  api.ts                       # shared API response envelope types

hooks/
  use-data-table.ts
  use-debounce.ts
  use-toast-notification.ts
  use-current-user.ts
  use-permissions.ts

lib/
  prisma.ts
  clerk.ts
  rate-limit.ts
  csv-export.ts
  utils.ts
  constants.ts
  logger.ts

prisma/
  schema.prisma
  seed.ts
  migrations/
```

**Rule of thumb:** if code is reused by 2+ features → `components/shared` or `lib`. If it's specific to one domain → `features/<domain>`.

---

## 5. Authentication & Authorization

- Auth provider: **Clerk**, Organizations enabled (multi-tenant ready).
- `middleware.ts` protects all routes under `(dashboard)` and all `/api/**` routes except Clerk's own auth routes and public assets. Unauthenticated users are redirected to `/sign-in`.
- Roles are stored in Clerk's `organizationMembership.role` (or `publicMetadata.role` if not using Clerk Organizations) and mirrored into the local `User` table on webhook sync (`/api/webhooks/clerk`).
- Three roles: `ADMIN`, `ANALYST`, `VIEWER` (Prisma enum `Role`).
- **Every service method that mutates data must call `authorization.service.ts` to verify the current role is permitted.** Never rely on the UI hiding a button as the only guard — the server is the enforcement point.
- Permission matrix (see design.md §4 for full detail):
  - `ADMIN`: full CRUD on all entities, manage users, manage settings.
  - `ANALYST`: read dashboards/alerts, create/update incidents, cannot delete, cannot manage users.
  - `VIEWER`: read-only everywhere, no mutations.
- Unauthorized page access → redirect to `/dashboard` with a toast, or to `/sign-in` if unauthenticated. Unauthorized API calls → `403` with a Zod-validated error envelope.

---

## 6. Data Layer Conventions

- All models use `id String @id @default(cuid())`.
- All models have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Soft-deletable models (`User`, `Asset`, `Incident`, `Alert`) get `deletedAt DateTime?` — never hard-delete these; repositories filter `where: { deletedAt: null }` by default and expose an explicit `includeDeleted` param when needed.
- Use Prisma `enum` for all fixed-choice fields (severity, status, role, etc.) — never free-text strings for these.
- Every list-fetch repository method supports: pagination (`skip`/`take`), sorting, and filter params — mirrored 1:1 with what the DataTable component sends.
- Migrations are committed to the repo (`prisma/migrations`). Never edit an already-applied migration; create a new one.
- `prisma/seed.ts` must be idempotent (safe to re-run) and produce the volumes specified in design.md §9.

---

## 7. API Conventions

- Response envelope (all Route Handlers):
  ```ts
  { success: true, data: T } | { success: false, error: { code: string; message: string; details?: unknown } }
  ```
- All input (query params, body) validated with Zod before touching a service. Invalid input → `400` with field-level errors.
- Rate limiting middleware applied to all `/api/**` routes (see `lib/rate-limit.ts`), stricter limits on mutation endpoints.
- CSRF: Server Actions get CSRF protection from Next.js by default; Route Handlers used by non-Next clients require the standard Clerk session token check plus same-site cookies.
- Never interpolate raw user input into a Prisma `$queryRaw`. Use Prisma's parameterized query builder for everything; only use `$queryRaw` with tagged template parameterization if absolutely necessary, and never for user-controlled table/column names.

---

## 8. UI/Component Conventions

- Only use shadcn/ui primitives from `components/ui`; don't hand-roll a modal/dropdown/table when shadcn already provides one.
- Every list page uses the shared `DataTable` component — do not create a bespoke table per feature. Feature-specific pieces (column defs, filters) live in `features/<domain>/components/columns.tsx`.
- Every entity with a "state" (severity, status) renders through `SeverityBadge` / `StatusBadge` — colors are centralized in `lib/constants.ts`, not hardcoded per usage.
- Every async data view has: a `loading.tsx` (Suspense boundary using `LoadingState`/skeletons) and handles empty results with `EmptyState`.
- Every destructive action goes through `ConfirmDialog` / `DeleteDialog` — no silent deletes.
- Theme: `next-themes` with `class` strategy, persisted, default `system`.

---

## 9. Security Checklist (apply to every feature)

- [ ] Route protected by middleware + role check in service layer
- [ ] Zod validation on every input boundary (form, action, API)
- [ ] No raw SQL string concatenation
- [ ] Output-encoded by React by default — never use `dangerouslySetInnerHTML` with unsanitized data
- [ ] Rate limit applied to mutation endpoints
- [ ] Audit log entry written for create/update/delete on sensitive entities (Incident, User, Asset, Vulnerability)
- [ ] Secrets only via environment variables (`.env`, never committed); accessed via `lib/env.ts` (typed, validated with Zod at boot)
- [ ] Secure headers set in `next.config.ts` (CSP, X-Frame-Options, Referrer-Policy, etc.)

---

## 10. Delivery Process (how the agent should work)

Work **feature by feature**, and for each feature, in this exact order:

1. Prisma model(s) + migration
2. Zod schema(s) in `schemas/`
3. Repository
4. Service (with authorization checks)
5. Server Action(s)
6. Route Handler(s) (GET/POST/PUT/DELETE as applicable)
7. Types in `types/`
8. Feature UI components (form, columns, filters)
9. Page (Server Component) wiring it together, with `loading.tsx`
10. Seed data for the entity
11. Manual verification notes (what to check in the browser)

Do not move to the next feature until the current one compiles, is typed with no `any`, and satisfies the security checklist above.

When creating a file, state its path clearly before the contents. Keep explanations short — the code and file structure should be self-documenting; reserve prose for decisions that aren't obvious from the code.

---

## 11. Code Quality Bar

- `strict: true` in `tsconfig.json`; no `any`, no `@ts-ignore` without a one-line justification comment.
- Prefer small, composable functions/components over large ones.
- Shared logic extracted to `hooks/` or `lib/` the second time it's needed (rule of two).
- Every exported function has a meaningful name; avoid abbreviations.
- Error boundaries (`error.tsx`) at the `(dashboard)` segment level at minimum, plus per-feature where a failure shouldn't take down the whole shell.
- Optimistic UI updates only for low-risk, easily-reversible actions (e.g., "mark notification as read"), never for destructive actions.

---

## 12. Reference

See `design.md` in this repo for the full system design: entity relationship model, permission matrix, page-by-page UX spec, and dashboard/chart specification. `agent.md` defines *how to build*; `design.md` defines *what to build*.
