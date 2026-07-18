export type ChartDatum = { name: string; value: number; fill?: string };
export type TimeSeriesDatum = { date: string; count: number };

export type DashboardStats = {
  activeAlerts: number;
  criticalIncidents: number;
  openVulnerabilities: number;
  totalAssets: number;
  activeThreats: number;
  systemHealth: number;
};

export type DashboardOverview = {
  stats: DashboardStats;
  alertsOverTime: TimeSeriesDatum[];
  incidentSeverity: ChartDatum[];
  assetCriticality: ChartDatum[];
  vulnerabilitySeverity: ChartDatum[];
  threatSources: ChartDatum[];
};
