import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { vulnerabilityUpdateSchema } from "@/schemas/vulnerability.schema";
import { vulnerabilityService } from "@/services/vulnerability.service";

export const GET = apiRoute<{ id: string }>(
  "read",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    return ok(await vulnerabilityService.getById(ctx, id));
  },
);

export const PATCH = apiRoute<{ id: string }>(
  "mutation",
  async (req, { ctx }, route) => {
    const { id } = await route.params;
    const data = vulnerabilityUpdateSchema.parse(await req.json());
    return ok(await vulnerabilityService.update(ctx, id, data));
  },
);

export const DELETE = apiRoute<{ id: string }>(
  "mutation",
  async (_req, { ctx }, route) => {
    const { id } = await route.params;
    await vulnerabilityService.remove(ctx, id);
    return ok({ id });
  },
);
