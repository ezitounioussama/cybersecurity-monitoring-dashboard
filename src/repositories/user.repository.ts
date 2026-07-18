import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type UserListFilters = {
  organizationId: string;
  search?: string;
  role?: Role;
  isActive?: boolean;
  skip: number;
  take: number;
  orderBy?: Prisma.UserOrderByWithRelationInput;
  includeDeleted?: boolean;
};

export const userRepository = {
  findByClerkUserId(clerkUserId: string) {
    return prisma.user.findUnique({ where: { clerkUserId } });
  },

  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  countByOrganization(organizationId: string) {
    return prisma.user.count({
      where: { organizationId, deletedAt: null },
    });
  },

  async activeIdsByOrganization(organizationId: string) {
    const rows = await prisma.user.findMany({
      where: { organizationId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },

  listForOptions(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId, deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  async list({
    organizationId,
    search,
    role,
    isActive,
    skip,
    take,
    orderBy,
    includeDeleted,
  }: UserListFilters) {
    const where: Prisma.UserWhereInput = {
      organizationId,
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(role ? { role } : {}),
      ...(isActive === undefined ? {} : { isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },
};
