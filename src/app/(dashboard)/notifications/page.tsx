import { IconBell } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationType } from "@/generated/prisma/enums";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { getAuthContext } from "@/lib/auth";
import { readListParams, type SearchParamsInput } from "@/lib/search-params";
import { notificationService } from "@/services/notification.service";
import type { NotificationDTO } from "@/types/notification";

export const metadata: Metadata = { title: "Notifications" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const params = readListParams(sp);

  const typeParam = first(sp.type);
  const type =
    typeParam && typeParam in NotificationType
      ? (typeParam as NotificationType)
      : undefined;

  const result = await notificationService.list(ctx, {
    ...params,
    pageSize: 30,
    type,
  });

  const items: NotificationDTO[] = result.items.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alerts, incidents, and system updates addressed to you."
        icon={<IconBell className="size-5" />}
      />
      <NotificationList items={items} type={type} />
    </div>
  );
}
