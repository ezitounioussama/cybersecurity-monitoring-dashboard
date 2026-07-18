import type { AlertStatus, Severity } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { orderByFrom } from "@/lib/query-utils";
import { paginated } from "@/lib/query-utils";
import { alertRepository } from "@/repositories/alert.repository";
import { assertCan } from "@/services/authorization.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import type { AlertCreateInput, AlertUpdateInput } from "@/schemas/alert.schema";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

const SORTABLE = ["title", "severity", "status", "source", "detectedAt", "createdAt"];

type AlertFilters = { severity?: Severity[]; status?: AlertStatus[] };

export const alertService = {
  async list(ctx: AuthContext, params: ListParams & AlertFilters) {
    const { page, pageSize } = params;
    const { items, total } = await alertRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      severity: params.severity,
      status: params.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderByFrom(params.sortBy, params.sortDir, SORTABLE, {
        detectedAt: "desc",
      }),
    });
    return paginated(items, total, page, pageSize);
  },

  async getById(ctx: AuthContext, id: string) {
    const alert = await alertRepository.findById(id, ctx.organizationId);
    if (!alert) throw new NotFoundError("Alert not found");
    return alert;
  },

  async create(ctx: AuthContext, input: AlertCreateInput) {
    assertCan(ctx.role, "alert:create");
    const alert = await alertRepository.create({
      organizationId: ctx.organizationId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: input.status,
      source: input.source,
      rule: input.rule,
      sourceIp: input.sourceIp,
      destinationIp: input.destinationIp,
      destinationAssetId: input.destinationAssetId,
      rawLog: input.rawLog,
      detectedAt: input.detectedAt,
    });
    await auditService.record(ctx, {
      action: "CREATE",
      entityType: "Alert",
      entityId: alert.id,
      metadata: { severity: alert.severity, source: alert.source },
    });
    if (alert.severity === "HIGH" || alert.severity === "CRITICAL") {
      await notificationService.notifyOrganization(ctx.organizationId, {
        type: "ALERT",
        title: `New ${alert.severity.toLowerCase()} alert`,
        message: alert.title,
        relatedEntityType: "Alert",
        relatedEntityId: alert.id,
      });
    }
    return alert;
  },

  async update(ctx: AuthContext, id: string, input: AlertUpdateInput) {
    assertCan(ctx.role, "alert:update");
    await this.getById(ctx, id);
    const alert = await alertRepository.update(id, input);
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "Alert",
      entityId: id,
    });
    return alert;
  },

  async updateStatus(ctx: AuthContext, id: string, status: AlertStatus) {
    assertCan(ctx.role, "alert:update");
    await this.getById(ctx, id);
    const alert = await alertRepository.update(id, {
      status,
      resolvedAt: status === "RESOLVED" ? new Date() : null,
    });
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "Alert",
      entityId: id,
      metadata: { status },
    });
    return alert;
  },

  async remove(ctx: AuthContext, id: string) {
    assertCan(ctx.role, "alert:delete");
    await this.getById(ctx, id);
    await alertRepository.softDelete(id);
    await auditService.record(ctx, {
      action: "DELETE",
      entityType: "Alert",
      entityId: id,
    });
  },
};
