"use client";

import { useMemo } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertBulkActions } from "@/features/alerts/components/alert-bulk-actions";
import { getAlertColumns } from "@/features/alerts/components/columns";
import { ALERT_STATUS_STYLES, SEVERITY_STYLES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { facetOptions } from "@/lib/query-utils";
import type { AlertWithAsset } from "@/types/alert";

type Props = {
  data: AlertWithAsset[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  perms: { canUpdate: boolean; canDelete: boolean; canExport: boolean };
};

export function AlertTable({ data, page, pageSize, pageCount, total, perms }: Props) {
  const columns = useMemo(
    () => getAlertColumns({ canUpdate: perms.canUpdate, canDelete: perms.canDelete }),
    [perms.canUpdate, perms.canDelete],
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
      searchPlaceholder="Search alerts, rules, IPs…"
      facets={[
        { filterKey: "severity", title: "Severity", options: facetOptions(SEVERITY_STYLES) },
        { filterKey: "status", title: "Status", options: facetOptions(ALERT_STATUS_STYLES) },
      ]}
      canExport={perms.canExport}
      csv={{
        filename: "alerts",
        columns: [
          { header: "Severity", accessor: (a) => a.severity },
          { header: "Status", accessor: (a) => a.status },
          { header: "Title", accessor: (a) => a.title },
          { header: "Source", accessor: (a) => a.source },
          { header: "Rule", accessor: (a) => a.rule },
          { header: "Source IP", accessor: (a) => a.sourceIp },
          { header: "Destination IP", accessor: (a) => a.destinationIp },
          { header: "Detected", accessor: (a) => formatDateTime(a.detectedAt) },
        ],
      }}
      bulkActions={
        perms.canUpdate || perms.canDelete
          ? (rows, clear) => (
              <AlertBulkActions
                rows={rows}
                clear={clear}
                canUpdate={perms.canUpdate}
                canDelete={perms.canDelete}
              />
            )
          : undefined
      }
      emptyState={
        <EmptyState
          icon={<IconAlertTriangle className="size-6" />}
          title="No alerts found"
          description="No alerts match your current filters."
        />
      }
    />
  );
}
