import { AuditAction } from "@/generated/prisma/enums";
import { ok } from "@/lib/api-response";
import { asEnumArray } from "@/lib/query-utils";
import { apiRoute, parseListParams } from "@/lib/route-utils";
import { auditService } from "@/services/audit.service";

/** Read-only audit log surface — append-only by design, no mutation verbs. */
export const GET = apiRoute("read", async (_req, { ctx, url }) => {
  const params = parseListParams(url);
  const action = asEnumArray([url.searchParams.get("action") ?? ""], AuditAction).at(0);
  const entityType = url.searchParams.get("entityType") ?? undefined;
  const result = await auditService.list(ctx, { ...params, action, entityType });
  return ok(result);
});
