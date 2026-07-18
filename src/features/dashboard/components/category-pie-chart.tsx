"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TOOLTIP_STYLE } from "@/features/dashboard/components/chart-card";
import { CHART_COLORS } from "@/lib/constants";
import type { ChartDatum } from "@/types/dashboard";

export function CategoryPieChart({ data }: { data: ChartDatum[] }) {
  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return <EmptyChart />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          strokeWidth={2}
          stroke="var(--color-card)"
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.fill ?? CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      No data to display.
    </div>
  );
}
