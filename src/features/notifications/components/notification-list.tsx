"use client";

import { IconBellOff, IconChecks } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsRead } from "@/actions/notification.actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationType } from "@/generated/prisma/enums";
import { humanize } from "@/lib/format";
import type { NotificationDTO } from "@/types/notification";
import { NotificationItem } from "./notification-item";

const ALL = "ALL";

type Props = { items: NotificationDTO[]; type?: NotificationType };

export function NotificationList({ items, type }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const hasUnread = items.some((n) => !n.isRead);

  function onTypeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete("type");
    else params.set("type", value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function onMarkAll() {
    startTransition(async () => {
      const res = await markAllNotificationsRead();
      res.success
        ? toast.success("All notifications marked as read")
        : toast.error(res.error.message);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={type ?? ALL} onValueChange={onTypeChange}>
          <SelectTrigger className="w-48" aria-label="Filter by type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {Object.values(NotificationType).map((value) => (
              <SelectItem key={value} value={value}>
                {humanize(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onMarkAll}
          disabled={pending || !hasUnread}
        >
          <IconChecks className="size-4" />
          Mark all as read
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconBellOff className="size-6" />}
          title="No notifications"
          description="You're all caught up. New notifications will appear here."
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
