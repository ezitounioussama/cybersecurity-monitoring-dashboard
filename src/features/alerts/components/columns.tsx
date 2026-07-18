"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { IconServer } from "@tabler/icons-react";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { AlertStatusBadge } from "@/components/shared/status-badge";
import { AlertRowActions } from "@/features/alerts/components/alert-row-actions";
import { formatRelative } from "@/lib/format";
import type { AlertWithAsset } from "@/types/alert";

export function getAlertColumns(perms: {
  canUpdate: boolean;
  canDelete: boolean;
}): ColumnDef<AlertWithAsset, unknown>[] {
  return [
    {
      accessorKey: "severity",
      header: () => <DataTableColumnHeader title="Severity" sortKey="severity" />,
      cell: ({ row }) => <SeverityBadge value={row.original.severity} />,
    },
    {
      accessorKey: "status",
      header: () => <DataTableColumnHeader title="Status" sortKey="status" />,
      cell: ({ row }) => <AlertStatusBadge value={row.original.status} />,
    },
    {
      accessorKey: "title",
      header: () => <DataTableColumnHeader title="Alert" sortKey="title" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.source}</p>
        </div>
      ),
    },
    {
      id: "destination",
      header: () => <DataTableColumnHeader title="Destination" />,
      cell: ({ row }) => {
        const { destinationAsset, destinationIp } = row.original;
        if (destinationAsset) {
          return (
            <span className="flex items-center gap-1.5 text-sm">
              <IconServer className="size-3.5 text-muted-foreground" />
              {destinationAsset.hostname}
            </span>
          );
        }
        return destinationIp ? (
          <span className="font-mono text-xs">{destinationIp}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "rule",
      header: () => <DataTableColumnHeader title="Rule" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.rule}</span>
      ),
    },
    {
      accessorKey: "detectedAt",
      header: () => <DataTableColumnHeader title="Detected" sortKey="detectedAt" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelative(row.original.detectedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <AlertRowActions alert={row.original} canUpdate={perms.canUpdate} canDelete={perms.canDelete} />
      ),
    },
  ];
}
