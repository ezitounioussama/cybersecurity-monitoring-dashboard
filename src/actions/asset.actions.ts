"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, actionError, actionOk } from "@/lib/action-utils";
import { getAuthContext } from "@/lib/auth";
import { assetCreateSchema, assetUpdateSchema } from "@/schemas/asset.schema";
import { assetService } from "@/services/asset.service";

export async function createAsset(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = assetCreateSchema.parse(input);
    const asset = await assetService.create(ctx, data);
    revalidatePath("/assets");
    return actionOk({ id: asset.id });
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAsset(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    const data = assetUpdateSchema.parse(input);
    await assetService.update(ctx, id, data);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAsset(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    await assetService.remove(ctx, id);
    revalidatePath("/assets");
    return actionOk({ id });
  } catch (error) {
    return actionError(error);
  }
}
