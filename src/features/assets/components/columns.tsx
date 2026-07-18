"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CriticalityBadge } from "@/components/shared/severity-badge";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AssetRowActions } from "@/features/assets/components/asset-row-actions";
import { formatRelative, initials } from "@/lib/format";
import type { AssetRow } from "@/types/asset";

export function getAssetColumns(opts: {
  canManage: boolean;
  ownerOptions: { id: string; name: string }[];
}): ColumnDef<AssetRow, unknown>[] {
  return [
    {
      accessorKey: "hostname",
      header: () => (
        <DataTableColumnHeader title="Hostname" sortKey="hostname" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/assets/${row.original.id}`}
          className="min-w-0 hover:underline"
        >
          <p className="truncate font-medium">{row.original.hostname}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.operatingSystem}
          </p>
        </Link>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: () => (
        <DataTableColumnHeader title="IP address" sortKey="ipAddress" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.ipAddress}</span>
      ),
    },
    {
      accessorKey: "criticality",
      header: () => (
        <DataTableColumnHeader title="Criticality" sortKey="criticality" />
      ),
      cell: ({ row }) => <CriticalityBadge value={row.original.criticality} />,
    },
    {
      id: "owner",
      header: () => <DataTableColumnHeader title="Owner" />,
      cell: ({ row }) => {
        const owner = row.original.owner;
        if (!owner) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={owner.avatarUrl ?? undefined}
                alt={owner.name}
              />
              <AvatarFallback className="text-[10px]">
                {initials(owner.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{owner.name}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <DataTableColumnHeader title="Status" sortKey="status" />,
      cell: ({ row }) => <AssetStatusBadge value={row.original.status} />,
    },
    {
      accessorKey: "lastScanAt",
      header: () => (
        <DataTableColumnHeader title="Last scan" sortKey="lastScanAt" />
      ),
      cell: ({ row }) =>
        row.original.lastScanAt ? (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatRelative(row.original.lastScanAt)}
          </span>
        ) : (
          <span className="text-muted-foreground">Never</span>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <AssetRowActions
          asset={row.original}
          ownerOptions={opts.ownerOptions}
          canManage={opts.canManage}
        />
      ),
    },
  ];
}
