"use client";

import { IconServer2 } from "@tabler/icons-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { AssetBulkActions } from "@/features/assets/components/asset-bulk-actions";
import { getAssetColumns } from "@/features/assets/components/columns";
import { ASSET_CRITICALITY_STYLES, ASSET_STATUS_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { facetOptions } from "@/lib/query-utils";
import type { AssetRow } from "@/types/asset";

type Props = {
  data: AssetRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  ownerOptions: { id: string; name: string }[];
  perms: { canManage: boolean; canExport: boolean };
};

export function AssetTable({
  data,
  page,
  pageSize,
  pageCount,
  total,
  ownerOptions,
  perms,
}: Props) {
  const columns = useMemo(
    () => getAssetColumns({ canManage: perms.canManage, ownerOptions }),
    [perms.canManage, ownerOptions],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      pageCount={pageCount}
      total={total}
      getRowId={(row) => row.id}
      searchPlaceholder="Search hostname, IP, OS…"
      facets={[
        {
          filterKey: "criticality",
          title: "Criticality",
          options: facetOptions(ASSET_CRITICALITY_STYLES),
        },
        {
          filterKey: "status",
          title: "Status",
          options: facetOptions(ASSET_STATUS_STYLES),
        },
      ]}
      canExport={perms.canExport}
      csv={{
        filename: "assets",
        columns: [
          { header: "Hostname", accessor: (a) => a.hostname },
          { header: "IP Address", accessor: (a) => a.ipAddress },
          { header: "Operating System", accessor: (a) => a.operatingSystem },
          { header: "Criticality", accessor: (a) => a.criticality },
          { header: "Status", accessor: (a) => a.status },
          { header: "Owner", accessor: (a) => a.owner?.name ?? "" },
          {
            header: "Last Scan",
            accessor: (a) => (a.lastScanAt ? formatDate(a.lastScanAt) : ""),
          },
        ],
      }}
      bulkActions={
        perms.canManage
          ? (rows, clear) => <AssetBulkActions rows={rows} clear={clear} />
          : undefined
      }
      emptyState={
        <EmptyState
          icon={<IconServer2 className="size-6" />}
          title="No assets found"
          description="No assets match your current filters."
        />
      }
    />
  );
}
