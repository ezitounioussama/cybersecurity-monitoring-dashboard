import { ok } from "@/lib/api-response";
import { apiRoute } from "@/lib/route-utils";
import { userPatchSchema } from "@/schemas/user.schema";
import { userService } from "@/services/user.service";
import type { UserRow } from "@/types/user";

export const PATCH = apiRoute<{ id: string }>("mutation", async (req, { ctx }, route) => {
  const { id } = await route.params;
  const { role, isActive } = userPatchSchema.parse(await req.json());

  let user: UserRow | undefined;
  if (role !== undefined) {
    user = await userService.updateRole(ctx, id, role);
  }
  if (isActive !== undefined) {
    user = await userService.setActive(ctx, id, isActive);
  }
  return ok(user);
});
