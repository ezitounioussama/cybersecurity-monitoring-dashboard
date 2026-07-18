import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/generated/prisma/enums";

export function Topbar({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <MobileSidebar role={role} />
      <div className="flex flex-1 items-center gap-2">
        <GlobalSearch role={role} />
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
        <div className="hidden sm:block">
          <OrganizationSwitcher
            hidePersonal
            appearance={{ elements: { rootBox: "flex items-center" } }}
          />
        </div>
        <UserButton
          appearance={{ elements: { avatarBox: "size-8" } }}
        />
      </div>
    </header>
  );
}
