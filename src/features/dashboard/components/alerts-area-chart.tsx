"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TOOLTIP_STYLE } from "@/features/dashboard/components/chart-card";
import type { TimeSeriesDatum } from "@/types/dashboard";

export function AlertsAreaChart({ data }: { data: TimeSeriesDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          interval={6}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: "var(--color-border)" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Alerts"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#alertsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
