"use server";

import { revalidatePath } from "next/cache";
import type { AlertStatus } from "@/generated/prisma/enums";
import { type ActionResult, actionError, actionOk } from "@/lib/action-utils";
import { getAuthContext } from "@/lib/auth";
import {
  alertCreateSchema,
  alertStatusSchema,
  alertUpdateSchema,
} from "@/schemas/alert.schema";
import { alertService } from "@/services/alert.service";

export async function createAlert(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = alertCreateSchema.parse(input);
    const alert = await alertService.create(ctx, data);
    revalidatePath("/alerts");
    return actionOk({ id: alert.id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAlert(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = alertUpdateSchema.parse(input);
    await alertService.update(ctx, id, data);
    revalidatePath("/alerts");
    revalidatePath(`/alerts/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAlertStatus(
  id: string,
  status: AlertStatus,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const { status: parsed } = alertStatusSchema.parse({ status });
    await alertService.updateStatus(ctx, id, parsed);
    revalidatePath("/alerts");
    revalidatePath(`/alerts/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAlert(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    await alertService.remove(ctx, id);
    revalidatePath("/alerts");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}
