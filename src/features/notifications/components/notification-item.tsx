"use client";

import {
  IconAlertTriangle,
  IconBellRinging,
  IconBug,
  IconCheck,
  type IconProps,
  IconServer,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { type ComponentType, useTransition } from "react";
import { toast } from "sonner";
import { markNotificationRead } from "@/actions/notification.actions";
import { Button } from "@/components/ui/button";
import type { NotificationType } from "@/generated/prisma/enums";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationDTO } from "@/types/notification";

const ICONS: Record<NotificationType, ComponentType<IconProps>> = {
  ALERT: IconAlertTriangle,
  INCIDENT: IconBellRinging,
  VULNERABILITY: IconBug,
  SYSTEM: IconServer,
  USER: IconUser,
};

/** Build an in-app route for a related entity, if it maps to a known page. */
function entityHref(type: string | null, id: string | null): string | null {
  if (!type) return null;
  switch (type) {
    case "Alert":
      return id ? `/alerts/${id}` : null;
    case "Incident":
      return id ? `/incidents/${id}` : null;
    case "Vulnerability":
      return "/vulnerabilities";
    default:
      return null;
  }
}

export function NotificationItem({
  notification,
}: {
  notification: NotificationDTO;
}) {
  const [pending, startTransition] = useTransition();
  const Icon = ICONS[notification.type];
  const href = entityHref(
    notification.relatedEntityType,
    notification.relatedEntityId,
  );

  function onMarkRead() {
    startTransition(async () => {
      const res = await markNotificationRead(notification.id);
      res.success
        ? toast.success("Marked as read")
        : toast.error(res.error.message);
    });
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-4 py-4",
        !notification.isRead && "bg-accent/40",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {!notification.isRead && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
          {href ? (
            <Link
              href={href}
              className="truncate text-sm font-medium hover:underline"
            >
              {notification.title}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium">{notification.title}</p>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatRelative(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={onMarkRead}
          disabled={pending}
        >
          <IconCheck className="size-3.5" />
          Mark as read
        </Button>
      )}
    </li>
  );
}
