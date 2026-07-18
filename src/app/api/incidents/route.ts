import { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { incidentCreateSchema } from "@/schemas/incident.schema";
import { incidentService } from "@/services/incident.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const result = await incidentService.list(ctx, {
    ...params,
    severity: asEnumArray(
      url.searchParams.get("severity")?.split(","),
      Severity,
    ),
    status: asEnumArray(
      url.searchParams.get("status")?.split(","),
      IncidentStatus,
    ),
  });
  return ok(result);
});

export const POST = apiRoute("mutation", async (req, { ctx }) => {
  const data = incidentCreateSchema.parse(await req.json());
  const incident = await incidentService.create(ctx, data);
  return ok(incident, { status: 201 });
});
