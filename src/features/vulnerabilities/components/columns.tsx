"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { IconFlame } from "@tabler/icons-react";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { PatchStatusBadge } from "@/components/shared/status-badge";
import { CvssScore } from "@/features/vulnerabilities/components/cvss-score";
import { VulnerabilityRowActions } from "@/features/vulnerabilities/components/vulnerability-row-actions";
import { formatDate } from "@/lib/format";
import type { VulnerabilityRow } from "@/types/vulnerability";

export function getVulnerabilityColumns(opts: {
  canManage: boolean;
  assetOptions: { id: string; hostname: string }[];
}): ColumnDef<VulnerabilityRow, unknown>[] {
  return [
    {
      accessorKey: "cve",
      header: () => <DataTableColumnHeader title="CVE" sortKey="cve" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium">{row.original.cve}</p>
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "cvssScore",
      header: () => <DataTableColumnHeader title="CVSS" sortKey="cvssScore" />,
      cell: ({ row }) => <CvssScore score={row.original.cvssScore} />,
    },
    {
      accessorKey: "severity",
      header: () => <DataTableColumnHeader title="Severity" sortKey="severity" />,
      cell: ({ row }) => <SeverityBadge value={row.original.severity} />,
    },
    {
      id: "asset",
      header: () => <DataTableColumnHeader title="Asset" />,
      cell: ({ row }) => (
        <Link href={`/assets/${row.original.asset.id}`} className="text-sm hover:underline">
          {row.original.asset.hostname}
        </Link>
      ),
    },
    {
      accessorKey: "patchStatus",
      header: () => <DataTableColumnHeader title="Patch" sortKey="patchStatus" />,
      cell: ({ row }) => <PatchStatusBadge value={row.original.patchStatus} />,
    },
    {
      id: "exploit",
      header: () => <DataTableColumnHeader title="Exploit" />,
      cell: ({ row }) =>
        row.original.exploitAvailable ? (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
            <IconFlame className="size-4" /> Available
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        ),
    },
    {
      accessorKey: "discoveredAt",
      header: () => <DataTableColumnHeader title="Discovered" sortKey="discoveredAt" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.discoveredAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <VulnerabilityRowActions
          vulnerability={row.original}
          assetOptions={opts.assetOptions}
          canManage={opts.canManage}
        />
      ),
    },
  ];
}
