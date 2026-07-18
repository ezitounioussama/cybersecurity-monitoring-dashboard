import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";
import { auditRepository } from "@/repositories/audit.repository";
import { assertCan } from "@/services/authorization.service";
import { logger } from "@/lib/logger";
import type { AuthContext } from "@/types/auth";
import type { ListParams } from "@/types/api";

type RecordInput = {
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export const auditService = {
  /** Write an append-only audit entry for a mutation. Never throws upward. */
  async record(ctx: AuthContext, input: RecordInput) {
    try {
      await auditRepository.create({
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        ipAddress: ctx.ipAddress,
        role: ctx.role,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
      });
    } catch (error) {
      logger.error("Failed to write audit log", {
        entityType: input.entityType,
        entityId: input.entityId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async list(ctx: AuthContext, params: ListParams & { action?: AuditAction; entityType?: string }) {
    assertCan(ctx.role, "auditLog:view");
    const { page, pageSize } = params;
    const { items, total } = await auditRepository.list({
      organizationId: ctx.organizationId,
      search: params.search,
      action: params.action,
      entityType: params.entityType,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: params.sortBy
        ? { [params.sortBy]: params.sortDir ?? "desc" }
        : undefined,
    });
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  },
};
