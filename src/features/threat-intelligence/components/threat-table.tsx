"use client";

import { useMemo } from "react";
import { IconRadar } from "@tabler/icons-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { getThreatColumns } from "@/features/threat-intelligence/components/columns";
import { IocType } from "@/generated/prisma/enums";
import { THREAT_CONFIDENCE_STYLES, THREAT_STATUS_STYLES } from "@/lib/constants";
import { formatDateTime, humanize } from "@/lib/format";
import { facetOptions } from "@/lib/query-utils";
import type { ThreatFeedRow } from "@/types/threat";

const IOC_TYPE_OPTIONS = Object.values(IocType).map((v) => ({
  label: humanize(v),
  value: v,
}));

type Props = {
  data: ThreatFeedRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  perms: { canUpdate: boolean; canDelete: boolean; canExport: boolean };
};

export function ThreatTable({ data, page, pageSize, pageCount, total, perms }: Props) {
  const columns = useMemo(
    () => getThreatColumns({ canUpdate: perms.canUpdate, canDelete: perms.canDelete }),
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
      searchPlaceholder="Search IOCs, sources, IPs…"
      facets={[
        { filterKey: "iocType", title: "Type", options: IOC_TYPE_OPTIONS },
        {
          filterKey: "confidence",
          title: "Confidence",
          options: facetOptions(THREAT_CONFIDENCE_STYLES),
        },
        { filterKey: "status", title: "Status", options: facetOptions(THREAT_STATUS_STYLES) },
      ]}
      canExport={perms.canExport}
      csv={{
        filename: "threat-intelligence",
        columns: [
          { header: "IOC", accessor: (t) => t.ioc },
          { header: "Type", accessor: (t) => t.iocType },
          { header: "IP", accessor: (t) => t.ipAddress },
          { header: "Domain", accessor: (t) => t.domain },
          { header: "Hash", accessor: (t) => t.hash },
          { header: "Source", accessor: (t) => t.source },
          { header: "Confidence", accessor: (t) => t.confidence },
          { header: "Status", accessor: (t) => t.status },
          { header: "Last Seen", accessor: (t) => formatDateTime(t.lastSeenAt) },
        ],
      }}
      emptyState={
        <EmptyState
          icon={<IconRadar className="size-6" />}
          title="No threat indicators found"
          description="No IOCs match your current filters."
        />
      }
    />
  );
}
