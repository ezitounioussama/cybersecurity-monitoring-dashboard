import { prisma } from "@/lib/prisma";

/** Read-only aggregation queries powering the dashboard. */
export const dashboardRepository = {
  async counts(organizationId: string) {
    const [
      activeAlerts,
      criticalIncidents,
      openVulnerabilities,
      totalAssets,
      activeThreats,
      unpatchedCritical,
    ] = await Promise.all([
      prisma.alert.count({
        where: {
          organizationId,
          deletedAt: null,
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      }),
      prisma.incident.count({
        where: {
          organizationId,
          deletedAt: null,
          severity: "CRITICAL",
          status: { not: "CLOSED" },
        },
      }),
      prisma.vulnerability.count({
        where: { organizationId, patchStatus: { not: "PATCHED" } },
      }),
      prisma.asset.count({ where: { organizationId, deletedAt: null } }),
      prisma.threatFeed.count({ where: { organizationId, status: "ACTIVE" } }),
      prisma.vulnerability.count({
        where: {
          organizationId,
          severity: "CRITICAL",
          patchStatus: { not: "PATCHED" },
        },
      }),
    ]);
    return {
      activeAlerts,
      criticalIncidents,
      openVulnerabilities,
      totalAssets,
      activeThreats,
      unpatchedCritical,
    };
  },

  incidentSeverity(organizationId: string) {
    return prisma.incident.groupBy({
      by: ["severity"],
      where: { organizationId, deletedAt: null },
      _count: { _all: true },
    });
  },

  assetCriticality(organizationId: string) {
    return prisma.asset.groupBy({
      by: ["criticality"],
      where: { organizationId, deletedAt: null },
      _count: { _all: true },
    });
  },

  vulnerabilitySeverity(organizationId: string) {
    return prisma.vulnerability.groupBy({
      by: ["severity"],
      where: { organizationId },
      _count: { _all: true },
    });
  },

  threatSources(organizationId: string) {
    return prisma.threatFeed.groupBy({
      by: ["source"],
      where: { organizationId },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 6,
    });
  },

  async alertTimestampsSince(organizationId: string, since: Date) {
    const rows = await prisma.alert.findMany({
      where: { organizationId, deletedAt: null, detectedAt: { gte: since } },
      select: { detectedAt: true },
    });
    return rows.map((r) => r.detectedAt);
  },
};
