"use client";

import { IconLink } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { IncidentStatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IncidentRowActions } from "@/features/incidents/components/incident-row-actions";
import { formatRelative, initials } from "@/lib/format";
import type { AnalystOption, IncidentRow } from "@/types/incident";

export function getIncidentColumns(opts: {
  canUpdate: boolean;
  canDelete: boolean;
  analystOptions: AnalystOption[];
}): ColumnDef<IncidentRow, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: () => <DataTableColumnHeader title="Incident" sortKey="title" />,
      cell: ({ row }) => (
        <Link
          href={`/incidents/${row.original.id}`}
          className="min-w-0 hover:underline"
        >
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconLink className="size-3" />
            {row.original._count.incidentAlerts} linked
          </p>
        </Link>
      ),
    },
    {
      accessorKey: "severity",
      header: () => (
        <DataTableColumnHeader title="Severity" sortKey="severity" />
      ),
      cell: ({ row }) => <SeverityBadge value={row.original.severity} />,
    },
    {
      accessorKey: "status",
      header: () => <DataTableColumnHeader title="Status" sortKey="status" />,
      cell: ({ row }) => <IncidentStatusBadge value={row.original.status} />,
    },
    {
      id: "analyst",
      header: () => <DataTableColumnHeader title="Assignee" />,
      cell: ({ row }) => {
        const analyst = row.original.assignedAnalyst;
        if (!analyst)
          return <span className="text-muted-foreground">Unassigned</span>;
        return (
          <span className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={analyst.avatarUrl ?? undefined}
                alt={analyst.name}
              />
              <AvatarFallback className="text-[10px]">
                {initials(analyst.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{analyst.name}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <DataTableColumnHeader title="Created" sortKey="createdAt" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelative(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <IncidentRowActions
          incident={row.original}
          analystOptions={opts.analystOptions}
          canUpdate={opts.canUpdate}
          canDelete={opts.canDelete}
        />
      ),
    },
  ];
}
