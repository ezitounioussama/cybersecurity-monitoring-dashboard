import type { Prisma } from "@/generated/prisma/client";
import type { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type IncidentListFilters = {
  organizationId: string;
  search?: string;
  severity?: Severity[];
  status?: IncidentStatus[];
  assignedAnalystId?: string;
  skip: number;
  take: number;
  orderBy?: Prisma.IncidentOrderByWithRelationInput;
  includeDeleted?: boolean;
};

function buildWhere(f: IncidentListFilters): Prisma.IncidentWhereInput {
  return {
    organizationId: f.organizationId,
    ...(f.includeDeleted ? {} : { deletedAt: null }),
    ...(f.severity?.length ? { severity: { in: f.severity } } : {}),
    ...(f.status?.length ? { status: { in: f.status } } : {}),
    ...(f.assignedAnalystId ? { assignedAnalystId: f.assignedAnalystId } : {}),
    ...(f.search
      ? {
          OR: [
            { title: { contains: f.search, mode: "insensitive" } },
            { description: { contains: f.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const analystSelect = {
  assignedAnalyst: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.IncidentInclude;

export const incidentRepository = {
  async list(filters: IncidentListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { createdAt: "desc" },
        include: {
          ...analystSelect,
          _count: { select: { incidentAlerts: true } },
        },
      }),
      prisma.incident.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string, organizationId: string) {
    return prisma.incident.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        assignedAnalyst: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        incidentAlerts: {
          include: {
            alert: {
              select: {
                id: true,
                title: true,
                severity: true,
                status: true,
                detectedAt: true,
              },
            },
          },
          orderBy: { linkedAt: "desc" },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  create(data: Prisma.IncidentUncheckedCreateInput) {
    return prisma.incident.create({ data });
  },

  update(id: string, data: Prisma.IncidentUncheckedUpdateInput) {
    return prisma.incident.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.incident.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  addActivity(incidentId: string, userId: string, action: string) {
    return prisma.activity.create({ data: { incidentId, userId, action } });
  },

  linkAlert(incidentId: string, alertId: string) {
    return prisma.incidentAlert.upsert({
      where: { incidentId_alertId: { incidentId, alertId } },
      update: {},
      create: { incidentId, alertId },
    });
  },

  unlinkAlert(incidentId: string, alertId: string) {
    return prisma.incidentAlert.deleteMany({ where: { incidentId, alertId } });
  },
};
