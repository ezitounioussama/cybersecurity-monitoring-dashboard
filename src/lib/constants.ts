import type {
  AlertStatus,
  AssetCriticality,
  AssetStatus,
  IncidentStatus,
  PatchStatus,
  Role,
  Severity,
  ThreatConfidence,
  ThreatStatus,
} from "@/generated/prisma/enums";

/**
 * Centralized status/severity color styles (design.md §8).
 * Every badge references these — never hardcode colors at the call site.
 */
type BadgeStyle = { label: string; className: string };

const RED = "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
const ORANGE =
  "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
const AMBER =
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
const GREEN =
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
const BLUE = "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
const SLATE =
  "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
const PURPLE =
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";

export const SEVERITY_STYLES: Record<Severity, BadgeStyle> = {
  LOW: { label: "Low", className: BLUE },
  MEDIUM: { label: "Medium", className: AMBER },
  HIGH: { label: "High", className: ORANGE },
  CRITICAL: { label: "Critical", className: RED },
};

export const ALERT_STATUS_STYLES: Record<AlertStatus, BadgeStyle> = {
  OPEN: { label: "Open", className: RED },
  ACKNOWLEDGED: { label: "Acknowledged", className: AMBER },
  RESOLVED: { label: "Resolved", className: GREEN },
  FALSE_POSITIVE: { label: "False Positive", className: SLATE },
};

export const INCIDENT_STATUS_STYLES: Record<IncidentStatus, BadgeStyle> = {
  NEW: { label: "New", className: RED },
  INVESTIGATING: { label: "Investigating", className: ORANGE },
  CONTAINED: { label: "Contained", className: AMBER },
  ERADICATED: { label: "Eradicated", className: BLUE },
  RECOVERED: { label: "Recovered", className: GREEN },
  CLOSED: { label: "Closed", className: SLATE },
};

export const ASSET_STATUS_STYLES: Record<AssetStatus, BadgeStyle> = {
  ACTIVE: { label: "Active", className: GREEN },
  INACTIVE: { label: "Inactive", className: SLATE },
  DECOMMISSIONED: { label: "Decommissioned", className: RED },
  UNDER_MAINTENANCE: { label: "Under Maintenance", className: AMBER },
};

export const ASSET_CRITICALITY_STYLES: Record<AssetCriticality, BadgeStyle> = {
  LOW: { label: "Low", className: BLUE },
  MEDIUM: { label: "Medium", className: AMBER },
  HIGH: { label: "High", className: ORANGE },
  CRITICAL: { label: "Critical", className: RED },
};

export const PATCH_STATUS_STYLES: Record<PatchStatus, BadgeStyle> = {
  PATCHED: { label: "Patched", className: GREEN },
  UNPATCHED: { label: "Unpatched", className: RED },
  IN_PROGRESS: { label: "In Progress", className: AMBER },
  NOT_APPLICABLE: { label: "N/A", className: SLATE },
};

export const THREAT_CONFIDENCE_STYLES: Record<ThreatConfidence, BadgeStyle> = {
  LOW: { label: "Low", className: SLATE },
  MEDIUM: { label: "Medium", className: BLUE },
  HIGH: { label: "High", className: ORANGE },
  CONFIRMED: { label: "Confirmed", className: RED },
};

export const THREAT_STATUS_STYLES: Record<ThreatStatus, BadgeStyle> = {
  ACTIVE: { label: "Active", className: RED },
  MONITORING: { label: "Monitoring", className: AMBER },
  MITIGATED: { label: "Mitigated", className: GREEN },
  EXPIRED: { label: "Expired", className: SLATE },
};

export const ROLE_STYLES: Record<Role, BadgeStyle> = {
  ADMIN: { label: "Admin", className: PURPLE },
  ANALYST: { label: "Analyst", className: BLUE },
  VIEWER: { label: "Viewer", className: SLATE },
};

/** Severity → chart fill (Recharts needs a concrete color string). */
export const SEVERITY_HEX: Record<Severity, string> = {
  LOW: "#0ea5e9",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

/** Recharts series colors — mapped to the brand gradient CSS variables. */
export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Single shared tenant used when a user signs in without a Clerk Organization.
 * Keeps seeded data visible on first login. The seed script creates this org.
 */
export const DEFAULT_ORG = {
  clerkOrgId: "sentinel-default",
  name: "Sentinel Security",
  slug: "sentinel",
} as const;
