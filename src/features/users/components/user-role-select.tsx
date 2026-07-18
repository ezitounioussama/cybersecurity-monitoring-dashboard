"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/user.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/generated/prisma/enums";
import { ROLE_STYLES } from "@/lib/constants";

type Props = {
  userId: string;
  role: Role;
  canManage: boolean;
};

export function UserRoleSelect({ userId, role, canManage }: Props) {
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    const nextRole = next as Role;
    if (nextRole === role) return;
    startTransition(async () => {
      const res = await updateUserRole(userId, nextRole);
      if (res.success) {
        toast.success(`Role updated to ${ROLE_STYLES[nextRole].label}`);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  return (
    <Select
      value={role}
      onValueChange={handleChange}
      disabled={!canManage || pending}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Role).map((value) => (
          <SelectItem key={value} value={value}>
            {ROLE_STYLES[value].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
