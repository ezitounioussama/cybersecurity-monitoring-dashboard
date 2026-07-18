"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import {
  ThreatConfidenceBadge,
  ThreatStatusBadge,
} from "@/components/shared/status-badge";
import { ThreatRowActions } from "@/features/threat-intelligence/components/threat-row-actions";
import { formatRelative, humanize } from "@/lib/format";
import type { ThreatFeedRow } from "@/types/threat";

export function getThreatColumns(perms: {
  canUpdate: boolean;
  canDelete: boolean;
}): ColumnDef<ThreatFeedRow, unknown>[] {
  return [
    {
      accessorKey: "ioc",
      header: () => <DataTableColumnHeader title="IOC" sortKey="ioc" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium">
            {row.original.ioc}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {humanize(row.original.iocType)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: () => <DataTableColumnHeader title="IP" />,
      cell: ({ row }) =>
        row.original.ipAddress ? (
          <span className="font-mono text-xs">{row.original.ipAddress}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "domain",
      header: () => <DataTableColumnHeader title="Domain" />,
      cell: ({ row }) =>
        row.original.domain ? (
          <span className="truncate text-sm">{row.original.domain}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "hash",
      header: () => <DataTableColumnHeader title="Hash" />,
      cell: ({ row }) =>
        row.original.hash ? (
          <span className="block max-w-[16ch] truncate font-mono text-xs text-muted-foreground">
            {row.original.hash}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "source",
      header: () => <DataTableColumnHeader title="Source" sortKey="source" />,
      cell: ({ row }) => <span className="text-sm">{row.original.source}</span>,
    },
    {
      accessorKey: "confidence",
      header: () => (
        <DataTableColumnHeader title="Confidence" sortKey="confidence" />
      ),
      cell: ({ row }) => (
        <ThreatConfidenceBadge value={row.original.confidence} />
      ),
    },
    {
      accessorKey: "lastSeenAt",
      header: () => (
        <DataTableColumnHeader title="Last Seen" sortKey="lastSeenAt" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelative(row.original.lastSeenAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => <DataTableColumnHeader title="Status" sortKey="status" />,
      cell: ({ row }) => <ThreatStatusBadge value={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ThreatRowActions
          threat={row.original}
          canUpdate={perms.canUpdate}
          canDelete={perms.canDelete}
        />
      ),
    },
  ];
}
