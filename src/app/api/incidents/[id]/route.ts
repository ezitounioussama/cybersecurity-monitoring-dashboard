import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { incidentUpdateSchema } from "@/schemas/incident.schema";
import { incidentService } from "@/services/incident.service";

export const GET = apiRoute<{ id: string }>("read", async (_req, { ctx }, route) => {
  const { id } = await route.params;
  return ok(await incidentService.getById(ctx, id));
});

export const PATCH = apiRoute<{ id: string }>("mutation", async (req, { ctx }, route) => {
  const { id } = await route.params;
  const data = incidentUpdateSchema.parse(await req.json());
  return ok(await incidentService.update(ctx, id, data));
});

export const DELETE = apiRoute<{ id: string }>("mutation", async (_req, { ctx }, route) => {
  const { id } = await route.params;
  await incidentService.remove(ctx, id);
  return ok({ id });
});
