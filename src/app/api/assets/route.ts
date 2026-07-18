import { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { assetCreateSchema } from "@/schemas/asset.schema";
import { assetService } from "@/services/asset.service";

export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const result = await assetService.list(ctx, {
    ...params,
    criticality: asEnumArray(
      url.searchParams.get("criticality")?.split(","),
      AssetCriticality,
    ),
    status: asEnumArray(
      url.searchParams.get("status")?.split(","),
      AssetStatus,
    ),
  });
  return ok(result);
});

export const POST = apiRoute("mutation", async (req, { ctx }) => {
  const data = assetCreateSchema.parse(await req.json());
  const asset = await assetService.create(ctx, data);
  return ok(asset, { status: 201 });
});
