import { IconAlertTriangle } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CreateAlertSheet } from "@/features/alerts/components/alert-form";
import { AlertTable } from "@/features/alerts/components/alert-table";
import { AlertStatus, Severity } from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import {
  readArray,
  readListParams,
  type SearchParamsInput,
} from "@/lib/search-params";
import { alertService } from "@/services/alert.service";
import { can } from "@/services/authorization.service";

export const metadata: Metadata = { title: "Alerts" };

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const result = await alertService.list(ctx, {
    ...params,
    severity: asEnumArray(readArray(sp, "severity"), Severity),
    status: asEnumArray(readArray(sp, "status"), AlertStatus),
  });

  const perms = {
    canUpdate: can(ctx.role, "alert:update"),
    canDelete: can(ctx.role, "alert:delete"),
    canExport: can(ctx.role, "export:csv"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Security alerts detected across your environment."
        icon={<IconAlertTriangle className="size-5" />}
        actions={can(ctx.role, "alert:create") ? <CreateAlertSheet /> : null}
      />
      <AlertTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        perms={perms}
      />
    </div>
  );
}
