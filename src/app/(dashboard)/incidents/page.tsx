import { IconPlus, IconShieldBolt } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { IncidentFormSheet } from "@/features/incidents/components/incident-form";
import { IncidentTable } from "@/features/incidents/components/incident-table";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import { readArray, readListParams, type SearchParamsInput } from "@/lib/search-params";
import { incidentService } from "@/services/incident.service";
import { can } from "@/services/authorization.service";
import { userRepository } from "@/repositories/user.repository";

export const metadata: Metadata = { title: "Incidents" };

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const [result, analysts] = await Promise.all([
    incidentService.list(ctx, {
      ...params,
      severity: asEnumArray(readArray(sp, "severity"), Severity),
      status: asEnumArray(readArray(sp, "status"), IncidentStatus),
    }),
    userRepository.listForOptions(ctx.organizationId),
  ]);

  const analystOptions = analysts.map((a) => ({ id: a.id, name: a.name }));
  const perms = {
    canUpdate: can(ctx.role, "incident:update"),
    canDelete: can(ctx.role, "incident:delete"),
    canExport: can(ctx.role, "export:csv"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        description="Coordinate investigation and response."
        icon={<IconShieldBolt className="size-5" />}
        actions={
          can(ctx.role, "incident:create") ? (
            <IncidentFormSheet
              analystOptions={analystOptions}
              trigger={
                <Button size="sm">
                  <IconPlus className="size-4" /> New incident
                </Button>
              }
            />
          ) : null
        }
      />
      <IncidentTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        analystOptions={analystOptions}
        perms={perms}
      />
    </div>
  );
}
