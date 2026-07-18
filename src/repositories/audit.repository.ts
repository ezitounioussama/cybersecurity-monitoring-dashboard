import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AuditListFilters = {
  organizationId: string;
  search?: string;
  action?: Prisma.AuditLogWhereInput["action"];
  entityType?: string;
  skip: number;
  take: number;
  orderBy?: Prisma.AuditLogOrderByWithRelationInput;
};

/** Append-only — no update/delete methods by design (design.md §6.7). */
export const auditRepository = {
  create(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({ data });
  },

  async list({
    organizationId,
    search,
    action,
    entityType,
    skip,
    take,
    orderBy,
  }: AuditListFilters) {
    const where: Prisma.AuditLogWhereInput = {
      organizationId,
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
      ...(search
        ? {
            OR: [
              { entityId: { contains: search, mode: "insensitive" } },
              { entityType: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, avatarUrl: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  },
};
