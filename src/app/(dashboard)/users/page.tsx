import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma/enums";
import { UserTable } from "@/features/users/components/user-table";
import { getAuthContext } from "@/lib/auth";
import { asEnumArray } from "@/lib/query-utils";
import { readArray, readListParams, type SearchParamsInput } from "@/lib/search-params";
import { can } from "@/services/authorization.service";
import { userService } from "@/services/user.service";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const ctx = await getAuthContext();
  if (!can(ctx.role, "user:manage")) redirect("/dashboard");

  const sp = await searchParams;
  const params = readListParams(sp);
  const [role] = asEnumArray(readArray(sp, "role"), Role);

  const result = await userService.list(ctx, { ...params, role });

  const perms = {
    canManage: can(ctx.role, "user:manage"),
    canExport: can(ctx.role, "export:csv"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members, roles, and account status. Invitations are sent through Clerk."
        icon={<IconUsers className="size-5" />}
        actions={
          <Button variant="outline" size="sm" disabled>
            <IconUserPlus className="size-4" /> Invite via Clerk
          </Button>
        }
      />
      <UserTable
        data={result.items}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        total={result.total}
        perms={perms}
      />
    </div>
  );
}
