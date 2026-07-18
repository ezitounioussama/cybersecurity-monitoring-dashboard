import type { Prisma } from "@/generated/prisma/client";
import type { NotificationType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type NotificationListFilters = {
  organizationId: string;
  userId: string;
  type?: NotificationType;
  onlyUnread?: boolean;
  skip: number;
  take: number;
};

export const notificationRepository = {
  async list(f: NotificationListFilters) {
    const where: Prisma.NotificationWhereInput = {
      organizationId: f.organizationId,
      userId: f.userId,
      ...(f.type ? { type: f.type } : {}),
      ...(f.onlyUnread ? { isRead: false } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: f.skip,
        take: f.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, total };
  },

  recent(organizationId: string, userId: string, take = 6) {
    return prisma.notification.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  countUnread(organizationId: string, userId: string) {
    return prisma.notification.count({
      where: { organizationId, userId, isRead: false },
    });
  },

  createMany(data: Prisma.NotificationCreateManyInput[]) {
    return prisma.notification.createMany({ data });
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  markAllRead(organizationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { organizationId, userId, isRead: false },
      data: { isRead: true },
    });
  },
};
