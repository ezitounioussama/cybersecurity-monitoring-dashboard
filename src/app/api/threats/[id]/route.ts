import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { threatUpdateSchema } from "@/schemas/threat.schema";
import { threatService } from "@/services/threat.service";

export const GET = apiRoute<{ id: string }>("read", async (_req, { ctx }, route) => {
  const { id } = await route.params;
  const threat = await threatService.getById(ctx, id);
  return ok(threat);
});

export const PATCH = apiRoute<{ id: string }>("mutation", async (req, { ctx }, route) => {
  const { id } = await route.params;
  const data = threatUpdateSchema.parse(await req.json());
  const threat = await threatService.update(ctx, id, data);
  return ok(threat);
});

export const DELETE = apiRoute<{ id: string }>("mutation", async (_req, { ctx }, route) => {
  const { id } = await route.params;
  await threatService.remove(ctx, id);
  return ok({ id });
});
