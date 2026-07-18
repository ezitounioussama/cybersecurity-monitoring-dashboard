"use client";

import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useDataTableParams } from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  /** Server sort field. Omit to render a non-sortable header. */
  sortKey?: string;
  className?: string;
};

export function DataTableColumnHeader({ title, sortKey, className }: Props) {
  const { sortBy, sortDir, setSort } = useDataTableParams();

  if (!sortKey) {
    return (
      <span className={cn("text-xs font-medium", className)}>{title}</span>
    );
  }

  const active = sortBy === sortKey;
  const nextDir = active && sortDir === "asc" ? "desc" : "asc";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2 h-8 gap-1 px-2 data-[active=true]:text-foreground",
        className,
      )}
      data-active={active}
      onClick={() => setSort(sortKey, nextDir)}
    >
      <span className="text-xs font-medium">{title}</span>
      {active ? (
        sortDir === "asc" ? (
          <IconSortAscending className="size-3.5" />
        ) : (
          <IconSortDescending className="size-3.5" />
        )
      ) : (
        <IconArrowsSort className="size-3.5 opacity-50" />
      )}
    </Button>
  );
}
