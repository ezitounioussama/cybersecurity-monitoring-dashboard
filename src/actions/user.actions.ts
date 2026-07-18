"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";
import { type ActionResult, actionError, actionOk } from "@/lib/action-utils";
import { getAuthContext } from "@/lib/auth";
import { userActiveSchema, userRoleSchema } from "@/schemas/user.schema";
import { userService } from "@/services/user.service";

export async function updateUserRole(
  id: string,
  role: Role,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const { role: parsed } = userRoleSchema.parse({ role });
    await userService.updateRole(ctx, id, parsed);
    revalidatePath("/users");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const { isActive: parsed } = userActiveSchema.parse({ isActive });
    await userService.setActive(ctx, id, parsed);
    revalidatePath("/users");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}
