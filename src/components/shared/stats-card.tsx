import type { Icon } from "@tabler/icons-react";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string | number;
  icon: Icon;
  hint?: string;
  trend?: { value: number; positiveIsGood?: boolean };
  accentClassName?: string;
};

export function StatsCard({
  label,
  value,
  icon: IconCmp,
  hint,
  trend,
  accentClassName = "text-primary bg-primary/10",
}: StatsCardProps) {
  const isUp = (trend?.value ?? 0) >= 0;
  const good = trend
    ? (trend.positiveIsGood ?? true) === isUp
    : true;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {trend ? (
            <p
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                good ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isUp ? (
                <IconArrowUpRight className="size-3.5" />
              ) : (
                <IconArrowDownRight className="size-3.5" />
              )}
              {Math.abs(trend.value)}% {hint}
            </p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accentClassName,
          )}
        >
          <IconCmp className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
