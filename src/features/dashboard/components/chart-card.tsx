import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, description, children, className }: Props) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export const TOOLTIP_STYLE = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--color-popover-foreground)",
} as const;
