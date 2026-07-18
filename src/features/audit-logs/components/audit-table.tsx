"use client";

import { IconFileText } from "@tabler/icons-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AUDIT_ACTION_STYLES,
  getAuditColumns,
} from "@/features/audit-logs/components/columns";
import { AuditAction } from "@/generated/prisma/enums";
import { formatDateTime, humanize } from "@/lib/format";
import type { AuditLogRow } from "@/types/audit";

type Props = {
  data: AuditLogRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  canExport: boolean;
};

const ACTION_OPTIONS = Object.keys(AuditAction).map((value) => ({
  value,
  label: AUDIT_ACTION_STYLES[value as AuditAction]?.label ?? humanize(value),
}));

export function AuditTable({
  data,
  page,
  pageSize,
  pageCount,
  total,
  canExport,
}: Props) {
  const columns = useMemo(() => getAuditColumns(), []);

  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      pageCount={pageCount}
      total={total}
      getRowId={(row) => row.id}
      searchPlaceholder="Search by entity or user…"
      facets={[
        { filterKey: "action", title: "Action", options: ACTION_OPTIONS },
      ]}
      canExport={canExport}
      csv={{
        filename: "audit-logs",
        columns: [
          { header: "User", accessor: (a) => a.user.name },
          { header: "Action", accessor: (a) => a.action },
          { header: "Entity Type", accessor: (a) => a.entityType },
          { header: "Entity Id", accessor: (a) => a.entityId },
          { header: "IP", accessor: (a) => a.ipAddress },
          { header: "Role", accessor: (a) => a.role },
          { header: "Timestamp", accessor: (a) => formatDateTime(a.createdAt) },
        ],
      }}
      emptyState={
        <EmptyState
          icon={<IconFileText className="size-6" />}
          title="No audit entries found"
          description="No audit log entries match your current filters."
        />
      }
    />
  );
}
