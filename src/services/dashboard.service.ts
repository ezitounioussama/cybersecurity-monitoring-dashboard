import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import type { AssetCriticality, Severity } from "@/generated/prisma/enums";
import { SEVERITY_HEX } from "@/lib/constants";
import { humanize } from "@/lib/format";
import { dashboardRepository } from "@/repositories/dashboard.repository";
import type { ChartDatum, DashboardOverview } from "@/types/dashboard";
import type { AuthContext } from "@/types/auth";

const SEVERITY_ORDER: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CRITICALITY_ORDER: AssetCriticality[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function computeHealth(input: {
  activeAlerts: number;
  criticalIncidents: number;
  activeThreats: number;
  unpatchedCritical: number;
}): number {
  const penalty =
    input.criticalIncidents * 8 +
    input.unpatchedCritical * 3 +
    input.activeThreats * 2 +
    Math.floor(input.activeAlerts / 5);
  return Math.max(0, Math.min(100, 100 - penalty));
}

function buildTimeSeries(timestamps: Date[], days: number) {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const key = format(startOfDay(ts), "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return eachDayOfInterval({ start, end }).map((day) => ({
    date: format(day, "MMM d"),
    count: counts.get(format(day, "yyyy-MM-dd")) ?? 0,
  }));
}

export const dashboardService = {
  async getOverview(ctx: AuthContext): Promise<DashboardOverview> {
    const orgId = ctx.organizationId;
    const [counts, incidentSev, assetCrit, vulnSev, threatSrc, alertTs] = await Promise.all([
      dashboardRepository.counts(orgId),
      dashboardRepository.incidentSeverity(orgId),
      dashboardRepository.assetCriticality(orgId),
      dashboardRepository.vulnerabilitySeverity(orgId),
      dashboardRepository.threatSources(orgId),
      dashboardRepository.alertTimestampsSince(orgId, subDays(startOfDay(new Date()), 29)),
    ]);

    const bySeverity = (
      rows: { severity: Severity; _count: { _all: number } }[],
    ): ChartDatum[] => {
      const map = new Map(rows.map((r) => [r.severity, r._count._all]));
      return SEVERITY_ORDER.map((s) => ({
        name: humanize(s),
        value: map.get(s) ?? 0,
        fill: SEVERITY_HEX[s],
      }));
    };

    return {
      stats: {
        activeAlerts: counts.activeAlerts,
        criticalIncidents: counts.criticalIncidents,
        openVulnerabilities: counts.openVulnerabilities,
        totalAssets: counts.totalAssets,
        activeThreats: counts.activeThreats,
        systemHealth: computeHealth(counts),
      },
      alertsOverTime: buildTimeSeries(alertTs, 30),
      incidentSeverity: bySeverity(incidentSev),
      vulnerabilitySeverity: bySeverity(vulnSev),
      assetCriticality: CRITICALITY_ORDER.map((c) => {
        const found = assetCrit.find((r) => r.criticality === c);
        return { name: humanize(c), value: found?._count._all ?? 0, fill: SEVERITY_HEX[c] };
      }),
      threatSources: threatSrc.map((r) => ({ name: r.source, value: r._count._all })),
    };
  },
};
