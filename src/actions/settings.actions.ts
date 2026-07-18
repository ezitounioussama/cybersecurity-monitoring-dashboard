"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth";
import { actionError, actionOk, type ActionResult } from "@/lib/action-utils";
import { organizationRepository } from "@/repositories/organization.repository";
import { orgProfileSchema } from "@/schemas/settings.schema";
import { assertCan } from "@/services/authorization.service";
import { auditService } from "@/services/audit.service";

/**
 * Update the organization display name. Admin-only (`settings:manage`). The
 * service-layer guard is the security boundary — the UI disabling the field is
 * never trusted on its own (agent.md §5).
 */
export async function updateOrgName(
  name: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    assertCan(ctx.role, "settings:manage");

    const data = orgProfileSchema.parse({ name });
    await organizationRepository.update(ctx.organizationId, { name: data.name });

    await auditService.record(ctx, {
      action: "UPDATE",
      entityType: "Organization",
      entityId: ctx.organizationId,
      metadata: { name: data.name },
    });

    revalidatePath("/settings");
    return actionOk({ id: ctx.organizationId });
  } catch (error) {
    return actionError(error);
  }
}
