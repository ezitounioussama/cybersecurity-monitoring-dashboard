import type { Prisma } from "@/generated/prisma/client";
import type { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type AssetListFilters = {
  organizationId: string;
  search?: string;
  criticality?: AssetCriticality[];
  status?: AssetStatus[];
  skip: number;
  take: number;
  orderBy?: Prisma.AssetOrderByWithRelationInput;
  includeDeleted?: boolean;
};

function buildWhere(f: AssetListFilters): Prisma.AssetWhereInput {
  return {
    organizationId: f.organizationId,
    ...(f.includeDeleted ? {} : { deletedAt: null }),
    ...(f.criticality?.length ? { criticality: { in: f.criticality } } : {}),
    ...(f.status?.length ? { status: { in: f.status } } : {}),
    ...(f.search
      ? {
          OR: [
            { hostname: { contains: f.search, mode: "insensitive" } },
            { ipAddress: { contains: f.search, mode: "insensitive" } },
            { operatingSystem: { contains: f.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const ownerSelect = {
  owner: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.AssetInclude;

export const assetRepository = {
  async list(filters: AssetListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { hostname: "asc" },
        include: {
          ...ownerSelect,
          _count: { select: { vulnerabilities: true, alerts: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string, organizationId: string) {
    return prisma.asset.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        vulnerabilities: { orderBy: { cvssScore: "desc" }, take: 50 },
        alerts: {
          where: { deletedAt: null },
          orderBy: { detectedAt: "desc" },
          take: 20,
        },
      },
    });
  },

  listForOptions(organizationId: string) {
    return prisma.asset.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true, hostname: true, ipAddress: true },
      orderBy: { hostname: "asc" },
    });
  },

  create(data: Prisma.AssetUncheckedCreateInput) {
    return prisma.asset.create({ data });
  },

  update(id: string, data: Prisma.AssetUpdateInput) {
    return prisma.asset.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
