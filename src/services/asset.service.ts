import type { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { orderByFrom, paginated } from "@/lib/query-utils";
import { assetRepository } from "@/repositories/asset.repository";
import type {
  AssetCreateInput,
  AssetUpdateInput,
} from "@/schemas/asset.schema";
import { auditService } from "@/services/audit.service";
import { assertCan } from "@/services/authorization.service";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

const SORTABLE = [
  "hostname",
  "ipAddress",
  "operatingSystem",
  "criticality",
  "status",
  "lastScanAt",
];

type AssetFilters = {
  criticality?: AssetCriticality[];
  status?: AssetStatus[];
};

export const assetService = {
  async list(ctx: AuthContext, params: ListParams & AssetFilters) {
    const { page, pageSize } = params;
    const { items, total } = await assetRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      criticality: params.criticality,
      status: params.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderByFrom(params.sortBy, params.sortDir, SORTABLE, {
        hostname: "asc",
      }),
    });
    return paginated(items, total, page, pageSize);
  },

  async getById(ctx: AuthContext, id: string) {
    const asset = await assetRepository.findById(id, ctx.organizationId);
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  },

  options(ctx: AuthContext) {
    return assetRepository.listForOptions(ctx.organizationId);
  },

  async create(ctx: AuthContext, input: AssetCreateInput) {
    assertCan(ctx.role, "asset:create");
    const asset = await assetRepository.create({
      organizationId: ctx.organizationId,
      hostname: input.hostname,
      ipAddress: input.ipAddress,
      operatingSystem: input.operatingSystem,
      criticality: input.criticality,
      status: input.status,
      ownerId: input.ownerId,
      lastScanAt: input.lastScanAt,
    });
    await auditService.record(ctx, {
      action: "CREATE",
      entityType: "Asset",
      entityId: asset.id,
      metadata: { hostname: asset.hostname, criticality: asset.criticality },
    });
    return asset;
  },

  async update(ctx: AuthContext, id: string, input: AssetUpdateInput) {
    assertCan(ctx.role, "asset:update");
    await this.getById(ctx, id);
    const asset = await assetRepository.update(id, input);
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "Asset",
      entityId: id,
    });
    return asset;
  },

  async remove(ctx: AuthContext, id: string) {
    assertCan(ctx.role, "asset:delete");
    await this.getById(ctx, id);
    await assetRepository.softDelete(id);
    await auditService.record(ctx, {
      action: "DELETE",
      entityType: "Asset",
      entityId: id,
    });
  },
};
