import { NotificationType } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { notificationService } from "@/services/notification.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  if (url.searchParams.get("scope") === "recent") {
    return ok(await notificationService.recentForBell(ctx));
  }
  const params = parseListParams(url);
  const typeParam = url.searchParams.get("type");
  const type =
    typeParam && typeParam in NotificationType
      ? (typeParam as NotificationType)
      : undefined;
  const result = await notificationService.list(ctx, {
    ...params,
    type,
    onlyUnread: url.searchParams.get("unread") === "1",
  });
  return ok(result);
});
