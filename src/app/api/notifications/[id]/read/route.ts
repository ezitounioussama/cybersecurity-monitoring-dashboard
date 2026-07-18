import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { notificationService } from "@/services/notification.service";

export const POST = apiRoute<{ id: string }>(
  "mutation",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    await notificationService.markRead(ctx, id);
    return ok({ id });
  },
);
