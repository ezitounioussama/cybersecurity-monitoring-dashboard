import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ERROR_CODES, fail } from "@/lib/api-response";
import { getAuthContext } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import type { ListParams } from "@/types/api";
import type { AuthContext } from "@/types/auth";

export function parseListParams(url: URL): ListParams {
  const maxPageSize = PAGE_SIZE_OPTIONS.at(-1) ?? 100;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const requested = Number(
    url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, requested || DEFAULT_PAGE_SIZE),
  );
  const sort = url.searchParams.get("sort");
  const [sortBy, sortDir] = sort?.split(".") ?? [];
  return {
    page,
    pageSize,
    search: url.searchParams.get("q") ?? undefined,
    sortBy: sortBy || undefined,
    sortDir: sortDir === "asc" || sortDir === "desc" ? sortDir : undefined,
  };
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return fail({
      code: ERROR_CODES.VALIDATION,
      message: "Invalid request.",
      details: error.flatten().fieldErrors,
    });
  }
  if (error instanceof AppError) {
    return fail({
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }
  logger.error("Unhandled API error", {
    error: error instanceof Error ? error.message : String(error),
  });
  return fail({ code: ERROR_CODES.INTERNAL, message: "Something went wrong." });
}

type RouteHelpers = { ctx: AuthContext; url: URL };
type RouteHandler<P> = (
  req: NextRequest,
  helpers: RouteHelpers,
  route: { params: Promise<P> },
) => Promise<Response>;

/** Wrap a route handler with auth, per-user rate limiting, and error translation. */
export function apiRoute<P = Record<string, never>>(
  kind: "read" | "mutation",
  handler: RouteHandler<P>,
) {
  return async (req: NextRequest, route: { params: Promise<P> }) => {
    try {
      const ctx = await getAuthContext();
      const limits =
        kind === "mutation" ? RATE_LIMITS.mutation : RATE_LIMITS.read;
      const rl = rateLimit(`${ctx.userId}:${kind}`, limits);
      if (!rl.success) {
        return fail(
          { code: ERROR_CODES.RATE_LIMITED, message: "Too many requests." },
          429,
        );
      }
      return await handler(req, { ctx, url: new URL(req.url) }, route);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
