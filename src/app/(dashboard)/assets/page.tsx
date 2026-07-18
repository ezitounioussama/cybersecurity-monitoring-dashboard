import { IconPlus, IconServer2 } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AssetFormSheet } from "@/features/assets/components/asset-form";
import { AssetTable } from "@/features/assets/components/asset-table";
import { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import {
  readArray,
  readListParams,
  type SearchParamsInput,
} from "@/lib/search-params";
import { userRepository } from "@/repositories/user.repository";
import { assetService } from "@/services/asset.service";
import { can } from "@/services/authorization.service";

export const metadata: Metadata = { title: "Assets" };

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const [result, ownerOptions] = await Promise.all([
    assetService.list(ctx, {
      ...params,
      criticality: asEnumArray(readArray(sp, "criticality"), AssetCriticality),
      status: asEnumArray(readArray(sp, "status"), AssetStatus),
    }),
    userRepository.listForOptions(ctx.organizationId),
  ]);

  const canManage = can(ctx.role, "asset:create");
  const owners = ownerOptions.map((o) => ({ id: o.id, name: o.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Inventory of hosts and devices in your environment."
        icon={<IconServer2 className="size-5" />}
        actions={
          canManage ? (
            <AssetFormSheet
              ownerOptions={owners}
              trigger={
                <Button size="sm">
                  <IconPlus className="size-4" /> Add asset
                </Button>
              }
            />
          ) : null
        }
      />
      <AssetTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        ownerOptions={owners}
        perms={{ canManage, canExport: can(ctx.role, "export:csv") }}
      />
    </div>
  );
}
