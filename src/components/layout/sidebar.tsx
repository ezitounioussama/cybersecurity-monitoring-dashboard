"use client";

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconShieldLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/enums";
import { visibleNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  const items = visibleNavItems(role);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A00] via-[#FF2D95] to-[#6F259F] text-white shadow-md">
            <IconShieldLock className="size-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">Sentinel</span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks items={items} collapsed={collapsed} />
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn("w-full justify-start gap-3 text-muted-foreground", collapsed && "justify-center px-0")}
        >
          {collapsed ? (
            <IconLayoutSidebarLeftExpand className="size-5" />
          ) : (
            <>
              <IconLayoutSidebarLeftCollapse className="size-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
