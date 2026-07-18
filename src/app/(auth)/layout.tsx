import { IconShieldLock } from "@tabler/icons-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--color-primary)_22%,transparent),transparent)]"
      />
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A00] via-[#FF2D95] to-[#6F259F] text-white shadow-lg">
          <IconShieldLock className="size-6" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight">Sentinel</p>
          <p className="text-xs text-muted-foreground">SOC Monitoring</p>
        </div>
      </div>
      {children}
    </div>
  );
}
