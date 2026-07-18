import type { NotificationType } from "@/generated/prisma/enums";
import { paginated } from "@/lib/query-utils";
import { notificationRepository } from "@/repositories/notification.repository";
import { userRepository } from "@/repositories/user.repository";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

type NotifyInput = {
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export const notificationService = {
  /** Fan a notification out to every active member of an organization. */
  async notifyOrganization(organizationId: string, input: NotifyInput) {
    const userIds =
      await userRepository.activeIdsByOrganization(organizationId);
    if (userIds.length === 0) return;
    await notificationRepository.createMany(
      userIds.map((userId) => ({
        organizationId,
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
      })),
    );
  },

  async recentForBell(ctx: AuthContext) {
    const [items, unreadCount] = await Promise.all([
      notificationRepository.recent(ctx.organizationId, ctx.userId),
      notificationRepository.countUnread(ctx.organizationId, ctx.userId),
    ]);
    return { items, unreadCount };
  },

  async list(
    ctx: AuthContext,
    params: ListParams & { type?: NotificationType; onlyUnread?: boolean },
  ) {
    const { page, pageSize } = params;
    const { items, total } = await notificationRepository.list({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      type: params.type,
      onlyUnread: params.onlyUnread,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return paginated(items, total, page, pageSize);
  },

  markRead(ctx: AuthContext, id: string) {
    return notificationRepository.markRead(id, ctx.userId);
  },

  markAllRead(ctx: AuthContext) {
    return notificationRepository.markAllRead(ctx.organizationId, ctx.userId);
  },
};
