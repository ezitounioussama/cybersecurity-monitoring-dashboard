"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RoleBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRoleSelect } from "@/features/users/components/user-role-select";
import { UserStatusToggle } from "@/features/users/components/user-status-toggle";
import { formatRelative } from "@/lib/format";
import type { UserRow } from "@/types/user";

/** First letters of the first two words, e.g. "Jane Doe" → "JD". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || "?").toUpperCase();
}

export function getUserColumns(perms: {
  canManage: boolean;
}): ColumnDef<UserRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: () => <DataTableColumnHeader title="Name" sortKey="name" />,
      cell: ({ row }) => {
        const { name, avatarUrl } = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="sm">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => <DataTableColumnHeader title="Email" sortKey="email" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: () => <DataTableColumnHeader title="Role" sortKey="role" />,
      cell: ({ row }) =>
        perms.canManage ? (
          <UserRoleSelect
            userId={row.original.id}
            role={row.original.role}
            canManage={perms.canManage}
          />
        ) : (
          <RoleBadge value={row.original.role} />
        ),
    },
    {
      accessorKey: "isActive",
      header: () => <DataTableColumnHeader title="Status" />,
      cell: ({ row }) => (
        <UserStatusToggle
          userId={row.original.id}
          isActive={row.original.isActive}
          canManage={perms.canManage}
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <DataTableColumnHeader title="Last active" sortKey="updatedAt" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelative(row.original.updatedAt)}
        </span>
      ),
    },
  ];
}
