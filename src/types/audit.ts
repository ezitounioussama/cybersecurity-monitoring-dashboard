import type { Prisma } from "@/generated/prisma/client";

/**
 * A single audit log row as returned by `audit.repository.list` — includes the
 * acting user's display fields. Append-only; there is no detail/update payload.
 */
export type AuditLogRow = Prisma.AuditLogGetPayload<{
  include: {
    user: { select: { name: true; email: true; avatarUrl: true } };
  };
}>;
