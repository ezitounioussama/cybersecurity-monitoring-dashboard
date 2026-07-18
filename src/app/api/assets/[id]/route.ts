import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { assetUpdateSchema } from "@/schemas/asset.schema";
import { assetService } from "@/services/asset.service";

export const GET = apiRoute<{ id: string }>(
  "read",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    return ok(await assetService.getById(ctx, id));
  },
);

export const PATCH = apiRoute<{ id: string }>(
  "mutation",
  async (req, { ctx }, route) => {
    const { id } = await route.params;
    const data = assetUpdateSchema.parse(await req.json());
    return ok(await assetService.update(ctx, id, data));
  },
);

export const DELETE = apiRoute<{ id: string }>(
  "mutation",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    await assetService.remove(ctx, id);
    return ok({ id });
  },
);
