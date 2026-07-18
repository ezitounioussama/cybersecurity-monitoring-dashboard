/**
 * Lightweight in-memory fixed-window rate limiter for API routes.
 * v1 is per-instance (no external store) — swap the Map for Redis/Upstash
 * behind this same interface if horizontal scaling is added later.
 */
type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(identifier, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    success: existing.count <= limit,
    limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

/** Stricter defaults for mutation endpoints vs. reads (API conventions §7). */
export const RATE_LIMITS = {
  read: { limit: 120, windowMs: 60_000 },
  mutation: { limit: 30, windowMs: 60_000 },
} as const;
