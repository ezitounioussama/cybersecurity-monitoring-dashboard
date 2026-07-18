import type { IocType, ThreatConfidence, ThreatStatus } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { orderByFrom, paginated } from "@/lib/query-utils";
import { threatRepository } from "@/repositories/threat.repository";
import { assertCan } from "@/services/authorization.service";
import { auditService } from "@/services/audit.service";
import type { ThreatCreateInput, ThreatUpdateInput } from "@/schemas/threat.schema";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

const SORTABLE = ["ioc", "source", "confidence", "status", "lastSeenAt", "createdAt"];

type ThreatFilters = {
  iocType?: IocType[];
  confidence?: ThreatConfidence[];
  status?: ThreatStatus[];
};

export const threatService = {
  async list(ctx: AuthContext, params: ListParams & ThreatFilters) {
    const { page, pageSize } = params;
    const { items, total } = await threatRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      iocType: params.iocType,
      confidence: params.confidence,
      status: params.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderByFrom(params.sortBy, params.sortDir, SORTABLE, {
        lastSeenAt: "desc",
      }),
    });
    return paginated(items, total, page, pageSize);
  },

  async getById(ctx: AuthContext, id: string) {
    const threat = await threatRepository.findById(id, ctx.organizationId);
    if (!threat) throw new NotFoundError("Threat feed entry not found");
    return threat;
  },

  async create(ctx: AuthContext, input: ThreatCreateInput) {
    assertCan(ctx.role, "threat:create");
    const threat = await threatRepository.create({
      organizationId: ctx.organizationId,
      ioc: input.ioc,
      iocType: input.iocType,
      ipAddress: input.ipAddress,
      domain: input.domain,
      hash: input.hash,
      source: input.source,
      confidence: input.confidence,
      status: input.status,
      lastSeenAt: input.lastSeenAt,
    });
    await auditService.record(ctx, {
      action: "CREATE",
      entityType: "ThreatFeed",
      entityId: threat.id,
      metadata: { iocType: threat.iocType, source: threat.source },
    });
    return threat;
  },

  async update(ctx: AuthContext, id: string, input: ThreatUpdateInput) {
    assertCan(ctx.role, "threat:update");
    await this.getById(ctx, id);
    const threat = await threatRepository.update(id, input);
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "ThreatFeed",
      entityId: id,
    });
    return threat;
  },

  async remove(ctx: AuthContext, id: string) {
    assertCan(ctx.role, "threat:delete");
    await this.getById(ctx, id);
    await threatRepository.delete(id);
    await auditService.record(ctx, {
      action: "DELETE",
      entityType: "ThreatFeed",
      entityId: id,
    });
  },
};
