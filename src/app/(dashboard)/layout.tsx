import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getAuthContextOrNull } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await getAuthContextOrNull();
  if (!ctx) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={ctx.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={ctx.role} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
