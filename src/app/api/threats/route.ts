import {
  IocType,
  ThreatConfidence,
  ThreatStatus,
} from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { threatCreateSchema } from "@/schemas/threat.schema";
import { threatService } from "@/services/threat.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const result = await threatService.list(ctx, {
    ...params,
    iocType: asEnumArray(url.searchParams.get("iocType")?.split(","), IocType),
    confidence: asEnumArray(
      url.searchParams.get("confidence")?.split(","),
      ThreatConfidence,
    ),
    status: asEnumArray(
      url.searchParams.get("status")?.split(","),
      ThreatStatus,
    ),
  });
  return ok(result);
});

export const POST = apiRoute("mutation", async (req, { ctx }) => {
  const body = await req.json();
  const data = threatCreateSchema.parse(body);
  const threat = await threatService.create(ctx, data);
  return ok(threat, { status: 201 });
});
