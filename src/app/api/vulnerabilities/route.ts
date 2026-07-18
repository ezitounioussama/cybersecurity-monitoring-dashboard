import { PatchStatus, Severity } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { vulnerabilityCreateSchema } from "@/schemas/vulnerability.schema";
import { vulnerabilityService } from "@/services/vulnerability.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const exploit = url.searchParams.get("exploitAvailable");
  const result = await vulnerabilityService.list(ctx, {
    ...params,
    severity: asEnumArray(
      url.searchParams.get("severity")?.split(","),
      Severity,
    ),
    patchStatus: asEnumArray(
      url.searchParams.get("patchStatus")?.split(","),
      PatchStatus,
    ),
    exploitAvailable: exploit === null ? undefined : exploit === "true",
  });
  return ok(result);
});

export const POST = apiRoute("mutation", async (req, { ctx }) => {
  const data = vulnerabilityCreateSchema.parse(await req.json());
  const vuln = await vulnerabilityService.create(ctx, data);
  return ok(vuln, { status: 201 });
});
