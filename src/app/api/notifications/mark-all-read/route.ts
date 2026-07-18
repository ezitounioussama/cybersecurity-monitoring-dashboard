import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { notificationService } from "@/services/notification.service";

export const POST = apiRoute("mutation", async (_req, { ctx }) => {
  await notificationService.markAllRead(ctx);
  return ok({ success: true });
});
