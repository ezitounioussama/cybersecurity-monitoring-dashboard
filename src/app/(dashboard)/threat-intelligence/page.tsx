import { IconRadar } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ThreatFormSheet } from "@/features/threat-intelligence/components/threat-form";
import { ThreatTable } from "@/features/threat-intelligence/components/threat-table";
import {
  IocType,
  ThreatConfidence,
  ThreatStatus,
} from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import {
  readArray,
  readListParams,
  type SearchParamsInput,
} from "@/lib/search-params";
import { can } from "@/services/authorization.service";
import { threatService } from "@/services/threat.service";

export const metadata: Metadata = { title: "Threat Intelligence" };

export default async function ThreatIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const result = await threatService.list(ctx, {
    ...params,
    iocType: asEnumArray(readArray(sp, "iocType"), IocType),
    confidence: asEnumArray(readArray(sp, "confidence"), ThreatConfidence),
    status: asEnumArray(readArray(sp, "status"), ThreatStatus),
  });

  const perms = {
    canUpdate: can(ctx.role, "threat:update"),
    canDelete: can(ctx.role, "threat:delete"),
    canExport: can(ctx.role, "export:csv"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Threat Intelligence"
        description="Indicators of compromise tracked across your threat feeds."
        icon={<IconRadar className="size-5" />}
        actions={can(ctx.role, "threat:create") ? <ThreatFormSheet /> : null}
      />
      <ThreatTable
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
