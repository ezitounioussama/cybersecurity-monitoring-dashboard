import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { userService } from "@/services/user.service";

export async function POST(req: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(req);
  } catch (error) {
    logger.warn("Clerk webhook verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data;
      const email =
        data.email_addresses.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ??
        data.email_addresses[0]?.email_address ??
        "unknown@example.com";
      await userService.syncFromWebhook({
        clerkUserId: data.id,
        email,
        name:
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          data.username ||
          email,
        avatarUrl: data.image_url,
        role: (data.public_metadata?.role as string | undefined) ?? null,
      });
    } else if (event.type === "user.deleted" && event.data.id) {
      await userService.deactivateByClerkUserId(event.data.id);
    }
  } catch (error) {
    logger.error("Clerk webhook handling failed", {
      type: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
