import { IconFileText } from "@tabler/icons-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { AuditTable } from "@/features/audit-logs/components/audit-table";
import { AuditAction } from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import {
  readArray,
  readListParams,
  type SearchParamsInput,
} from "@/lib/search-params";
import { auditService } from "@/services/audit.service";
import { can } from "@/services/authorization.service";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const ctx = await getAuthContext();
  if (ctx.role === "VIEWER") redirect("/dashboard");

  const sp = await searchParams;
  const params = readListParams(sp);
  const action = asEnumArray(readArray(sp, "action"), AuditAction).at(0);

  const result = await auditService.list(ctx, { ...params, action });
  const canExport = can(ctx.role, "export:csv");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of every sensitive action."
        icon={<IconFileText className="size-5" />}
      />
      <AuditTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        canExport={canExport}
      />
    </div>
  );
}
