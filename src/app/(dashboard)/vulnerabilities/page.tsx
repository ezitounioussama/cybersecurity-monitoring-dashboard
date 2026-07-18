import { IconBug, IconPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { VulnerabilityFormSheet } from "@/features/vulnerabilities/components/vulnerability-form";
import { VulnerabilityTable } from "@/features/vulnerabilities/components/vulnerability-table";
import { PatchStatus, Severity } from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import {
  readArray,
  readListParams,
  type SearchParamsInput,
} from "@/lib/search-params";
import { assetService } from "@/services/asset.service";
import { can } from "@/services/authorization.service";
import { vulnerabilityService } from "@/services/vulnerability.service";

export const metadata: Metadata = { title: "Vulnerabilities" };

function readExploit(sp: SearchParamsInput): boolean | undefined {
  const values = readArray(sp, "exploitAvailable");
  if (values.length !== 1) return undefined;
  return values[0] === "true";
}

export default async function VulnerabilitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const [result, assetOptions] = await Promise.all([
    vulnerabilityService.list(ctx, {
      ...params,
      severity: asEnumArray(readArray(sp, "severity"), Severity),
      patchStatus: asEnumArray(readArray(sp, "patchStatus"), PatchStatus),
      exploitAvailable: readExploit(sp),
    }),
    assetService.options(ctx),
  ]);

  const canManage = can(ctx.role, "vulnerability:create");
  const assets = assetOptions.map((a) => ({ id: a.id, hostname: a.hostname }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vulnerabilities"
        description="Known CVEs across your asset inventory."
        icon={<IconBug className="size-5" />}
        actions={
          canManage ? (
            <VulnerabilityFormSheet
              assetOptions={assets}
              trigger={
                <Button size="sm">
                  <IconPlus className="size-4" /> Add vulnerability
                </Button>
              }
            />
          ) : null
        }
      />
      <VulnerabilityTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        assetOptions={assets}
        perms={{ canManage, canExport: can(ctx.role, "export:csv") }}
      />
    </div>
  );
}
