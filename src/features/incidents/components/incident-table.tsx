"use client";

import { IconShieldBolt } from "@tabler/icons-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { getIncidentColumns } from "@/features/incidents/components/columns";
import { INCIDENT_STATUS_STYLES, SEVERITY_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { facetOptions } from "@/lib/query-utils";
import type { AnalystOption, IncidentRow } from "@/types/incident";

type Props = {
  data: IncidentRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  analystOptions: AnalystOption[];
  perms: { canUpdate: boolean; canDelete: boolean; canExport: boolean };
};

export function IncidentTable({
  data,
  page,
  pageSize,
  pageCount,
  total,
  analystOptions,
  perms,
}: Props) {
  const columns = useMemo(
    () =>
      getIncidentColumns({
        canUpdate: perms.canUpdate,
        canDelete: perms.canDelete,
        analystOptions,
      }),
    [perms.canUpdate, perms.canDelete, analystOptions],
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
      searchPlaceholder="Search incidents…"
      facets={[
        {
          filterKey: "severity",
          title: "Severity",
          options: facetOptions(SEVERITY_STYLES),
        },
        {
          filterKey: "status",
          title: "Status",
          options: facetOptions(INCIDENT_STATUS_STYLES),
        },
      ]}
      canExport={perms.canExport}
      csv={{
        filename: "incidents",
        columns: [
          { header: "Title", accessor: (i) => i.title },
          { header: "Severity", accessor: (i) => i.severity },
          { header: "Status", accessor: (i) => i.status },
          {
            header: "Assignee",
            accessor: (i) => i.assignedAnalyst?.name ?? "",
          },
          { header: "Linked Alerts", accessor: (i) => i._count.incidentAlerts },
          { header: "Created", accessor: (i) => formatDate(i.createdAt) },
        ],
      }}
      emptyState={
        <EmptyState
          icon={<IconShieldBolt className="size-6" />}
          title="No incidents found"
          description="No incidents match your current filters."
        />
      }
    />
  );
}
