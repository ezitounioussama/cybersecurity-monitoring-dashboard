"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth";
import { actionError, actionOk, type ActionResult } from "@/lib/action-utils";
import { notificationService } from "@/services/notification.service";

export async function markNotificationRead(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    await notificationService.markRead(ctx, id);
    revalidatePath("/notifications");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult<{ success: true }>> {
  try {
    const ctx = await getAuthContext();
    await notificationService.markAllRead(ctx);
    revalidatePath("/notifications");
    return actionOk({ success: true });
  } catch (error) {
    return actionError(error);
  }
}
