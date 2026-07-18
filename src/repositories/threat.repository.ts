import type { Prisma } from "@/generated/prisma/client";
import type { IocType, ThreatConfidence, ThreatStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ThreatListFilters = {
  organizationId: string;
  search?: string;
  iocType?: IocType[];
  confidence?: ThreatConfidence[];
  status?: ThreatStatus[];
  skip: number;
  take: number;
  orderBy?: Prisma.ThreatFeedOrderByWithRelationInput;
};

function buildWhere(f: ThreatListFilters): Prisma.ThreatFeedWhereInput {
  return {
    organizationId: f.organizationId,
    ...(f.iocType?.length ? { iocType: { in: f.iocType } } : {}),
    ...(f.confidence?.length ? { confidence: { in: f.confidence } } : {}),
    ...(f.status?.length ? { status: { in: f.status } } : {}),
    ...(f.search
      ? {
          OR: [
            { ioc: { contains: f.search, mode: "insensitive" } },
            { source: { contains: f.search, mode: "insensitive" } },
            { ipAddress: { contains: f.search, mode: "insensitive" } },
            { domain: { contains: f.search, mode: "insensitive" } },
            { hash: { contains: f.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const threatRepository = {
  async list(filters: ThreatListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.threatFeed.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { lastSeenAt: "desc" },
      }),
      prisma.threatFeed.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string, organizationId: string) {
    return prisma.threatFeed.findFirst({ where: { id, organizationId } });
  },

  create(data: Prisma.ThreatFeedUncheckedCreateInput) {
    return prisma.threatFeed.create({ data });
  },

  update(id: string, data: Prisma.ThreatFeedUpdateInput) {
    return prisma.threatFeed.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.threatFeed.delete({ where: { id } });
  },
};
