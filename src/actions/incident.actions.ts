"use server";

import { revalidatePath } from "next/cache";
import type { IncidentStatus } from "@/generated/prisma/enums";
import { getAuthContext } from "@/lib/auth";
import { actionError, actionOk, type ActionResult } from "@/lib/action-utils";
import {
  incidentAssignSchema,
  incidentCreateSchema,
  incidentLinkAlertSchema,
  incidentStatusSchema,
  incidentUpdateSchema,
} from "@/schemas/incident.schema";
import { incidentService } from "@/services/incident.service";

export async function createIncident(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = incidentCreateSchema.parse(input);
    const incident = await incidentService.create(ctx, data);
    revalidatePath("/incidents");
    return actionOk({ id: incident.id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateIncident(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = incidentUpdateSchema.parse(input);
    await incidentService.update(ctx, id, data);
    revalidatePath("/incidents");
    revalidatePath(`/incidents/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const { status: parsed } = incidentStatusSchema.parse({ status });
    await incidentService.updateStatus(ctx, id, parsed);
    revalidatePath("/incidents");
    revalidatePath(`/incidents/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function assignIncident(id: string, analystId: string | null): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const { assignedAnalystId } = incidentAssignSchema.parse({ assignedAnalystId: analystId });
    await incidentService.assign(ctx, id, assignedAnalystId);
    revalidatePath(`/incidents/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function linkAlertToIncident(id: string, alertId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const parsed = incidentLinkAlertSchema.parse({ alertId });
    await incidentService.linkAlert(ctx, id, parsed.alertId);
    revalidatePath(`/incidents/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function unlinkAlertFromIncident(id: string, alertId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const parsed = incidentLinkAlertSchema.parse({ alertId });
    await incidentService.unlinkAlert(ctx, id, parsed.alertId);
    revalidatePath(`/incidents/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteIncident(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    await incidentService.remove(ctx, id);
    revalidatePath("/incidents");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}
