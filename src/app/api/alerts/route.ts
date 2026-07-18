import { AlertStatus, Severity } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { alertCreateSchema } from "@/schemas/alert.schema";
import { alertService } from "@/services/alert.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const result = await alertService.list(ctx, {
    ...params,
    severity: asEnumArray(url.searchParams.get("severity")?.split(","), Severity),
    status: asEnumArray(url.searchParams.get("status")?.split(","), AlertStatus),
  });
  return ok(result);
});

export const POST = apiRoute("mutation", async (req, { ctx }) => {
  const body = await req.json();
  const data = alertCreateSchema.parse(body);
  const alert = await alertService.create(ctx, data);
  return ok(alert, { status: 201 });
});
