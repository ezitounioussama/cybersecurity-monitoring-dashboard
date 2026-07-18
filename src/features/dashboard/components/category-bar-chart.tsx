"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { TOOLTIP_STYLE } from "@/features/dashboard/components/chart-card";
import type { ChartDatum } from "@/types/dashboard";

type Props = { data: ChartDatum[]; layout?: "vertical" | "horizontal" };

export function CategoryBarChart({ data, layout = "horizontal" }: Props) {
  const isHorizontalBars = layout === "vertical"; // recharts "vertical" = horizontal bars

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 8, left: isHorizontalBars ? 8 : -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={!isHorizontalBars} horizontal={isHorizontalBars} />
        {isHorizontalBars ? (
          <>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              allowDecimals={false}
              width={32}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
        <Bar dataKey="value" name="Count" radius={6} maxBarSize={56}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.fill ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
