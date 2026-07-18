"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserActive } from "@/actions/user.actions";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  isActive: boolean;
  canManage: boolean;
};

export function UserStatusToggle({ userId, isActive, canManage }: Props) {
  const [pending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    startTransition(async () => {
      const res = await setUserActive(userId, next);
      if (res.success) {
        toast.success(next ? "User activated" : "User deactivated");
      } else {
        toast.error(res.error.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={!canManage || pending}
        aria-label={isActive ? "Deactivate user" : "Activate user"}
      />
      <span
        className={cn(
          "text-sm",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
