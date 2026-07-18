"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RoleBadge, StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuditAction } from "@/generated/prisma/enums";
import { formatDateTime, humanize } from "@/lib/format";
import type { AuditLogRow } from "@/types/audit";

const RED = "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
const AMBER =
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
const GREEN =
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
const BLUE = "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
const SLATE =
  "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
const PURPLE =
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";

/** Local action → badge styles (audit-scoped; constants.ts is shared & untouched). */
const ACTION_STYLES: Record<AuditAction, { label: string; className: string }> =
  {
    CREATE: { label: "Create", className: GREEN },
    UPDATE: { label: "Update", className: BLUE },
    DELETE: { label: "Delete", className: RED },
    LOGIN: { label: "Login", className: SLATE },
    LOGOUT: { label: "Logout", className: SLATE },
    EXPORT: { label: "Export", className: AMBER },
    ROLE_CHANGE: { label: "Role Change", className: PURPLE },
  };

export const AUDIT_ACTION_STYLES = ACTION_STYLES;

function initials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAuditColumns(): ColumnDef<AuditLogRow, unknown>[] {
  return [
    {
      id: "user",
      header: () => <DataTableColumnHeader title="User" />,
      cell: ({ row }) => {
        const { user } = row.original;
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar size="sm">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <DataTableColumnHeader title="Action" sortKey="action" />,
      cell: ({ row }) => (
        <StatusBadge style={ACTION_STYLES[row.original.action]} />
      ),
    },
    {
      id: "entity",
      header: () => <DataTableColumnHeader title="Entity" />,
      cell: ({ row }) => {
        const { entityType, entityId } = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-sm">{humanize(entityType)}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {entityId}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <DataTableColumnHeader title="Timestamp" sortKey="createdAt" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: () => <DataTableColumnHeader title="IP Address" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ipAddress}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: () => <DataTableColumnHeader title="Role" />,
      cell: ({ row }) => <RoleBadge value={row.original.role} />,
    },
  ];
}
