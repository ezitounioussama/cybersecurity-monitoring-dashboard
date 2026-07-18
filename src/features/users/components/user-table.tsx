"use client";

import { IconUsers } from "@tabler/icons-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserColumns } from "@/features/users/components/columns";
import { ROLE_STYLES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { facetOptions } from "@/lib/query-utils";
import type { UserRow } from "@/types/user";

type Props = {
  data: UserRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  perms: { canManage: boolean; canExport: boolean };
};

export function UserTable({
  data,
  page,
  pageSize,
  pageCount,
  total,
  perms,
}: Props) {
  const columns = useMemo(
    () => getUserColumns({ canManage: perms.canManage }),
    [perms.canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      pageCount={pageCount}
      total={total}
      getRowId={(row) => row.id}
      searchPlaceholder="Search users by name or email…"
      facets={[
        {
          filterKey: "role",
          title: "Role",
          options: facetOptions(ROLE_STYLES),
        },
      ]}
      canExport={perms.canExport}
      csv={{
        filename: "users",
        columns: [
          { header: "Name", accessor: (u) => u.name },
          { header: "Email", accessor: (u) => u.email },
          { header: "Role", accessor: (u) => ROLE_STYLES[u.role].label },
          {
            header: "Status",
            accessor: (u) => (u.isActive ? "Active" : "Inactive"),
          },
          { header: "Created", accessor: (u) => formatDateTime(u.createdAt) },
        ],
      }}
      emptyState={
        <EmptyState
          icon={<IconUsers className="size-6" />}
          title="No users found"
          description="No users match your current filters."
        />
      }
    />
  );
}
