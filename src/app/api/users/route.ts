import { Role } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { userService } from "@/services/user.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const [role] = asEnumArray(url.searchParams.get("role")?.split(","), Role);
  const result = await userService.list(ctx, { ...params, role });
  return ok(result);
});
