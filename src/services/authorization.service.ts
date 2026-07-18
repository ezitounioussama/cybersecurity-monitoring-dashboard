import type { Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/errors";

/**
 * Central permission matrix (design.md §4). The service layer is the security
 * boundary — the UI hiding a button is never trusted on its own.
 */
export type Permission =
  | "alert:create"
  | "alert:update"
  | "alert:delete"
  | "incident:create"
  | "incident:update"
  | "incident:delete"
  | "asset:create"
  | "asset:update"
  | "asset:delete"
  | "vulnerability:create"
  | "vulnerability:update"
  | "vulnerability:delete"
  | "threat:create"
  | "threat:update"
  | "threat:delete"
  | "user:manage"
  | "auditLog:view"
  | "export:csv"
  | "settings:manage";

const MATRIX: Record<Permission, Role[]> = {
  "alert:create": ["ADMIN"],
  "alert:update": ["ADMIN", "ANALYST"],
  "alert:delete": ["ADMIN"],
  "incident:create": ["ADMIN", "ANALYST"],
  "incident:update": ["ADMIN", "ANALYST"],
  "incident:delete": ["ADMIN"],
  "asset:create": ["ADMIN"],
  "asset:update": ["ADMIN"],
  "asset:delete": ["ADMIN"],
  "vulnerability:create": ["ADMIN"],
  "vulnerability:update": ["ADMIN"],
  "vulnerability:delete": ["ADMIN"],
  "threat:create": ["ADMIN"],
  "threat:update": ["ADMIN"],
  "threat:delete": ["ADMIN"],
  "user:manage": ["ADMIN"],
  "auditLog:view": ["ADMIN", "ANALYST"],
  "export:csv": ["ADMIN", "ANALYST"],
  "settings:manage": ["ADMIN"],
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[permission].includes(role);
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError(
      `Role ${role} is not permitted to ${permission.replace(":", " ")}`,
    );
  }
}
