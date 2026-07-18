import type { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { humanize } from "@/lib/format";
import { orderByFrom, paginated } from "@/lib/query-utils";
import { incidentRepository } from "@/repositories/incident.repository";
import { userRepository } from "@/repositories/user.repository";
import { assertCan } from "@/services/authorization.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import type {
  IncidentCreateInput,
  IncidentUpdateInput,
} from "@/schemas/incident.schema";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

const SORTABLE = ["title", "severity", "status", "createdAt", "updatedAt"];

type IncidentFilters = { severity?: Severity[]; status?: IncidentStatus[] };

export const incidentService = {
  async list(ctx: AuthContext, params: ListParams & IncidentFilters) {
    const { page, pageSize } = params;
    const { items, total } = await incidentRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      severity: params.severity,
      status: params.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderByFrom(params.sortBy, params.sortDir, SORTABLE, { createdAt: "desc" }),
    });
    return paginated(items, total, page, pageSize);
  },

  async getById(ctx: AuthContext, id: string) {
    const incident = await incidentRepository.findById(id, ctx.organizationId);
    if (!incident) throw new NotFoundError("Incident not found");
    return incident;
  },

  async create(ctx: AuthContext, input: IncidentCreateInput) {
    assertCan(ctx.role, "incident:create");
    const incident = await incidentRepository.create({
      organizationId: ctx.organizationId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: input.status,
      assignedAnalystId: input.assignedAnalystId,
      evidenceUrls: input.evidenceUrls,
    });
    await incidentRepository.addActivity(incident.id, ctx.userId, "created the incident");
    await auditService.record(ctx, {
      action: "CREATE",
      entityType: "Incident",
      entityId: incident.id,
      metadata: { severity: incident.severity },
    });
    if (incident.severity === "CRITICAL") {
      await notificationService.notifyOrganization(ctx.organizationId, {
        type: "INCIDENT",
        title: "New critical incident",
        message: incident.title,
        relatedEntityType: "Incident",
        relatedEntityId: incident.id,
      });
    }
    return incident;
  },

  async update(ctx: AuthContext, id: string, input: IncidentUpdateInput) {
    assertCan(ctx.role, "incident:update");
    await this.getById(ctx, id);
    const incident = await incidentRepository.update(id, input);
    await auditService.record(ctx, { action: "UPDATE", entityType: "Incident", entityId: id });
    return incident;
  },

  async updateStatus(ctx: AuthContext, id: string, status: IncidentStatus) {
    assertCan(ctx.role, "incident:update");
    await this.getById(ctx, id);
    const incident = await incidentRepository.update(id, { status });
    await incidentRepository.addActivity(id, ctx.userId, `changed status to ${humanize(status)}`);
    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "Incident",
      entityId: id,
      metadata: { status },
    });
    return incident;
  },

  async assign(ctx: AuthContext, id: string, assignedAnalystId: string | null) {
    assertCan(ctx.role, "incident:update");
    await this.getById(ctx, id);
    const incident = await incidentRepository.update(id, { assignedAnalystId });
    const analyst = assignedAnalystId ? await userRepository.findById(assignedAnalystId) : null;
    await incidentRepository.addActivity(
      id,
      ctx.userId,
      analyst ? `assigned the incident to ${analyst.name}` : "unassigned the incident",
    );
    await auditService.record(ctx, { action: "UPDATE", entityType: "Incident", entityId: id });
    return incident;
  },

  async linkAlert(ctx: AuthContext, id: string, alertId: string) {
    assertCan(ctx.role, "incident:update");
    await this.getById(ctx, id);
    await incidentRepository.linkAlert(id, alertId);
    await incidentRepository.addActivity(id, ctx.userId, "linked an alert");
    await auditService.record(ctx, { action: "UPDATE", entityType: "Incident", entityId: id });
  },

  async unlinkAlert(ctx: AuthContext, id: string, alertId: string) {
    assertCan(ctx.role, "incident:update");
    await this.getById(ctx, id);
    await incidentRepository.unlinkAlert(id, alertId);
    await incidentRepository.addActivity(id, ctx.userId, "unlinked an alert");
    await auditService.record(ctx, { action: "UPDATE", entityType: "Incident", entityId: id });
  },

  async remove(ctx: AuthContext, id: string) {
    assertCan(ctx.role, "incident:delete");
    await this.getById(ctx, id);
    await incidentRepository.softDelete(id);
    await auditService.record(ctx, { action: "DELETE", entityType: "Incident", entityId: id });
  },
};
