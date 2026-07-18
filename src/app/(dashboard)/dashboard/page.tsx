import {
  IconActivityHeartbeat,
  IconAlertTriangle,
  IconBug,
  IconRadar2,
  IconServer2,
  IconShieldBolt,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { AlertsAreaChart } from "@/features/dashboard/components/alerts-area-chart";
import { CategoryBarChart } from "@/features/dashboard/components/category-bar-chart";
import { CategoryPieChart } from "@/features/dashboard/components/category-pie-chart";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import { getAuthContext } from "@/lib/auth";
import { dashboardService } from "@/services/dashboard.service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  const overview = await dashboardService.getOverview(ctx);
  const { stats } = overview;

  const cards = [
    { label: "Active Alerts", value: stats.activeAlerts, icon: IconAlertTriangle, accent: "text-red-600 bg-red-500/10" },
    { label: "Critical Incidents", value: stats.criticalIncidents, icon: IconShieldBolt, accent: "text-orange-600 bg-orange-500/10" },
    { label: "Open Vulnerabilities", value: stats.openVulnerabilities, icon: IconBug, accent: "text-amber-600 bg-amber-500/10" },
    { label: "Total Assets", value: stats.totalAssets, icon: IconServer2, accent: "text-sky-600 bg-sky-500/10" },
    { label: "Active Threats", value: stats.activeThreats, icon: IconRadar2, accent: "text-primary bg-primary/10" },
    { label: "System Health", value: `${stats.systemHealth}%`, icon: IconActivityHeartbeat, accent: "text-emerald-600 bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${ctx.name.split(" ")[0]}`}
        description="Security posture across your organization at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <StatsCard
            key={c.label}
            label={c.label}
            value={c.value}
            icon={c.icon}
            accentClassName={c.accent}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Alerts over time" description="Last 30 days" className="lg:col-span-2">
          <AlertsAreaChart data={overview.alertsOverTime} />
        </ChartCard>
        <ChartCard title="Incidents by severity">
          <CategoryPieChart data={overview.incidentSeverity} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Assets by criticality">
          <CategoryBarChart data={overview.assetCriticality} />
        </ChartCard>
        <ChartCard title="Vulnerabilities by severity">
          <CategoryBarChart data={overview.vulnerabilitySeverity} />
        </ChartCard>
        <ChartCard title="Top threat sources">
          <CategoryBarChart data={overview.threatSources} layout="vertical" />
        </ChartCard>
      </div>
    </div>
  );
}
