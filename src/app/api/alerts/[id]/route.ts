import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { alertUpdateSchema } from "@/schemas/alert.schema";
import { alertService } from "@/services/alert.service";

export const GET = apiRoute<{ id: string }>(
  "read",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    const alert = await alertService.getById(ctx, id);
    return ok(alert);
  },
);

export const PATCH = apiRoute<{ id: string }>(
  "mutation",
  async (req, { ctx }, route) => {
    const { id } = await route.params;
    const data = alertUpdateSchema.parse(await req.json());
    const alert = await alertService.update(ctx, id, data);
    return ok(alert);
  },
);

export const DELETE = apiRoute<{ id: string }>(
  "mutation",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    await alertService.remove(ctx, id);
    return ok({ id });
  },
);
