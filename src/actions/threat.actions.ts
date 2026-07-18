"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, actionError, actionOk } from "@/lib/action-utils";
import { getAuthContext } from "@/lib/auth";
import {
  threatCreateSchema,
  threatUpdateSchema,
} from "@/schemas/threat.schema";
import { threatService } from "@/services/threat.service";

export async function createThreat(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = threatCreateSchema.parse(input);
    const threat = await threatService.create(ctx, data);
    revalidatePath("/threat-intelligence");
    return actionOk({ id: threat.id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateThreat(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = threatUpdateSchema.parse(input);
    await threatService.update(ctx, id, data);
    revalidatePath("/threat-intelligence");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteThreat(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    await threatService.remove(ctx, id);
    revalidatePath("/threat-intelligence");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}
