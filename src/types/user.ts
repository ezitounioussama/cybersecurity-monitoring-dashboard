import type { Prisma } from "@/generated/prisma/client";

/** A user row as returned by the list/detail queries (all scalar fields). */
export type UserRow = Prisma.UserGetPayload<Record<string, never>>;
