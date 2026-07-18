import type { Prisma } from "@/generated/prisma/client";
import type { AlertStatus, Severity } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type AlertListFilters = {
  organizationId: string;
  search?: string;
  severity?: Severity[];
  status?: AlertStatus[];
  skip: number;
  take: number;
  orderBy?: Prisma.AlertOrderByWithRelationInput;
  includeDeleted?: boolean;
};

function buildWhere(f: AlertListFilters): Prisma.AlertWhereInput {
  return {
    organizationId: f.organizationId,
    ...(f.includeDeleted ? {} : { deletedAt: null }),
    ...(f.severity?.length ? { severity: { in: f.severity } } : {}),
    ...(f.status?.length ? { status: { in: f.status } } : {}),
    ...(f.search
      ? {
          OR: [
            { title: { contains: f.search, mode: "insensitive" } },
            { rule: { contains: f.search, mode: "insensitive" } },
            { source: { contains: f.search, mode: "insensitive" } },
            { sourceIp: { contains: f.search, mode: "insensitive" } },
            { destinationIp: { contains: f.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const withAsset = {
  destinationAsset: { select: { id: true, hostname: true, ipAddress: true } },
} satisfies Prisma.AlertInclude;

export const alertRepository = {
  async list(filters: AlertListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { detectedAt: "desc" },
        include: withAsset,
      }),
      prisma.alert.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string, organizationId: string) {
    return prisma.alert.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        ...withAsset,
        incidentAlerts: {
          include: { incident: { select: { id: true, title: true, status: true } } },
        },
      },
    });
  },

  create(data: Prisma.AlertUncheckedCreateInput) {
    return prisma.alert.create({ data });
  },

  update(id: string, data: Prisma.AlertUpdateInput) {
    return prisma.alert.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
