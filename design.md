# DESIGN.md — Cybersecurity Monitoring Dashboard

Defines *what* the system is: architecture, data model, roles, pages, and UI/UX. Pair with `agent.md`, which defines *how* it gets built.

---

## 1. Overview

A SOC (Security Operations Center) monitoring dashboard for tracking alerts, incidents, assets, vulnerabilities, and threat intelligence across an organization, with role-based access, audit logging, and real-time-style notifications.

**Primary personas:**
- **Admin** — runs the platform: manages users, has full CRUD everywhere.
- **Analyst** — day-to-day SOC operator: triages alerts, manages incidents.
- **Viewer** — stakeholder/auditor: read-only visibility.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌───────────────┐   ┌───────────────┐   ┌────────────────┐ │
│  │ Server         │   │ Server         │   │ Route Handlers │ │
│  │ Components     │   │ Actions        │   │ (/api/**)      │ │
│  │ (pages)        │   │ (mutations)    │   │ (REST surface) │ │
│  └───────┬───────┘   └───────┬───────┘   └────────┬───────┘ │
│          └────────────┬───────┴────────────────────┘         │
│                        ▼                                     │
│                 Services layer                               │
│         (business rules + authorization)                     │
│                        ▼                                     │
│                Repositories layer                             │
│               (Prisma queries only)                           │
│                        ▼                                     │
│                  Prisma Client                                │
└─────────────────────────┬──────────────────────────────────┘
                          ▼
                    PostgreSQL
                          ▲
                          │
                   Clerk (Auth/Orgs) ── webhooks ── User sync
```

- **Clerk** is the source of truth for identity and org membership; role is mirrored into Postgres `User.role` for fast joins/filtering and for audit trails that must survive even if Clerk data changes.
- **TanStack Query** is used sparingly on the client — mainly for notification polling and any widget needing client-side refetch/mutate without a full page reload.

---

## 3. Data Model (Prisma)

### 3.1 Entity Relationship Summary

```
Organization 1───* User
Organization 1───* Alert
Organization 1───* Incident
Organization 1───* Asset
Organization 1───* Vulnerability
Organization 1───* ThreatFeed
Organization 1───* AuditLog
Organization 1───* Notification

User 1───* Incident        (assignedAnalyst)
User 1───* AuditLog        (actor)
User 1───* Notification    (recipient)
User 1───* Activity        (actor)

Asset 1───* Vulnerability
Asset 1───* Alert (destinationAsset, optional)

Incident *───* Alert       (via IncidentAlert join, an incident can bundle multiple alerts)
Incident 1───* Activity    (timeline entries)
```

### 3.2 Enums

```prisma
enum Role {
  ADMIN
  ANALYST
  VIEWER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AlertStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
  FALSE_POSITIVE
}

enum IncidentStatus {
  NEW
  INVESTIGATING
  CONTAINED
  ERADICATED
  RECOVERED
  CLOSED
}

enum AssetStatus {
  ACTIVE
  INACTIVE
  DECOMMISSIONED
  UNDER_MAINTENANCE
}

enum AssetCriticality {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum PatchStatus {
  PATCHED
  UNPATCHED
  IN_PROGRESS
  NOT_APPLICABLE
}

enum ThreatConfidence {
  LOW
  MEDIUM
  HIGH
  CONFIRMED
}

enum ThreatStatus {
  ACTIVE
  MONITORING
  MITIGATED
  EXPIRED
}

enum NotificationType {
  ALERT
  INCIDENT
  VULNERABILITY
  SYSTEM
  USER
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  ROLE_CHANGE
}
```

### 3.3 Core Models (conceptual field lists — full Prisma syntax lives in `prisma/schema.prisma`)

**Organization**
`id, clerkOrgId (unique), name, slug, plan, createdAt, updatedAt` → has many Users/Alerts/Incidents/Assets/Vulnerabilities/ThreatFeeds/AuditLogs/Notifications.

**User**
`id, clerkUserId (unique), organizationId (FK), email, name, avatarUrl, role (Role), isActive, deletedAt (soft delete), createdAt, updatedAt` → has many assigned Incidents, AuditLogs, Notifications, Activities.

**Alert**
`id, organizationId (FK), title, description, severity (Severity), status (AlertStatus), source (string, e.g. "Firewall", "IDS/IPS"), sourceIp, destinationIp, destinationAssetId (FK → Asset, nullable), rule (string), rawLog (text, nullable), detectedAt, resolvedAt (nullable), deletedAt (soft delete), createdAt, updatedAt`.

**Incident**
`id, organizationId (FK), title, description, severity (Severity), status (IncidentStatus), assignedAnalystId (FK → User, nullable), evidenceUrls (string[]), deletedAt (soft delete), createdAt, updatedAt` → has many `Activity` (timeline), many-to-many with `Alert` via `IncidentAlert`.

**IncidentAlert** (join table)
`incidentId (FK), alertId (FK), linkedAt` — composite PK.

**Asset**
`id, organizationId (FK), hostname, ipAddress, operatingSystem, criticality (AssetCriticality), status (AssetStatus), ownerId (FK → User, nullable), lastScanAt (nullable), deletedAt (soft delete), createdAt, updatedAt` → has many Vulnerabilities, Alerts (as destination).

**Vulnerability**
`id, organizationId (FK), cve (string, e.g. "CVE-2024-12345"), cvssScore (float), severity (Severity), assetId (FK → Asset), patchStatus (PatchStatus), discoveredAt, exploitAvailable (boolean), description, createdAt, updatedAt`.

**ThreatFeed**
`id, organizationId (FK), ioc (string — the indicator value), iocType (enum: IP | DOMAIN | HASH | URL), ipAddress (nullable), domain (nullable), hash (nullable), source (string, e.g. "AlienVault OTX"), confidence (ThreatConfidence), lastSeenAt, status (ThreatStatus), createdAt, updatedAt`.

**AuditLog**
`id, organizationId (FK), userId (FK → User), action (AuditAction), entityType (string), entityId (string), ipAddress, role (Role, snapshot at time of action), metadata (Json, nullable), createdAt`. Append-only, no update/delete.

**Notification**
`id, organizationId (FK), userId (FK → User, recipient), type (NotificationType), title, message, isRead (boolean, default false), relatedEntityType (nullable), relatedEntityId (nullable), createdAt`.

**Activity**
`id, incidentId (FK → Incident, nullable), userId (FK → User, actor), action (string, e.g. "status changed to Contained"), createdAt` — powers the incident timeline.

**Indexing notes:** index `organizationId` on every model; index `(status, severity)` on Alert/Incident; index `cve` and `assetId` on Vulnerability; index `ioc` on ThreatFeed; index `(userId, createdAt)` on AuditLog and Notification for fast recent-activity queries.

---

## 4. Roles & Permission Matrix

| Capability | Admin | Analyst | Viewer |
|---|:---:|:---:|:---:|
| View dashboard/charts | ✅ | ✅ | ✅ |
| View Alerts/Incidents/Assets/Vulnerabilities/Threats | ✅ | ✅ | ✅ |
| Create/Update Incidents | ✅ | ✅ | ❌ |
| Create/Update/Delete Alerts | ✅ | Update only | ❌ |
| Create/Update/Delete Assets | ✅ | ❌ | ❌ |
| Create/Update/Delete Vulnerabilities | ✅ | ❌ | ❌ |
| Manage Threat Intelligence entries | ✅ | ❌ | ❌ |
| Manage Users / Roles | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ (read-only) | ❌ |
| Export CSV | ✅ | ✅ | ❌ |
| Settings (org-level) | ✅ | ❌ | ❌ |

Enforcement happens twice: UI hides/disables actions the role can't perform (UX clarity), and the service layer re-checks on every mutation (security boundary — the UI check is never trusted alone).

---

## 5. Navigation / Sidebar

Collapsible sidebar, icon-only when collapsed, tabler icons throughout:

1. Dashboard
2. Alerts
3. Incidents
4. Assets
5. Vulnerabilities
6. Threat Intelligence
7. Audit Logs
8. Notifications (with unread badge)
9. Users *(Admin only, hidden for others)*
10. Settings

Topbar: global search (Command palette, `⌘K`), notification bell, theme toggle, user menu (Clerk `<UserButton>`), org switcher (Clerk `<OrganizationSwitcher>`).

---

## 6. Page Specifications

### 6.1 Dashboard (`/dashboard`)
**Stat cards** (6): Active Alerts, Critical Incidents, Open Vulnerabilities, Total Assets, Threat Intel entries (active), System Health (derived score).
**Charts** (Recharts, responsive grid):
- Alerts over time — line/area chart, last 30 days
- Incident severity — donut/pie
- Asset distribution — bar chart by criticality or OS
- Vulnerability severity — stacked bar
- Threat sources — horizontal bar or pie by feed source
All chart data computed server-side (aggregation queries in services), passed as props to client chart components.

### 6.2 Alerts (`/alerts`)
Table columns: Severity (badge), Status (badge), Source, Destination (IP/asset), Rule, Timestamp, Actions.
Filters: Severity, Status, Source, Date range (shadcn Calendar + Popover).
Row actions: View detail (Sheet/Drawer), Acknowledge, Resolve, Mark false positive, Delete (Admin only).
Detail view: raw log, linked incident (if any), timeline of status changes.

### 6.3 Incidents (`/incidents`)
Fields: Title, Description, Severity, Assigned Analyst (avatar + name), Status, Evidence (file/link list), Created Date, Timeline (Activity feed).
Table + detail page (`/incidents/[id]`) with tabs: Overview, Linked Alerts, Timeline, Evidence.
CRUD via dialog/drawer forms (React Hook Form + Zod), Admin full CRUD, Analyst create/update, Viewer read-only.

### 6.4 Assets (`/assets`)
Columns: Hostname, IP, Operating System, Criticality (badge), Owner, Status (badge), Last Scan.
Global search + column filters. Detail drawer shows linked vulnerabilities and alerts for that asset.

### 6.5 Vulnerabilities (`/vulnerabilities`)
Columns: CVE (linkable to NVD reference format), CVSS Score (numeric, color-coded), Severity (badge), Asset, Patch Status (badge), Discovery Date, Exploit Available (badge/icon).
Color coding: Low = slate/green, Medium = yellow, High = orange, Critical = red — centralized in `lib/constants.ts`.

### 6.6 Threat Intelligence (`/threat-intelligence`)
Columns: IOC, IP, Domain, Hash, Source, Confidence (badge), Last Seen, Status (badge).
Read-heavy page; Admin can add/edit/retire entries.

### 6.7 Audit Logs (`/audit-logs`)
Columns: User (avatar + name), Action, Entity (type + id, linkable), Timestamp, IP Address, Role (snapshot).
Read-only for everyone; visible to Admin and Analyst, hidden from Viewer. Append-only — no edit/delete UI at all.

### 6.8 Notifications (`/notifications` + bell dropdown)
List of notifications with unread indicator, "Mark as read"/"Mark all as read", filter by type. Toaster (shadcn `sonner`/`toast`) fires for new high-severity alerts/incidents created during the session (simulated real-time via polling with TanStack Query, or Server-Sent Events if upgraded later).

### 6.9 Users (`/users`, Admin only)
Columns: Name, Email, Role (editable dropdown for Admin), Status (Active/Inactive), Last active.
Invite flow delegates to Clerk's invitation system; role changes write an `AuditLog` entry with action `ROLE_CHANGE`.

### 6.10 Settings (`/settings`)
Org profile, theme preference, notification preferences. Admin-only sections clearly separated from user-level preferences.

---

## 7. Shared DataTable Behavior

Every table (Alerts, Incidents, Assets, Users, Vulnerabilities, Threat Feed, Audit Logs) is built on one `DataTable` component with:

- Sorting (multi-column where relevant)
- Global search input
- Column-specific filters (faceted filter using shadcn `Popover` + `Command`)
- Column visibility toggle (`DropdownMenu` with checkboxes)
- Pagination (`Pagination` component, page-size selector)
- Column resize
- Sticky header on scroll
- Row selection (checkbox column) → enables bulk actions (bulk resolve, bulk delete, bulk export)
- CSV export (respects current filters/selection)
- Responsive: collapses to a card-list layout below `md` breakpoint, or horizontal scroll with sticky first column

---

## 8. Design System

**Visual language:** modern SOC aesthetic — dark-mode-first but fully supporting light mode, rounded-xl cards, soft shadows (`shadow-sm`/`shadow-md`, never harsh), generous but efficient spacing, monospace accents for technical values (IPs, hashes, CVEs).

- **Color semantics** (consistent across badges, charts, borders):
  - Critical/High severity → red/orange
  - Medium → amber/yellow
  - Low/Info → slate/blue/green
  - Success/Resolved → green
  - Neutral/Pending → slate/gray
- **Typography:** system/sans for UI text, monospace (e.g. `font-mono`) for IPs, hashes, CVE IDs, log excerpts.
- **Components used throughout:** Card, Dialog, Drawer, Sheet, Popover, Dropdown, Tabs, Command, Tooltip, Table, Avatar, Calendar, Alert Dialog, Skeleton, Pagination, Breadcrumb, Toast/Sonner, Badge.
- **Theme:** dark / light / system via `next-themes`, persisted in `localStorage` + reflected as a class on `<html>`.
- **Responsiveness:** sidebar collapses to icon rail on tablet, to an off-canvas Sheet on mobile; dashboard grid reflows from 3-4 columns → 2 → 1.

---

## 9. Seed Data Targets

| Entity | Count |
|---|---:|
| Users | 20 |
| Alerts | 200 |
| Incidents | 100 |
| Assets | 300 |
| Vulnerabilities | 500 |
| Threat Intelligence entries | 50 |
| Audit Logs | derived from above (one per mutation-like seed event) |
| Notifications | derived (subset of alerts/incidents) |

Seed data should look realistic: plausible hostnames (`web-prod-01`, `db-primary-03`), private/public IP mixes, real-world CVE ID formatting, common OS names (Ubuntu 22.04, Windows Server 2022, RHEL 9), varied severities weighted toward Medium/Low (realistic distribution, not uniform), and a spread of timestamps across the last 90 days for meaningful time-series charts.

---

## 10. Non-Functional Requirements

- **Security:** see `agent.md` §9 checklist — authn/authz, input validation, rate limiting, CSRF, injection/XSS prevention, secure headers, env-based secrets.
- **Performance:** paginate all list queries server-side (never fetch full tables to the client); memoize expensive chart aggregations where feasible; use `loading.tsx`/Suspense to stream shell before data resolves.
- **Accessibility:** shadcn/Radix primitives provide keyboard nav and ARIA out of the box — preserve it (don't override focus/aria attributes casually); maintain color-contrast for all badge/status colors in both themes.
- **Observability:** structured logging via `lib/logger.ts`; every mutation is mirrored into `AuditLog` for traceability.
- **Multi-tenancy readiness:** every query scoped by `organizationId` derived from the authenticated session — never trust a client-supplied org id.

---

## 11. Out of Scope (for initial delivery, explicitly deferred)

- True real-time push (WebSockets/SSE) — v1 uses polling; can be swapped in later without changing the Notification data model.
- Automated threat-feed ingestion from external APIs — v1 seeds/manages ThreatFeed entries manually; ingestion connectors are a future integration behind the same `ThreatFeed` model.
- SSO providers beyond what Clerk offers out of the box.
