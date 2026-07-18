"use client";

import { IconMenu2, IconShieldLock } from "@tabler/icons-react";
import { useState } from "react";
import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Role } from "@/generated/prisma/enums";
import { visibleNavItems } from "@/lib/navigation";

export function MobileSidebar({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 md:hidden" aria-label="Open menu">
          <IconMenu2 className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A00] via-[#FF2D95] to-[#6F259F] text-white">
            <IconShieldLock className="size-5" />
          </div>
          <SheetTitle className="text-lg font-semibold tracking-tight">
            Sentinel
          </SheetTitle>
        </div>
        <div className="py-2">
          <NavLinks items={visibleNavItems(role)} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
