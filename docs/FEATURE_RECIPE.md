# Feature Recipe (follow EXACTLY)

This repo builds a SOC dashboard. Read `agent.md` and `design.md` first. The
**Alerts** feature is the canonical reference — mirror its structure, style,
and conventions precisely. Study these files before writing anything:

- `src/schemas/alert.schema.ts`
- `src/repositories/alert.repository.ts`
- `src/services/alert.service.ts`
- `src/actions/alert.actions.ts`
- `src/app/api/alerts/route.ts` and `src/app/api/alerts/[id]/route.ts`
- `src/types/alert.ts`
- `src/features/alerts/components/*` (columns, row-actions, form, bulk-actions, table)
- `src/app/(dashboard)/alerts/page.tsx`, `loading.tsx`, `[id]/page.tsx`

## Hard rules

- TypeScript strict, **no `any`**, no `@ts-ignore`.
- React components ≤ ~150 lines (forms may run longer — that's fine).
- Only the repository layer imports `prisma`. Services call repositories, never
  Prisma directly. Services own authorization (`assertCan`) + audit
  (`auditService.record`) on every mutation.
- Route handlers are thin: wrap with `apiRoute("read"|"mutation", …)` from
  `@/lib/route-utils`, parse with the Zod schema, call the service, return
  `ok(...)`. Dynamic routes use `apiRoute<{ id: string }>(...)`.
- Server actions: `"use server"`, get `getAuthContext()`, parse with the schema,
  call the service, `revalidatePath(...)`, return `actionOk(...)` /
  `actionError(error)` from `@/lib/action-utils`.
- Reads are open to all authenticated roles (no `assertCan`); mutations gate via
  the permission matrix in `src/services/authorization.service.ts`.
- Two Zod schemas per entity: a **server** create schema (may use
  preprocess/coerce/defaults) and a **form** schema (plain `z.string()` fields,
  no preprocess/defaults) so react-hook-form input/output types match. The form
  submits to the action, which re-parses with the server schema.
- Badges come from `@/components/shared/status-badge` and
  `@/components/shared/severity-badge`. Colors/labels live in
  `src/lib/constants.ts` — never hardcode. Facet options via
  `facetOptions(STYLES_MAP)` from `@/lib/query-utils`.
- Pages parse params with `readListParams` / `readArray` from
  `@/lib/search-params`; filters validated via `asEnumArray(values, EnumObj)`.
- Permissions passed to client components as plain booleans computed on the
  server page via `can(ctx.role, "…")`. Never import server-only services into
  client components.
- Every list page: `PageHeader`, the shared `DataTable`, an `EmptyState`, and a
  `loading.tsx` using `TableLoadingState`.
- Destructive actions go through `ConfirmDialog`/`DeleteDialog`.
- Format helpers: `@/lib/format` (`formatDateTime`, `formatRelative`,
  `humanize`). Use `font-mono` for IPs/hashes/CVEs.

## Per-feature file checklist

1. `src/schemas/<entity>.schema.ts` — server create + update + form schemas + types
2. `src/repositories/<entity>.repository.ts` — `list(filters)`, `findById`, `create`, `update`, `softDelete` (if soft-deletable)
3. `src/services/<entity>.service.ts` — `list`, `getById`, `create`, `update`, `remove` with `assertCan` + `auditService.record`
4. `src/actions/<entity>.actions.ts`
5. `src/app/api/<entity>/route.ts` + `[id]/route.ts` (only the verbs the design needs)
6. `src/types/<entity>.ts`
7. `src/features/<entity>/components/` — `columns.tsx`, `<entity>-row-actions.tsx`, `<entity>-form.tsx`, `<entity>-table.tsx` (+ bulk-actions if applicable)
8. `src/app/(dashboard)/<entity>/page.tsx` + `loading.tsx` (+ `[id]/page.tsx` if the design specifies a detail view)

## Verification

Only create files inside your assigned feature's scope. Do NOT modify shared
files or other features. When done, note any type assumptions you made. The
orchestrator runs the final project-wide `pnpm exec tsc --noEmit`.
